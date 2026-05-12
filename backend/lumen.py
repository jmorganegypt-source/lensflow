"""LUMEN — consumer app for recording and sharing video messages with loved ones.
Lives in the same backend codebase but is a separate brand with its own users and data.
"""
from __future__ import annotations

import os
import uuid
import asyncio
import base64
import logging
import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional, Literal, List

import bcrypt
import jwt
from bson import ObjectId
from fastapi import APIRouter, Request, Response, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field

from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout, CheckoutSessionRequest, CheckoutSessionResponse, CheckoutStatusResponse,
)

logger = logging.getLogger("lumen")

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
JWT_ALG = "HS256"
ACCESS_MIN = 60 * 24 * 7  # 7 days
TRIAL_DAYS = 7
FREE_MINUTES_PER_MONTH = 10

OCCASIONS = [
    {"id": "birthday",      "label": "Happy Birthday",      "emoji": "🎂", "tone": "warm and celebratory"},
    {"id": "anniversary",   "label": "Anniversary",         "emoji": "💞", "tone": "tender and romantic"},
    {"id": "thank_you",     "label": "Thank You",           "emoji": "🙏", "tone": "grateful and sincere"},
    {"id": "sorry",         "label": "I'm Sorry",           "emoji": "🤍", "tone": "humble and heartfelt"},
    {"id": "congrats",      "label": "Congratulations",     "emoji": "🎉", "tone": "proud and joyful"},
    {"id": "miss_you",      "label": "Miss You",            "emoji": "✨", "tone": "soft and longing"},
    {"id": "i_love_you",    "label": "I Love You",          "emoji": "💌", "tone": "tender and bright"},
    {"id": "good_luck",     "label": "Good Luck",           "emoji": "🍀", "tone": "encouraging and bold"},
    {"id": "get_well",      "label": "Get Well Soon",       "emoji": "🌷", "tone": "gentle and hopeful"},
    {"id": "graduation",    "label": "Graduation",          "emoji": "🎓", "tone": "proud and inspiring"},
    {"id": "just_because",  "label": "Just Because",        "emoji": "🌈", "tone": "playful and warm"},
]

LOOKS = [
    {"id": "natural",   "label": "Natural",        "css_filter": "none"},
    {"id": "glow",      "label": "Golden Glow",    "css_filter": "brightness(1.08) saturate(1.15) contrast(1.05)"},
    {"id": "soft",      "label": "Soft Light",     "css_filter": "brightness(1.12) contrast(0.95) blur(0.3px)"},
    {"id": "warm",      "label": "Warm Sunset",    "css_filter": "sepia(0.35) saturate(1.2) hue-rotate(-10deg)"},
    {"id": "vibrant",   "label": "Vibrant",        "css_filter": "saturate(1.4) contrast(1.1)"},
    {"id": "vintage",   "label": "Vintage Film",   "css_filter": "sepia(0.5) contrast(1.1) brightness(0.95)"},
    {"id": "noir",      "label": "Noir",           "css_filter": "grayscale(1) contrast(1.2)"},
    {"id": "dreamy",    "label": "Dreamy Bloom",   "css_filter": "brightness(1.1) saturate(1.2) blur(0.6px)"},
]

MUSIC_TRACKS = [
    {"id": "sunrise",     "label": "Sunrise Acoustic",     "mood": "warm",       "duration": 180},
    {"id": "heartbeat",   "label": "Heartbeat Piano",      "mood": "tender",     "duration": 165},
    {"id": "celebrate",   "label": "Celebrate Pop",        "mood": "uplifting",  "duration": 150},
    {"id": "lofi_hug",    "label": "Lofi Hug",             "mood": "cozy",       "duration": 200},
    {"id": "fireworks",   "label": "Fireworks Strings",    "mood": "epic",       "duration": 195},
    {"id": "lullaby",     "label": "Lullaby Guitar",       "mood": "gentle",     "duration": 180},
    {"id": "summer",      "label": "Summer Ukulele",       "mood": "playful",    "duration": 170},
    {"id": "starlight",   "label": "Starlight Synth",      "mood": "dreamy",     "duration": 210},
    {"id": "none",        "label": "No music",             "mood": "—",          "duration": 0},
]

BACKGROUNDS = [
    {"id": "none",        "label": "Just me",      "url": None},
    {"id": "sunset",      "label": "Sunset Beach", "url": "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1600&q=80"},
    {"id": "cafe",        "label": "Cosy Café",    "url": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1600&q=80"},
    {"id": "garden",      "label": "Spring Garden","url": "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1600&q=80"},
    {"id": "fairy",       "label": "Fairy Lights", "url": "https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=1600&q=80"},
    {"id": "studio",      "label": "Soft Studio",  "url": "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&q=80"},
    {"id": "city",        "label": "City Window",  "url": "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1600&q=80"},
    {"id": "confetti",    "label": "Confetti",     "url": "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1600&q=80"},
]

# Time packs in USD; minutes_total credited to user on purchase
TIME_PACKS = {
    "lumen_1h":  {"amount": 9.90,  "currency": "usd", "minutes": 60,  "label": "1 hour"},
    "lumen_2h":  {"amount": 17.90, "currency": "usd", "minutes": 120, "label": "2 hours"},
    "lumen_3h":  {"amount": 24.95, "currency": "usd", "minutes": 180, "label": "3 hours"},
}
SUBSCRIPTIONS = {
    "lumen_nowm": {"amount": 5.00, "currency": "usd", "label": "No Watermark · Monthly"},
}

# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class LumenRegisterReq(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1, max_length=80)


class LumenLoginReq(BaseModel):
    email: EmailStr
    password: str


class ScriptReq(BaseModel):
    occasion: str
    recipient_name: str = Field(min_length=1, max_length=80)
    your_name: str = Field(default="", max_length=80)
    notes: str = Field(default="", max_length=400)
    length: Literal["short", "medium", "long"] = "medium"


class MomentCreate(BaseModel):
    occasion: str
    recipient_name: str
    script: str
    look_id: str = "natural"
    music_id: str = "none"
    background_id: str = "none"
    voice_id: Optional[str] = None
    recording_url: Optional[str] = None
    duration_seconds: int = 0


class MomentUpdate(BaseModel):
    script: Optional[str] = None
    look_id: Optional[str] = None
    music_id: Optional[str] = None
    background_id: Optional[str] = None
    voice_id: Optional[str] = None
    recording_url: Optional[str] = None
    duration_seconds: Optional[int] = None
    sent: Optional[bool] = None
    sent_to_email: Optional[EmailStr] = None


class SendMoment(BaseModel):
    recipient_email: EmailStr
    sender_note: str = Field(default="", max_length=400)


class TTSReq(BaseModel):
    text: str = Field(min_length=1, max_length=1500)
    voice_id: str


class LumenCheckoutReq(BaseModel):
    package_id: str
    origin_url: str


# ---------------------------------------------------------------------------
# Helpers (module-private — uses singletons injected via init())
# ---------------------------------------------------------------------------
_state = {"db": None, "secret": "", "frontend": "", "emergent": "", "eleven": None, "stripe": "", "resend_send": None, "resend_from": ""}


def init(*, db, jwt_secret: str, frontend_url: str, emergent_key: str, eleven_client, stripe_key: str, resend_send, resend_from: str):
    _state["db"] = db
    _state["secret"] = jwt_secret
    _state["frontend"] = frontend_url
    _state["emergent"] = emergent_key
    _state["eleven"] = eleven_client
    _state["stripe"] = stripe_key
    _state["resend_send"] = resend_send  # callable(to, subject, html)
    _state["resend_from"] = resend_from


def _db():
    return _state["db"]


def _hash(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()


def _verify(p: str, h: str) -> bool:
    try:
        return bcrypt.checkpw(p.encode(), h.encode())
    except Exception:
        return False


def _mk_token(user_id: str, email: str) -> str:
    return jwt.encode({
        "sub": user_id, "email": email, "scope": "lumen",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_MIN),
    }, _state["secret"], algorithm=JWT_ALG)


def _set_cookie(response: Response, token: str):
    response.set_cookie("lumen_token", token, httponly=True, secure=False, samesite="lax",
                        max_age=ACCESS_MIN * 60, path="/")


def _to_aware_utc(dt):
    if dt and getattr(dt, "tzinfo", None) is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def _serialize_user(u: dict) -> dict:
    trial_until = _to_aware_utc(u.get("trial_until"))
    in_trial = trial_until is not None and trial_until > datetime.now(timezone.utc)
    return {
        "id": str(u["_id"]),
        "email": u["email"],
        "name": u.get("name", ""),
        "minutes_used_period": u.get("minutes_used_period", 0),
        "minutes_credit": u.get("minutes_credit", 0),
        "watermark_subscription": u.get("watermark_subscription", False),
        "trial_until": trial_until.isoformat() if trial_until else None,
        "in_trial": in_trial,
        "created_at": u.get("created_at").isoformat() if isinstance(u.get("created_at"), datetime) else u.get("created_at"),
    }


async def get_current_lumen_user(request: Request) -> dict:
    token = request.cookies.get("lumen_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, _state["secret"], algorithms=[JWT_ALG])
        if payload.get("scope") != "lumen":
            raise HTTPException(status_code=401, detail="Invalid token scope")
        u = await _db().lumen_users.find_one({"_id": ObjectId(payload["sub"])})
        if not u:
            raise HTTPException(status_code=401, detail="User not found")
        return u
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def _stripe(request: Request) -> StripeCheckout:
    host = str(request.base_url).rstrip("/")
    return StripeCheckout(api_key=_state["stripe"], webhook_url=f"{host}/api/lumen/webhook/stripe")


# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------
router = APIRouter(prefix="/api/lumen", tags=["lumen"])


# ---------- Auth ----------
@router.post("/auth/register")
async def lumen_register(req: LumenRegisterReq, response: Response):
    email = req.email.lower().strip()
    if await _db().lumen_users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    now = datetime.now(timezone.utc)
    doc = {
        "email": email,
        "password_hash": _hash(req.password),
        "name": req.name.strip(),
        "minutes_used_period": 0,
        "minutes_credit": 0,
        "watermark_subscription": False,
        "trial_until": now + timedelta(days=TRIAL_DAYS),
        "period_started_at": now,
        "created_at": now,
    }
    res = await _db().lumen_users.insert_one(doc)
    u = await _db().lumen_users.find_one({"_id": res.inserted_id})
    token = _mk_token(str(u["_id"]), u["email"])
    _set_cookie(response, token)
    return {"user": _serialize_user(u), "access_token": token}


@router.post("/auth/login")
async def lumen_login(req: LumenLoginReq, response: Response):
    email = req.email.lower().strip()
    u = await _db().lumen_users.find_one({"email": email})
    if not u or not _verify(req.password, u["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = _mk_token(str(u["_id"]), u["email"])
    _set_cookie(response, token)
    return {"user": _serialize_user(u), "access_token": token}


@router.post("/auth/logout")
async def lumen_logout(response: Response, _u=Depends(get_current_lumen_user)):
    response.delete_cookie("lumen_token", path="/")
    return {"success": True}


@router.get("/auth/me")
async def lumen_me(u: dict = Depends(get_current_lumen_user)):
    return {"user": _serialize_user(u)}


# ---------- Catalogs ----------
@router.get("/catalogs")
async def lumen_catalogs():
    return {
        "occasions": OCCASIONS,
        "looks": LOOKS,
        "music": MUSIC_TRACKS,
        "backgrounds": BACKGROUNDS,
        "voices": [
            {"id": "ember",  "name": "Ember",  "voice_id": os.environ.get("ELEVENLABS_VOICE_MIA")     or "pFZP5JQG7iQjIQuC4Bku", "vibe": "Warm & honest"},
            {"id": "river",  "name": "River",  "voice_id": os.environ.get("ELEVENLABS_VOICE_OLIVER")  or "onwK4e9ZLuTAKqWW03F9", "vibe": "Calm & steady"},
            {"id": "sunny",  "name": "Sunny",  "voice_id": os.environ.get("ELEVENLABS_VOICE_ARIA")    or "cgSgspJ2msm6clMCkdW9", "vibe": "Bright & playful"},
            {"id": "luna",   "name": "Luna",   "voice_id": os.environ.get("ELEVENLABS_VOICE_MARCUS")  or "JBFqnCBsd6RMkjVDRZzb", "vibe": "Storyteller"},
        ],
    }


# ---------- AI Script ----------
@router.post("/scripts")
async def lumen_generate_script(req: ScriptReq, u: dict = Depends(get_current_lumen_user)):
    if not _state["emergent"]:
        raise HTTPException(status_code=503, detail="AI engine not configured")
    occ = next((o for o in OCCASIONS if o["id"] == req.occasion), None)
    if not occ:
        raise HTTPException(status_code=400, detail="Unknown occasion")
    words = {"short": 35, "medium": 70, "long": 110}[req.length]
    prompt = f"""Write a heartfelt spoken video message ({words}±10 words, ~{int(words/2.5)}-{int(words/2)} seconds when spoken).

Occasion: {occ['label']}
Recipient: {req.recipient_name}
From: {req.your_name or 'me'}
Tone: {occ['tone']}
Personal notes from the sender (optional): {req.notes or '(none — use the occasion as the spine)'}

Rules:
- Start with {req.recipient_name}'s name in the first 6 words.
- Sound like a real person speaking, not a greeting card. Casual contractions are fine.
- Avoid generic clichés like "from the bottom of my heart". Be specific or playful.
- ONE small concrete image (a memory, a feeling, an inside-joke vibe).
- Close with a single warm line that hits.
- No stage directions, no markdown, no speaker labels. JUST the spoken text."""
    try:
        chat = LlmChat(api_key=_state["emergent"], session_id=f"lumen-{u['_id']}-{uuid.uuid4().hex[:6]}",
                       system_message="You write short, heartfelt, real-sounding video messages people would actually send to someone they love.").with_model("openai", "gpt-5.2")
        text = await chat.send_message(UserMessage(text=prompt))
        script = (text or "").strip().strip('"')
        return {"script": script, "word_count": len(script.split()), "occasion": occ}
    except Exception as e:
        logger.exception("script gen failed")
        raise HTTPException(status_code=500, detail=f"Script generation failed: {str(e)[:200]}")


# ---------- TTS ----------
@router.post("/tts/preview")
async def lumen_tts(req: TTSReq, u: dict = Depends(get_current_lumen_user)):
    eleven = _state["eleven"]
    if not eleven:
        raise HTTPException(status_code=503, detail="Voice engine not configured")
    try:
        text = req.text[:1500]
        def _c():
            it = eleven.text_to_speech.convert(text=text, voice_id=req.voice_id,
                                               model_id="eleven_multilingual_v2", output_format="mp3_44100_128")
            buf = b""
            for ch in it:
                buf += ch
            return buf
        audio = await asyncio.to_thread(_c)
        return {"audio_url": f"data:audio/mpeg;base64,{base64.b64encode(audio).decode()}", "voice_id": req.voice_id}
    except Exception as e:
        logger.exception("tts failed")
        err = str(e)
        if "detected_unusual_activity" in err or "Free Tier" in err:
            raise HTTPException(status_code=402, detail="Voice service requires a paid ElevenLabs plan from this network.")
        if "voice_not_found" in err or "404" in err:
            raise HTTPException(status_code=404, detail="Voice not available on this account.")
        raise HTTPException(status_code=500, detail=f"Voice failed: {err[:200]}")


# ---------- Moments ----------
async def _can_create_minutes(u: dict, minutes_needed: int) -> bool:
    trial_until = _to_aware_utc(u.get("trial_until"))
    if trial_until and trial_until > datetime.now(timezone.utc):
        return True  # trial = unlimited
    if (u.get("minutes_credit", 0) >= minutes_needed):
        return True
    if (u.get("minutes_used_period", 0) + minutes_needed) <= FREE_MINUTES_PER_MONTH:
        return True
    return False


@router.post("/moments")
async def create_moment(req: MomentCreate, u: dict = Depends(get_current_lumen_user)):
    minutes_needed = max(1, (req.duration_seconds + 59) // 60)
    if req.duration_seconds and not await _can_create_minutes(u, minutes_needed):
        raise HTTPException(status_code=402, detail="Free time used up. Top up minutes or start a free trial.")

    mid = str(uuid.uuid4())
    token = secrets.token_urlsafe(10)
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": mid,
        "user_id": str(u["_id"]),
        "share_token": token,
        **req.model_dump(),
        "sent": False,
        "sent_to_email": None,
        "views": 0,
        "created_at": now,
        "updated_at": now,
    }
    await _db().lumen_moments.insert_one(doc)

    # Charge minutes only when there's a real recording duration
    if req.duration_seconds:
        update = {}
        if u.get("minutes_credit", 0) >= minutes_needed:
            update["$inc"] = {"minutes_credit": -minutes_needed}
        else:
            update["$inc"] = {"minutes_used_period": minutes_needed}
        await _db().lumen_users.update_one({"_id": u["_id"]}, update)

    return {k: v for k, v in doc.items() if k != "_id"}


@router.get("/moments")
async def list_moments(u: dict = Depends(get_current_lumen_user)):
    docs = await _db().lumen_moments.find({"user_id": str(u["_id"])}, {"_id": 0}).sort("updated_at", -1).to_list(200)
    return {"moments": docs}


@router.get("/moments/{moment_id}")
async def get_moment(moment_id: str, u: dict = Depends(get_current_lumen_user)):
    doc = await _db().lumen_moments.find_one({"id": moment_id, "user_id": str(u["_id"])}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Moment not found")
    return doc


@router.patch("/moments/{moment_id}")
async def update_moment(moment_id: str, req: MomentUpdate, u: dict = Depends(get_current_lumen_user)):
    update = {k: v for k, v in req.model_dump(exclude_unset=True).items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="Nothing to update")
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    res = await _db().lumen_moments.update_one({"id": moment_id, "user_id": str(u["_id"])}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Moment not found")
    return await _db().lumen_moments.find_one({"id": moment_id}, {"_id": 0})


@router.delete("/moments/{moment_id}")
async def delete_moment(moment_id: str, u: dict = Depends(get_current_lumen_user)):
    res = await _db().lumen_moments.delete_one({"id": moment_id, "user_id": str(u["_id"])})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Moment not found")
    return {"success": True}


@router.post("/moments/{moment_id}/send")
async def send_moment(moment_id: str, req: SendMoment, u: dict = Depends(get_current_lumen_user)):
    doc = await _db().lumen_moments.find_one({"id": moment_id, "user_id": str(u["_id"])})
    if not doc:
        raise HTTPException(status_code=404, detail="Moment not found")
    share_url = f"{_state['frontend']}/lumen/share/{doc['share_token']}"
    sender = u.get("name") or u["email"]
    subject = f"{sender} sent you a Lumen moment 💌"
    html = f"""
      <div style="font-family:'Plus Jakarta Sans',sans-serif;background:linear-gradient(135deg,#FFF1E6,#FFE3D8);padding:48px 24px;">
        <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:28px;padding:40px;box-shadow:0 20px 50px rgba(255,107,107,0.18);">
          <div style="font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#FF6B6B;font-weight:600;margin-bottom:10px;">A Lumen moment</div>
          <h1 style="font-family:'Fraunces',serif;font-size:32px;color:#1A1A2E;margin:0 0 14px;font-weight:600;">{sender} sent you a video.</h1>
          <p style="color:#5C5C7A;font-size:15px;line-height:1.7;">{(req.sender_note or "Press play. It's only a minute.")[:400]}</p>
          <a href="{share_url}" style="display:inline-block;margin:24px 0;background:#FF6B6B;color:#fff;padding:16px 32px;border-radius:999px;text-decoration:none;font-weight:600;">Watch your moment →</a>
          <p style="color:#9999B0;font-size:12px;margin-top:24px;">If the button doesn't work: {share_url}</p>
        </div>
        <p style="text-align:center;color:#B5B5C7;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin-top:24px;">Lumen — Record. Read. Send love.</p>
      </div>
    """
    try:
        send = _state["resend_send"]
        if send:
            send(req.recipient_email, subject, html)
    except Exception as e:
        logger.error(f"send moment email failed: {e}")
    await _db().lumen_moments.update_one(
        {"id": moment_id},
        {"$set": {"sent": True, "sent_to_email": req.recipient_email, "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    return {"success": True, "share_url": share_url}


# ---------- Public share view ----------
@router.get("/share/{token}")
async def public_share(token: str):
    doc = await _db().lumen_moments.find_one({"share_token": token}, {"_id": 0, "user_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Moment not found")
    await _db().lumen_moments.update_one({"share_token": token}, {"$inc": {"views": 1}})
    sender = await _db().lumen_users.find_one({"_id": ObjectId((await _db().lumen_moments.find_one({"share_token": token}))["user_id"])})
    return {
        "occasion": doc.get("occasion"),
        "recipient_name": doc.get("recipient_name"),
        "script": doc.get("script"),
        "look_id": doc.get("look_id"),
        "music_id": doc.get("music_id"),
        "background_id": doc.get("background_id"),
        "recording_url": doc.get("recording_url"),
        "duration_seconds": doc.get("duration_seconds"),
        "sender_name": (sender or {}).get("name", "Someone"),
        "views": doc.get("views", 0) + 1,
        "watermark": not (sender or {}).get("watermark_subscription", False),
    }


# ---------- Payments ----------
@router.post("/payments/checkout")
async def lumen_checkout(req: LumenCheckoutReq, request: Request, u: dict = Depends(get_current_lumen_user)):
    if not _state["stripe"]:
        raise HTTPException(status_code=503, detail="Payments not configured")
    pack = TIME_PACKS.get(req.package_id) or SUBSCRIPTIONS.get(req.package_id)
    if not pack:
        raise HTTPException(status_code=400, detail="Invalid package")
    origin = req.origin_url.rstrip("/")
    success_url = f"{origin}/lumen/app/billing/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/lumen/pricing?canceled=1"
    metadata = {"user_id": str(u["_id"]), "user_email": u["email"], "package_id": req.package_id}
    sc = _stripe(request)
    session = await sc.create_checkout_session(CheckoutSessionRequest(
        amount=pack["amount"], currency=pack["currency"],
        success_url=success_url, cancel_url=cancel_url, metadata=metadata,
    ))
    await _db().lumen_payments.insert_one({
        "session_id": session.session_id,
        "user_id": str(u["_id"]),
        "user_email": u["email"],
        "package_id": req.package_id,
        "amount": pack["amount"], "currency": pack["currency"],
        "minutes": pack.get("minutes", 0),
        "subscription": req.package_id in SUBSCRIPTIONS,
        "payment_status": "initiated", "status": "open",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"url": session.url, "session_id": session.session_id}


async def _apply_paid_purchase(txn: dict) -> None:
    uid = ObjectId(txn["user_id"])
    if txn.get("subscription"):
        await _db().lumen_users.update_one({"_id": uid}, {"$set": {"watermark_subscription": True}})
    elif txn.get("minutes"):
        await _db().lumen_users.update_one({"_id": uid}, {"$inc": {"minutes_credit": txn["minutes"]}})
    logger.info(f"[LUMEN PAID] {txn['user_email']} package={txn['package_id']}")


@router.get("/payments/status/{session_id}")
async def lumen_status(session_id: str, request: Request, u: dict = Depends(get_current_lumen_user)):
    if not _state["stripe"]:
        raise HTTPException(status_code=503, detail="Payments not configured")
    txn = await _db().lumen_payments.find_one({"session_id": session_id, "user_id": str(u["_id"])}, {"_id": 0})
    if not txn:
        raise HTTPException(status_code=404, detail="Session not found")
    payment_status = txn.get("payment_status", "initiated")
    status = txn.get("status", "open")
    amount_total = int(txn.get("amount", 0) * 100)
    currency = txn.get("currency", "usd")
    try:
        sc = _stripe(request)
        sr = await sc.get_checkout_status(session_id)
        payment_status, status, amount_total, currency = sr.payment_status, sr.status, sr.amount_total, sr.currency
    except Exception as e:
        logger.warning(f"Lumen stripe retrieve failed (fallback to local): {str(e)[:80]}")
    if payment_status == "paid" and txn["payment_status"] != "paid":
        await _db().lumen_payments.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": "paid", "status": status, "amount_total": amount_total,
                      "updated_at": datetime.now(timezone.utc).isoformat()}},
        )
        await _apply_paid_purchase(txn)
    return {"payment_status": payment_status, "status": status, "amount_total": amount_total, "currency": currency, "package_id": txn.get("package_id")}


@router.post("/webhook/stripe")
async def lumen_webhook(request: Request):
    if not _state["stripe"]:
        return {"received": False}
    body = await request.body()
    sig = request.headers.get("Stripe-Signature")
    try:
        sc = _stripe(request)
        event = await sc.handle_webhook(body, sig)
        if event.payment_status == "paid":
            txn = await _db().lumen_payments.find_one({"session_id": event.session_id})
            if txn and txn["payment_status"] != "paid":
                await _db().lumen_payments.update_one(
                    {"session_id": event.session_id},
                    {"$set": {"payment_status": "paid", "status": "complete",
                              "updated_at": datetime.now(timezone.utc).isoformat()}},
                )
                await _apply_paid_purchase(txn)
        return {"received": True}
    except Exception as e:
        logger.exception("lumen webhook")
        raise HTTPException(status_code=400, detail=str(e)[:200])


# ---------- Startup helper ----------
async def ensure_indexes(db):
    await db.lumen_users.create_index("email", unique=True)
    await db.lumen_moments.create_index([("user_id", 1), ("updated_at", -1)])
    await db.lumen_moments.create_index("share_token", unique=True)
    await db.lumen_payments.create_index([("user_id", 1), ("created_at", -1)])
