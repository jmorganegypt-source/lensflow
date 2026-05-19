from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import io
import base64
import logging
import asyncio
import secrets
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

import bcrypt
import jwt
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field
from elevenlabs.client import ElevenLabs

from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout, CheckoutSessionRequest, CheckoutSessionResponse, CheckoutStatusResponse,
)
import resend

import lumen as lumen_module
from studio_plus import build_router as build_studio_plus_router


# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
logger = logging.getLogger("lensflow")

mongo_url = os.environ["MONGO_URL"]
db_name = os.environ["DB_NAME"]
mongo_client = AsyncIOMotorClient(mongo_url)
db = mongo_client[db_name]

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_MINUTES = 60 * 24  # 1 day
REFRESH_TOKEN_DAYS = 30

ELEVEN_KEY = os.environ.get("ELEVENLABS_API_KEY", "")
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY", "")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
STRIPE_KEY = os.environ.get("STRIPE_API_KEY", "")
RESEND_KEY = os.environ.get("RESEND_API_KEY", "")
RESEND_FROM = os.environ.get("RESEND_FROM_EMAIL", "LensFlow <onboarding@resend.dev>")
LUMEN_RESEND_FROM = os.environ.get("LUMEN_RESEND_FROM_EMAIL", "Lumen 💌 <hello@lensflow.com.au>")

if RESEND_KEY:
    resend.api_key = RESEND_KEY

eleven_client: Optional[ElevenLabs] = None
if ELEVEN_KEY:
    try:
        eleven_client = ElevenLabs(api_key=ELEVEN_KEY)
    except Exception as e:
        logger.warning(f"ElevenLabs init failed: {e}")


# ---------------------------------------------------------------------------
# Email (Resend)
# ---------------------------------------------------------------------------
def send_password_reset_email(to_email: str, reset_link: str) -> None:
    """Send password reset email via Resend, falling back to console log."""
    if not RESEND_KEY:
        logger.info(f"[EMAIL DEV] reset link for {to_email}: {reset_link}")
        return
    try:
        resend.Emails.send({
            "from": RESEND_FROM,
            "to": [to_email],
            "subject": "Reset your LensFlow password",
            "html": f"""
              <div style="font-family:'Outfit',sans-serif;background:#050505;color:#fff;padding:48px 24px;">
                <div style="max-width:520px;margin:0 auto;background:#0A0A0A;border:1px solid rgba(201,154,46,0.25);border-radius:24px;padding:40px;">
                  <h1 style="font-family:'Playfair Display',serif;font-size:32px;color:#fff;margin:0 0 8px;">Reset your password</h1>
                  <p style="color:rgba(255,255,255,0.65);font-size:15px;line-height:1.6;">
                    A password reset was requested for your LensFlow account. Tap the button below to choose a new one. This link expires in 1 hour.
                  </p>
                  <a href="{reset_link}" style="display:inline-block;margin:24px 0;background:#C99A2E;color:#000;padding:14px 28px;border-radius:999px;text-decoration:none;font-weight:500;">Reset password</a>
                  <p style="color:rgba(255,255,255,0.35);font-size:12px;margin-top:32px;">Didn't request this? Ignore this email.</p>
                </div>
                <p style="text-align:center;color:rgba(255,255,255,0.25);font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin-top:24px;">LensFlow — Cinematic AI Real Estate Media</p>
              </div>
            """,
        })
        logger.info(f"[EMAIL] reset link sent to {to_email}")
    except Exception as e:
        logger.error(f"Resend send failed: {e} — falling back to console")
        logger.info(f"[EMAIL DEV] reset link for {to_email}: {reset_link}")


def send_payment_thankyou_email(to_email: str, name: str, plan: str, amount: float, currency: str = "usd") -> None:
    """Send a branded thank-you email after a successful Stripe payment."""
    plan_label = {"pro": "Pro", "concierge": "Concierge"}.get(plan, plan.title())
    amount_str = f"${amount:,.2f} {currency.upper()}"
    studio_link = f"{FRONTEND_URL}/app/dashboard"
    if not RESEND_KEY:
        logger.info(f"[EMAIL DEV] thank-you for {to_email}: plan={plan_label} amount={amount_str}")
        return
    try:
        resend.Emails.send({
            "from": RESEND_FROM,
            "to": [to_email],
            "subject": f"You're on LensFlow {plan_label} — the full studio is unlocked",
            "html": f"""
              <div style="font-family:'Outfit',sans-serif;background:#050505;color:#fff;padding:48px 24px;">
                <div style="max-width:560px;margin:0 auto;background:#0A0A0A;border:1px solid rgba(201,154,46,0.25);border-radius:24px;padding:44px;">
                  <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#C99A2E;font-family:monospace;margin-bottom:12px;">Welcome to {plan_label}</div>
                  <h1 style="font-family:'Playfair Display',serif;font-size:36px;line-height:1.05;color:#fff;margin:0 0 14px;">Thank you, {name or 'agent'}.</h1>
                  <p style="color:rgba(255,255,255,0.7);font-size:16px;line-height:1.7;">Your payment of <strong style="color:#C99A2E;">{amount_str}</strong> has cleared and your full studio is live. All four presenters, unlimited scripts, broadcast exports — every cinematic tool is now in your hands.</p>
                  <a href="{studio_link}" style="display:inline-block;margin:28px 0 12px;background:#C99A2E;color:#000;padding:14px 32px;border-radius:999px;text-decoration:none;font-weight:500;">Open the studio →</a>
                  <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:32px 0;" />
                  <h3 style="font-family:'Playfair Display',serif;font-size:18px;color:#fff;margin:0 0 10px;">What's unlocked</h3>
                  <ul style="color:rgba(255,255,255,0.65);font-size:14px;line-height:1.9;padding-left:20px;margin:0;">
                    <li>Unlimited GPT-5.2 script generation</li>
                    <li>Mia, Oliver, Aria & Marcus (all accents)</li>
                    <li>1080p &amp; 4K exports — no watermark</li>
                    <li>REA · Domain · Rightmove formatting</li>
                    <li>Priority TTS rendering</li>
                  </ul>
                  <p style="color:rgba(255,255,255,0.4);font-size:12px;margin-top:32px;line-height:1.6;">Questions? Just reply to this email — concierge@lensflow.ai. Need an invoice or VAT/GST receipt? We've got you.</p>
                </div>
                <p style="text-align:center;color:rgba(255,255,255,0.25);font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin-top:24px;">LensFlow — Cinematic AI Real Estate Media</p>
              </div>
            """,
        })
        logger.info(f"[EMAIL] thank-you sent to {to_email} ({plan_label}, {amount_str})")
    except Exception as e:
        logger.error(f"Resend thank-you failed: {e} — falling back to console")
        logger.info(f"[EMAIL DEV] thank-you for {to_email}: plan={plan_label} amount={amount_str}")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_MINUTES),
        "type": "access",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_DAYS),
        "type": "refresh",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def set_auth_cookies(response: Response, access: str, refresh: str):
    response.set_cookie("access_token", access, httponly=True, secure=False, samesite="lax",
                        max_age=ACCESS_TOKEN_MINUTES * 60, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=False, samesite="lax",
                        max_age=REFRESH_TOKEN_DAYS * 24 * 3600, path="/")


def clear_auth_cookies(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")


def serialize_user(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "email": doc["email"],
        "name": doc.get("name", ""),
        "role": doc.get("role", "user"),
        "plan": doc.get("plan", "free"),
        "paid_at": doc.get("paid_at"),
        "booking_url": doc.get("booking_url", ""),
        "onboarded": bool(doc.get("onboarded", False)),
        "onboarding": doc.get("onboarding") or {},
        "created_at": doc.get("created_at").isoformat() if isinstance(doc.get("created_at"), datetime) else doc.get("created_at"),
    }


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# Brute force protection
def _to_aware_utc(dt):
    if dt and dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


async def check_brute_force(identifier: str) -> None:
    rec = await db.login_attempts.find_one({"identifier": identifier})
    if not rec:
        return
    locked_until = _to_aware_utc(rec.get("locked_until"))
    if locked_until and locked_until > datetime.now(timezone.utc):
        raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in 15 minutes.")


async def record_failed_login(identifier: str):
    rec = await db.login_attempts.find_one({"identifier": identifier})
    count = (rec.get("count", 0) if rec else 0) + 1
    update = {"identifier": identifier, "count": count, "last_at": datetime.now(timezone.utc)}
    if count >= 5:
        update["locked_until"] = datetime.now(timezone.utc) + timedelta(minutes=15)
        update["count"] = 0
    await db.login_attempts.update_one({"identifier": identifier}, {"$set": update}, upsert=True)


async def clear_login_attempts(identifier: str):
    await db.login_attempts.delete_many({"identifier": identifier})


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class RegisterReq(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1, max_length=100)


class LoginReq(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordReq(BaseModel):
    email: EmailStr


class ResetPasswordReq(BaseModel):
    token: str
    new_password: str = Field(min_length=6)


class ScriptGenReq(BaseModel):
    property_type: str
    address: str
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    price_range: Optional[str] = None
    key_features: str = ""
    tone: Literal["luxury", "professional", "warm", "modern"] = "luxury"
    duration_seconds: int = 60
    presenter: Literal["mia", "oliver", "none"] = "mia"


class ScriptOut(BaseModel):
    id: str
    title: str
    script: str
    word_count: int
    estimated_duration: int
    created_at: str


class ScriptVariant(BaseModel):
    id: str
    style: str           # "polished" | "casual" | "cinematic"
    style_label: str     # "Polished & Refined"
    script: str
    word_count: int
    estimated_duration: int


class ScriptVariantsOut(BaseModel):
    title: str
    variants: List[ScriptVariant]
    created_at: str


class ProjectCreate(BaseModel):
    title: str
    script: str = ""
    presenter: str = "mia"
    status: Literal["draft", "recorded", "published"] = "draft"
    property_address: Optional[str] = None
    recording_url: Optional[str] = None
    thumbnail: Optional[str] = None


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    script: Optional[str] = None
    presenter: Optional[str] = None
    status: Optional[Literal["draft", "recorded", "published"]] = None
    property_address: Optional[str] = None
    recording_url: Optional[str] = None
    thumbnail: Optional[str] = None


class TTSPreviewReq(BaseModel):
    text: str = Field(min_length=1, max_length=2000)
    voice_id: str


class ConciergeReq(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    property_address: Optional[str] = None
    message: str
    package: Optional[str] = None


# ---------------------------------------------------------------------------
# Presenters catalog (static)
# Voice IDs are configurable via env so users can plug in their own
# ElevenLabs cloned voices. Defaults are public preset IDs (may not be
# available on all API keys).
# ---------------------------------------------------------------------------
PRESENTERS = [
    {
        "id": "mia",
        "name": "Mia",
        "tagline": "Luxury Residential · Warm & Elegant",
        "description": "Australian-British inflection. Best for prestige residential, beachfront and heritage estates.",
        "voice_id": os.environ.get("ELEVENLABS_VOICE_MIA") or "EXAVITQu4vr4xnSDxMaC",
        "avatar": "/assets/property/mia-headshot.jpg",
        "accent": "Australian-British",
        "specialty": ["Residential", "Beachfront", "Heritage"],
    },
    {
        "id": "oliver",
        "name": "Oliver",
        "tagline": "Distinguished Authority · Trusted Closer",
        "description": "Refined British baritone with quiet authority. Built for commercial, off-the-plan and investor-grade properties.",
        "voice_id": os.environ.get("ELEVENLABS_VOICE_OLIVER") or "TxGEqnHWrfWFTfGW9XjX",
        "avatar": "/assets/property/oliver-portrait.jpg",
        "accent": "British RP",
        "specialty": ["Commercial", "Off-the-plan", "Investor"],
    },
    {
        "id": "aria",
        "name": "Aria",
        "tagline": "Modern Lifestyle · Fresh & Confident",
        "description": "Vibrant American voice for new developments, lifestyle marketing and Instagram-first reels.",
        "voice_id": os.environ.get("ELEVENLABS_VOICE_ARIA") or "9BWtsMINqrJLrRacOk9x",
        "avatar": "/assets/property/aria-portrait.jpg",
        "accent": "American",
        "specialty": ["New Developments", "Lifestyle", "Social Media"],
    },
    {
        "id": "marcus",
        "name": "Marcus",
        "tagline": "International Luxe · Sophisticated",
        "description": "Continental polish for international buyers. Translates the language of wealth.",
        "voice_id": os.environ.get("ELEVENLABS_VOICE_MARCUS") or "JBFqnCBsd6RMkjVDRZzb",
        "avatar": "/assets/property/marcus-portrait.jpg",
        "accent": "Continental European",
        "specialty": ["International", "Penthouse", "Estate"],
    },
    {
        "id": "emma",
        "name": "Emma",
        "tagline": "Coastal Editorial · Bright & Persuasive",
        "description": "Editorial brightness with a confident close. Built for waterfront, lifestyle and Instagram-first storytelling.",
        "voice_id": os.environ.get("ELEVENLABS_VOICE_EMMA") or "EXAVITQu4vr4xnSDxMaL",
        "avatar": "/assets/property/emma-portrait.jpg",
        "accent": "American",
        "specialty": ["Waterfront", "Lifestyle", "Social Media"],
    },
]


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(title="LensFlow API")
api = APIRouter(prefix="/api")


@api.get("/")
async def root():
    return {"app": "LensFlow", "version": "1.0", "status": "online"}


@api.get("/health")
async def health():
    """Lightweight liveness probe — no DB, no auth, no I/O. Used by K8s health checks."""
    return {"status": "ok"}


# ---------- Auth ----------
@api.post("/auth/register")
async def register(req: RegisterReq, response: Response):
    email = req.email.lower().strip()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    doc = {
        "email": email,
        "password_hash": hash_password(req.password),
        "name": req.name.strip(),
        "role": "user",
        "plan": "free",
        "created_at": datetime.now(timezone.utc),
    }
    res = await db.users.insert_one(doc)
    user = await db.users.find_one({"_id": res.inserted_id})
    access = create_access_token(str(user["_id"]), user["email"])
    refresh = create_refresh_token(str(user["_id"]))
    set_auth_cookies(response, access, refresh)
    return {"user": serialize_user(user), "access_token": access}


@api.post("/auth/login")
async def login(req: LoginReq, request: Request, response: Response):
    email = req.email.lower().strip()
    ip = request.client.host if request.client else "unknown"
    identifier = f"{ip}:{email}"
    await check_brute_force(identifier)
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(req.password, user["password_hash"]):
        await record_failed_login(identifier)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    await clear_login_attempts(identifier)
    access = create_access_token(str(user["_id"]), user["email"])
    refresh = create_refresh_token(str(user["_id"]))
    set_auth_cookies(response, access, refresh)
    return {"user": serialize_user(user), "access_token": access}


@api.post("/auth/logout")
async def logout(response: Response, user: dict = Depends(get_current_user)):
    clear_auth_cookies(response)
    return {"success": True}


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return {"user": serialize_user(user)}


@api.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        access = create_access_token(str(user["_id"]), user["email"])
        response.set_cookie("access_token", access, httponly=True, secure=False, samesite="lax",
                            max_age=ACCESS_TOKEN_MINUTES * 60, path="/")
        return {"success": True}
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


@api.post("/auth/forgot-password")
async def forgot_password(req: ForgotPasswordReq):
    user = await db.users.find_one({"email": req.email.lower().strip()})
    if user:
        token = secrets.token_urlsafe(32)
        await db.password_reset_tokens.insert_one({
            "token": token,
            "user_id": str(user["_id"]),
            "used": False,
            "expires_at": datetime.now(timezone.utc) + timedelta(hours=1),
        })
        reset_link = f"{FRONTEND_URL}/reset-password?token={token}"
        send_password_reset_email(req.email, reset_link)
    return {"message": "If the email exists, a reset link has been sent."}


@api.post("/auth/reset-password")
async def reset_password(req: ResetPasswordReq):
    rec = await db.password_reset_tokens.find_one({"token": req.token, "used": False})
    if not rec or _to_aware_utc(rec["expires_at"]) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    await db.users.update_one({"_id": ObjectId(rec["user_id"])}, {"$set": {"password_hash": hash_password(req.new_password)}})
    await db.password_reset_tokens.update_one({"_id": rec["_id"]}, {"$set": {"used": True}})
    return {"success": True}


@api.post("/auth/onboarding")
async def save_onboarding(payload: dict, user: dict = Depends(get_current_user)):
    prefs = {
        "tools": [str(x)[:40] for x in (payload.get("tools") or [])][:20],
        "role": str(payload.get("role") or "")[:40],
        "presenter": str(payload.get("presenter") or "")[:40],
        "platforms": [str(x)[:40] for x in (payload.get("platforms") or [])][:20],
        "website": str(payload.get("website") or "")[:200],
        "handle": str(payload.get("handle") or "")[:80],
        "completed_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"onboarded": True, "onboarding": prefs}}
    )
    updated = await db.users.find_one({"_id": user["_id"]})
    return {"success": True, "user": serialize_user(updated)}


# ---------- Presenters ----------
@api.get("/presenters")
async def list_presenters():
    return {"presenters": PRESENTERS}


# ---------- TTS preview (ElevenLabs) ----------
# Premium voice settings — tuned for luxury real-estate narration.
# These dramatically lift Mia/Oliver/Aria/Marcus from "default AI" to "broadcast presenter".
LUXURY_VOICE_SETTINGS = {
    "stability": 0.60,         # 0.5 default -> 0.60 = warmer, less robotic, fewer awkward inflections
    "similarity_boost": 0.85,  # 0.5 default -> 0.85 = stronger character match (Mia sounds more like Mia)
    "style": 0.30,             # 0.0 default -> 0.30 = adds tasteful luxury cadence without overacting
    "use_speaker_boost": True, # Cleaner, broadcast-grade output
}


@api.post("/tts/preview")
async def tts_preview(req: TTSPreviewReq, user: dict = Depends(get_current_user)):
    if not eleven_client:
        raise HTTPException(status_code=503, detail="Voice engine not configured")
    try:
        # Truncate to 500 chars for previews to save credits
        text = req.text[:500]

        def _convert():
            audio_iter = eleven_client.text_to_speech.convert(
                text=text,
                voice_id=req.voice_id,
                model_id="eleven_multilingual_v2",
                output_format="mp3_44100_128",
                voice_settings=LUXURY_VOICE_SETTINGS,
            )
            buf = b""
            for chunk in audio_iter:
                buf += chunk
            return buf

        audio_bytes = await asyncio.to_thread(_convert)
        b64 = base64.b64encode(audio_bytes).decode()
        return {"audio_url": f"data:audio/mpeg;base64,{b64}", "voice_id": req.voice_id}
    except Exception as e:
        logger.exception("TTS error")
        err = str(e)
        if "detected_unusual_activity" in err or "Unusual activity" in err or "Free Tier usage disabled" in err:
            raise HTTPException(
                status_code=402,
                detail=(
                    "ElevenLabs blocked this request: Free Tier is disabled for cloud/VPN IPs. "
                    "Upgrade your ElevenLabs account to the Starter plan ($5/mo) at "
                    "elevenlabs.io/app/subscription to unlock voice generation."
                ),
            )
        if "voice_not_found" in err or "404" in err:
            raise HTTPException(
                status_code=404,
                detail=(
                    "Voice not available on your ElevenLabs key. "
                    "Add a voice you own to your library at elevenlabs.io, then set "
                    "ELEVENLABS_VOICE_MIA / _OLIVER / _ARIA / _MARCUS in backend/.env."
                ),
            )
        if "missing_permissions" in err or "401" in err or "403" in err:
            raise HTTPException(status_code=403, detail="ElevenLabs key permissions insufficient — enable text_to_speech for this key.")
        raise HTTPException(status_code=500, detail=f"Voice generation failed: {err[:200]}")


# ---------- AI Studio (script generation) ----------
SCRIPT_STYLES = {
    "polished": {
        "label": "Polished & Refined",
        "guidance": "Sophisticated, broadcast-grade language. Confident, decisive sentences. Champagne-and-marble vocabulary. The kind of script Robb Report or The Wall Street Journal property section would write. Avoid clichés.",
    },
    "casual": {
        "label": "Casual & Conversational",
        "guidance": "Like the agent is texting a smart friend about their best listing this month. Warm, human, slightly playful, drops the formality without losing premium feel. Contractions OK. Energy without losing class.",
    },
    "cinematic": {
        "label": "Cinematic & Dramatic",
        "guidance": "Bond-trailer narration. Short punchy lines. Pause beats. Image-rich verbs. Build tension and emotional payoff. Reads like the voiceover of a luxury car ad.",
    },
}


def _build_script_prompt(req: ScriptGenReq, style: Optional[str] = None) -> str:
    duration = req.duration_seconds
    words = max(40, int(duration * 2.4))
    presenter_note = ""
    if req.presenter == "mia":
        presenter_note = "Written for Mia, a warm and elegant Australian-British presenter."
    elif req.presenter == "oliver":
        presenter_note = "Written for Oliver, a refined and authoritative British male presenter."

    style_block = ""
    if style and style in SCRIPT_STYLES:
        s = SCRIPT_STYLES[style]
        style_block = f"\nSTYLE: {s['label']}\n{s['guidance']}\n"

    return f"""You are an elite real estate copywriter for cinematic property videos.

Produce a SPOKEN script ({words}±15 words, ~{duration} seconds at natural pace) for:

Property type: {req.property_type}
Address: {req.address}
Bedrooms: {req.bedrooms or 'not specified'}
Bathrooms: {req.bathrooms or 'not specified'}
Price range: {req.price_range or 'on application'}
Key features: {req.key_features or '(use the property type for inspiration)'}
Tone: {req.tone}
{presenter_note}{style_block}

Rules:
- Open with a cinematic hook (NOT "Welcome to").
- Lead with emotion and lifestyle, not bullet points.
- Use short, broadcast-cadence sentences.
- Reference the address ONCE, naturally.
- Close with a single decisive call to action.
- Do NOT use stage directions, markdown headers, or speaker labels.
- Return ONLY the spoken script, nothing else."""


@api.post("/studio/scripts", response_model=ScriptOut)
async def generate_script(req: ScriptGenReq, user: dict = Depends(get_current_user)):
    if not EMERGENT_KEY:
        raise HTTPException(status_code=503, detail="AI engine not configured")
    try:
        session_id = f"script-{user['_id']}-{uuid.uuid4().hex[:8]}"
        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=session_id,
            system_message="You write cinematic, conversion-focused real estate scripts for luxury video tours.",
        ).with_model("openai", "gpt-5.2")
        prompt = _build_script_prompt(req)
        text = await chat.send_message(UserMessage(text=prompt))
        script = (text or "").strip()
        word_count = len(script.split())
        est = max(20, int(word_count / 2.4))
        script_id = str(uuid.uuid4())
        title = f"{req.property_type.title()} · {req.address[:40]}"
        doc = {
            "id": script_id,
            "user_id": str(user["_id"]),
            "title": title,
            "script": script,
            "word_count": word_count,
            "estimated_duration": est,
            "request": req.model_dump(),
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.scripts.insert_one(doc)
        return ScriptOut(
            id=script_id, title=title, script=script,
            word_count=word_count, estimated_duration=est,
            created_at=doc["created_at"],
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Script gen failed")
        raise HTTPException(status_code=500, detail=f"Script generation failed: {str(e)[:200]}")


@api.get("/studio/scripts")
async def list_scripts(user: dict = Depends(get_current_user)):
    docs = await db.scripts.find({"user_id": str(user["_id"])}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {"scripts": docs}


@api.post("/studio/scripts/variants", response_model=ScriptVariantsOut)
async def generate_script_variants(req: ScriptGenReq, user: dict = Depends(get_current_user)):
    """Generate 3 stylistic variants in parallel (Polished, Casual, Cinematic).
    Agent picks their favourite — beats BIGVU's single-script flow."""
    if not EMERGENT_KEY:
        raise HTTPException(status_code=503, detail="AI engine not configured")
    styles = ["polished", "casual", "cinematic"]

    async def _run_one(style_key: str) -> ScriptVariant:
        session_id = f"script-{user['_id']}-{style_key}-{uuid.uuid4().hex[:6]}"
        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=session_id,
            system_message="You write cinematic, conversion-focused real estate scripts for luxury video tours.",
        ).with_model("openai", "gpt-5.2")
        prompt = _build_script_prompt(req, style=style_key)
        text = await chat.send_message(UserMessage(text=prompt))
        script = (text or "").strip()
        wc = len(script.split())
        est = max(20, int(wc / 2.4))
        return ScriptVariant(
            id=str(uuid.uuid4()),
            style=style_key,
            style_label=SCRIPT_STYLES[style_key]["label"],
            script=script,
            word_count=wc,
            estimated_duration=est,
        )

    try:
        variants = await asyncio.gather(*[_run_one(s) for s in styles])
    except Exception as e:
        logger.exception("Variant gen failed")
        raise HTTPException(status_code=500, detail=f"Script generation failed: {str(e)[:200]}")

    title = f"{req.property_type.title()} · {req.address[:40]}"
    created_at = datetime.now(timezone.utc).isoformat()

    # Persist all 3 variants for the agent's history
    await db.scripts.insert_many([
        {
            "id": v.id,
            "user_id": str(user["_id"]),
            "title": f"{title} ({v.style_label})",
            "script": v.script,
            "style": v.style,
            "word_count": v.word_count,
            "estimated_duration": v.estimated_duration,
            "request": req.model_dump(),
            "created_at": created_at,
        }
        for v in variants
    ])

    return ScriptVariantsOut(title=title, variants=list(variants), created_at=created_at)


# ---------------------------------------------------------------------------
# Marketing demo — "Mia narrates YOUR address"
# Public, unauthenticated. Cold-visitor conversion booster on the landing page.
# Rate-limited per IP to protect ElevenLabs credits.
# ---------------------------------------------------------------------------
_demo_ip_log: dict[str, list[float]] = {}
DEMO_HOURLY_LIMIT = 3
DEMO_WINDOW_SECONDS = 60 * 60


def _demo_check_rate(ip: str) -> None:
    import time
    now = time.time()
    bucket = [t for t in _demo_ip_log.get(ip, []) if now - t < DEMO_WINDOW_SECONDS]
    if len(bucket) >= DEMO_HOURLY_LIMIT:
        wait_min = int((DEMO_WINDOW_SECONDS - (now - bucket[0])) / 60) + 1
        raise HTTPException(
            status_code=429,
            detail=f"You've used your {DEMO_HOURLY_LIMIT} free demos this hour. Try again in ~{wait_min} min, or start your trial to keep going.",
        )
    bucket.append(now)
    _demo_ip_log[ip] = bucket


class MiaDemoReq(BaseModel):
    address: str = Field(..., min_length=4, max_length=200)
    email: Optional[EmailStr] = None  # optional — captured as a soft lead


@api.post("/marketing/mia-narrate")
async def mia_narrate_demo(req: MiaDemoReq, request: Request):
    """Generate a 10-second Mia voiceover for any address. PUBLIC."""
    if not EMERGENT_KEY:
        raise HTTPException(status_code=503, detail="AI engine not configured")
    if not eleven_client:
        raise HTTPException(status_code=503, detail="Voice engine not configured")

    # Rate limit by IP (X-Forwarded-For aware behind ingress)
    fwd = request.headers.get("x-forwarded-for", "")
    ip = fwd.split(",")[0].strip() if fwd else (request.client.host if request.client else "unknown")
    _demo_check_rate(ip)

    address = req.address.strip()

    # 1) Generate a tight cinematic micro-script (~22-26 words = ~10 seconds)
    prompt = f"""You are Mia, a luxury real-estate AI presenter narrating a TEASER for a property.

Write ONE spoken sentence (22-26 words, exactly 10 seconds at natural pace) that:
- Opens with a cinematic hook (NO "Welcome to", NO "Discover")
- Names the address ONCE, naturally folded in
- Suggests lifestyle and prestige WITHOUT making up property details (you don't know bedrooms/price)
- Ends with a curiosity beat — leaves the listener wanting more
- Reads like a $5M property reel voiceover

Address: {address}

Return ONLY the spoken sentence. No quotes, no labels, no markdown."""

    try:
        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=f"mia-demo-{uuid.uuid4().hex[:8]}",
            system_message="You write tight, cinematic, broadcast-grade real estate teaser lines for luxury video.",
        ).with_model("openai", "gpt-5.2")
        text = await chat.send_message(UserMessage(text=prompt))
        script = (text or "").strip().strip('"').strip("'")
        if not script:
            raise HTTPException(status_code=500, detail="Script came back empty — try again.")
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Mia demo script failed")
        raise HTTPException(status_code=500, detail=f"Script generation failed: {str(e)[:200]}")

    # 2) Synthesise with the Mia voice
    mia_voice_id = next((p["voice_id"] for p in PRESENTERS if p["id"] == "mia"), None)
    if not mia_voice_id:
        raise HTTPException(status_code=503, detail="Mia voice not configured")

    try:
        def _tts():
            audio_iter = eleven_client.text_to_speech.convert(
                text=script,
                voice_id=mia_voice_id,
                model_id="eleven_multilingual_v2",
                output_format="mp3_44100_128",
                voice_settings=LUXURY_VOICE_SETTINGS,
            )
            buf = b""
            for chunk in audio_iter:
                buf += chunk
            return buf

        audio_bytes = await asyncio.to_thread(_tts)
        b64 = base64.b64encode(audio_bytes).decode()
    except Exception as e:
        logger.exception("Mia demo TTS failed")
        err = str(e)
        if "detected_unusual_activity" in err or "Free Tier" in err:
            raise HTTPException(status_code=402, detail="Voice engine temporarily out of credits — try again shortly.")
        raise HTTPException(status_code=500, detail=f"Voice generation failed: {err[:200]}")

    # 3) Log lead (best-effort, never blocks response)
    try:
        await db.demo_leads.insert_one({
            "id": str(uuid.uuid4()),
            "address": address,
            "email": req.email,
            "ip": ip,
            "user_agent": request.headers.get("user-agent", "")[:300],
            "referer": request.headers.get("referer", "")[:300],
            "script": script,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    except Exception as e:
        logger.warning(f"demo_leads insert failed: {e}")

    word_count = len(script.split())
    return {
        "script": script,
        "audio_url": f"data:audio/mpeg;base64,{b64}",
        "word_count": word_count,
        "estimated_duration": max(8, int(word_count / 2.4)),
        "presenter": "Mia",
    }


# ---------- Projects ----------
@api.post("/projects")
async def create_project(req: ProjectCreate, user: dict = Depends(get_current_user)):
    pid = str(uuid.uuid4())
    doc = {
        "id": pid,
        "user_id": str(user["_id"]),
        "title": req.title,
        "script": req.script,
        "presenter": req.presenter,
        "status": req.status,
        "property_address": req.property_address,
        "recording_url": req.recording_url,
        "thumbnail": req.thumbnail,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.projects.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}


@api.get("/projects")
async def list_projects(user: dict = Depends(get_current_user)):
    docs = await db.projects.find({"user_id": str(user["_id"])}, {"_id": 0}).sort("updated_at", -1).to_list(200)
    return {"projects": docs}


@api.get("/projects/{project_id}")
async def get_project(project_id: str, user: dict = Depends(get_current_user)):
    doc = await db.projects.find_one({"id": project_id, "user_id": str(user["_id"])}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Project not found")
    return doc


@api.patch("/projects/{project_id}")
async def update_project(project_id: str, req: ProjectUpdate, user: dict = Depends(get_current_user)):
    update = {k: v for k, v in req.model_dump(exclude_unset=True).items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="Nothing to update")
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    res = await db.projects.update_one({"id": project_id, "user_id": str(user["_id"])}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    doc = await db.projects.find_one({"id": project_id}, {"_id": 0})
    return doc


@api.delete("/projects/{project_id}")
async def delete_project(project_id: str, user: dict = Depends(get_current_user)):
    res = await db.projects.delete_one({"id": project_id, "user_id": str(user["_id"])})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"success": True}


# ---------- Dashboard stats ----------
@api.get("/dashboard/stats")
async def dashboard_stats(user: dict = Depends(get_current_user)):
    uid = str(user["_id"])
    pipeline = [
        {"$match": {"user_id": uid}},
        {"$facet": {
            "total": [{"$count": "count"}],
            "drafts": [{"$match": {"status": "draft"}}, {"$count": "count"}],
            "published": [{"$match": {"status": "published"}}, {"$count": "count"}],
        }},
    ]
    result = await db.projects.aggregate(pipeline).to_list(1)
    bucket = result[0] if result else {"total": [], "drafts": [], "published": []}
    projects_total = bucket["total"][0]["count"] if bucket["total"] else 0
    drafts = bucket["drafts"][0]["count"] if bucket["drafts"] else 0
    published = bucket["published"][0]["count"] if bucket["published"] else 0
    scripts_total = await db.scripts.count_documents({"user_id": uid})
    return {
        "projects": projects_total,
        "drafts": drafts,
        "published": published,
        "scripts": scripts_total,
        "minutes_saved": projects_total * 45,
    }


# ---------- Concierge ----------
@api.post("/concierge")
async def submit_concierge(req: ConciergeReq):
    doc = req.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    doc["status"] = "new"
    await db.concierge_requests.insert_one(doc)
    logger.info(f"[CONCIERGE] {req.email} :: {req.message[:80]}")
    return {"success": True, "id": doc["id"]}


# ---------- Elite Avatar reservations ----------
class EliteReservationReq(BaseModel):
    name: str
    email: EmailStr
    company: Optional[str] = None
    phone: Optional[str] = None
    notes: Optional[str] = None


@api.post("/reservations/elite")
async def reserve_elite(req: EliteReservationReq):
    """Captures interest in the Elite AI Presenter tier (A$249/mo, 12-mo commit).
    No payment yet — we contact them when D-ID integration goes live."""
    doc = req.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["tier"] = "elite_avatar"
    doc["status"] = "waitlist"
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.elite_reservations.insert_one(doc)
    logger.info(f"[ELITE-RESERVE] {req.email} :: {req.company or 'solo'}")

    # Optional: notify admin via Resend (best-effort)
    try:
        if RESEND_KEY:
            resend.Emails.send({
                "from": RESEND_FROM,
                "to": [os.environ.get("ADMIN_EMAIL", "admin@lensflow.com.au")],
                "subject": f"[Elite Reservation] {req.name} · {req.company or 'solo'}",
                "html": f"<p><b>{req.name}</b> ({req.email}, {req.phone or '—'})</p><p>Company: {req.company or '—'}</p><p>Notes: {req.notes or '—'}</p>",
            })
    except Exception:
        pass

    return {"success": True, "id": doc["id"], "message": "You're on the Elite waitlist — we'll be in touch within 24 hours."}


# ---------- Email finished video ----------
class EmailVideoReq(BaseModel):
    video_url: str = Field(min_length=10, max_length=500)
    recipient_email: EmailStr
    recipient_name: Optional[str] = ""
    listing_address: Optional[str] = ""
    sender_message: Optional[str] = ""
    booking_url: Optional[str] = ""        # Agent's Calendly / Google Cal link for "Book inspection"


@api.post("/projects/email-video")
async def email_video(req: EmailVideoReq, user: dict = Depends(get_current_user)):
    """Sends a finished listing video link to the agent's client / vendor / themselves.
    Lets agents share LensFlow output via email without leaving the app."""
    if not RESEND_KEY:
        # Fallback: still log + succeed so agents on console-only setups aren't blocked
        logger.info(f"[VIDEO-EMAIL] (console) {user.get('email')} -> {req.recipient_email}: {req.video_url}")
        return {"success": True, "delivered": False, "message": "Email queued (Resend not configured — link logged)."}

    sender_name = user.get("name", "your LensFlow agent")
    sender_email = user.get("email", "")
    address_line = f" for <strong>{req.listing_address}</strong>" if req.listing_address else ""
    personal = f"<p style=\"font-style:italic;color:#444\">\"{req.sender_message}\"</p>" if req.sender_message else ""
    # Persist the agent's booking URL on the user doc for future emails
    booking_url = (req.booking_url or user.get("booking_url") or "").strip()
    if booking_url and req.booking_url:
        try:
            await db.users.update_one({"_id": user["_id"]}, {"$set": {"booking_url": booking_url}})
        except Exception:
            pass
    book_block = ""
    if booking_url:
        book_block = f"""
        <div style=\"text-align:center;margin-top:8px;margin-bottom:24px\">
          <a href=\"{booking_url}\" style=\"display:inline-block;background:#0F1A2E;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-size:14px;font-weight:600;border:1px solid #C99A2E\">📅 Book a private inspection</a>
        </div>"""

    html = f"""
    <div style="font-family:-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#FAF7F2;color:#0F1A2E">
      <div style="text-align:center;margin-bottom:24px">
        <div style="display:inline-block;width:48px;height:48px;border-radius:50%;background:#C99A2E;line-height:48px;color:#0F1A2E;font-weight:700;font-size:24px;font-family:Georgia,serif">L</div>
        <div style="font-family:Georgia,serif;font-size:28px;margin-top:8px">LensFlow</div>
      </div>
      <h2 style="font-family:Georgia,serif;font-size:24px;font-weight:400;margin:0 0 12px">A new listing video{address_line}</h2>
      <p style="color:#555;line-height:1.5">Hi {req.recipient_name or 'there'},</p>
      <p style="color:#555;line-height:1.5">{sender_name} ({sender_email}) just composed a cinematic listing video and wanted you to see it first.</p>
      {personal}
      <div style="text-align:center;margin:32px 0 8px">
        <a href="{req.video_url}" style="display:inline-block;background:#C99A2E;color:#0F1A2E;padding:14px 28px;border-radius:999px;text-decoration:none;font-weight:600">▶ Watch the video</a>
      </div>
      {book_block}
      <p style="color:#888;font-size:12px;text-align:center;margin-top:32px">LensFlow — AI Real Estate Media Studio · <a href="https://lensflow.com.au" style="color:#C99A2E">lensflow.com.au</a></p>
    </div>
    """

    try:
        resend.Emails.send({
            "from": RESEND_FROM,
            "to": [req.recipient_email],
            "reply_to": sender_email or None,
            "subject": f"A listing video from {sender_name}{address_line.replace('<strong>', '').replace('</strong>', '')}",
            "html": html,
        })
        await db.video_emails.insert_one({
            "user_id": str(user["_id"]),
            "recipient": req.recipient_email,
            "video_url": req.video_url,
            "address": req.listing_address,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        return {"success": True, "delivered": True, "message": "Video link emailed."}
    except Exception as e:
        logger.error(f"Video email failed: {e}")
        raise HTTPException(status_code=502, detail="Email delivery failed. Try again or copy the link directly.")


# ---------- Payments (Stripe) ----------
# Server-side authoritative price packages — never trust the frontend
PAYMENT_PACKAGES = {
    "starter_monthly":      {"amount": 79.00,   "currency": "aud", "label": "Starter · Monthly",  "plan": "starter",      "recurring": True,  "trial_days": 7},
    "professional_monthly": {"amount": 199.00,  "currency": "aud", "label": "Elite · Monthly",    "plan": "elite",        "recurring": True,  "trial_days": 7},
    "elite_avatar_annual":  {"amount": 399.00,  "currency": "aud", "label": "Concierge · Monthly","plan": "concierge_ai", "recurring": True,  "trial_days": 0},
    "concierge_listing":    {"amount": 1790.00, "currency": "aud", "label": "Done-for-You · Per Listing", "plan": "concierge", "recurring": False, "trial_days": 0},
    "bg_premium_pack":      {"amount": 29.90,   "currency": "aud", "label": "Premium Deluxe Background Pack · Lifetime", "plan": None, "recurring": False, "trial_days": 0, "unlock": "premium_backgrounds"},
}


class CheckoutInitReq(BaseModel):
    package_id: str
    origin_url: str


def _stripe_for(request: Request) -> StripeCheckout:
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    return StripeCheckout(api_key=STRIPE_KEY, webhook_url=webhook_url)


@api.post("/payments/checkout")
async def create_checkout(req: CheckoutInitReq, request: Request, user: dict = Depends(get_current_user)):
    if not STRIPE_KEY:
        raise HTTPException(status_code=503, detail="Payments not configured")
    pkg = PAYMENT_PACKAGES.get(req.package_id)
    if not pkg:
        raise HTTPException(status_code=400, detail="Invalid package")

    origin = req.origin_url.rstrip("/")
    success_url = f"{origin}/app/billing/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/pricing?canceled=1"

    metadata = {
        "user_id": str(user["_id"]),
        "user_email": user["email"],
        "package_id": req.package_id,
        "plan": pkg.get("plan") or "",
    }
    if pkg.get("unlock"):
        metadata["unlock"] = pkg["unlock"]

    # --- Recurring subscription with 7-day free trial (uses Stripe SDK directly) ---
    if pkg.get("recurring"):
        try:
            import stripe as _stripe
            _stripe.api_key = STRIPE_KEY
            session = await asyncio.to_thread(
                _stripe.checkout.Session.create,
                mode="subscription",
                payment_method_collection="always",  # card required even during trial
                line_items=[{
                    "price_data": {
                        "currency": pkg["currency"],
                        "product_data": {"name": pkg["label"]},
                        "unit_amount": int(round(pkg["amount"] * 100)),
                        "recurring": {"interval": "month"},
                    },
                    "quantity": 1,
                }],
                subscription_data={
                    "trial_period_days": pkg.get("trial_days", 7),
                    "metadata": metadata,
                },
                customer_email=user["email"],
                success_url=success_url,
                cancel_url=cancel_url,
                metadata=metadata,
                allow_promotion_codes=True,
            )
            await db.payment_transactions.insert_one({
                "session_id": session.id,
                "user_id": str(user["_id"]),
                "user_email": user["email"],
                "package_id": req.package_id,
                "plan": pkg["plan"],
                "amount": pkg["amount"],
                "currency": pkg["currency"],
                "trial_days": pkg.get("trial_days", 7),
                "mode": "subscription",
                "payment_status": "trialing",
                "status": "open",
                "metadata": metadata,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            })
            return {"url": session.url, "session_id": session.id}
        except Exception as e:
            logger.exception("Subscription checkout failed")
            raise HTTPException(status_code=500, detail=f"Checkout failed: {str(e)[:200]}")

    # --- One-shot payment (Concierge per-listing) ---
    stripe_checkout = _stripe_for(request)
    checkout_req = CheckoutSessionRequest(
        amount=pkg["amount"],
        currency=pkg["currency"],
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata,
    )
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_req)

    await db.payment_transactions.insert_one({
        "session_id": session.session_id,
        "user_id": str(user["_id"]),
        "user_email": user["email"],
        "package_id": req.package_id,
        "plan": pkg["plan"],
        "amount": pkg["amount"],
        "currency": pkg["currency"],
        "mode": "payment",
        "payment_status": "initiated",
        "status": "open",
        "metadata": metadata,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"url": session.url, "session_id": session.session_id}


@api.get("/payments/status/{session_id}")
async def checkout_status(session_id: str, request: Request, user: dict = Depends(get_current_user)):
    if not STRIPE_KEY:
        raise HTTPException(status_code=503, detail="Payments not configured")
    txn = await db.payment_transactions.find_one({"session_id": session_id, "user_id": str(user["_id"])}, {"_id": 0})
    if not txn:
        raise HTTPException(status_code=404, detail="Session not found")

    # Try live Stripe retrieve; falls back to local txn state if proxy can't retrieve
    # (the sk_test_emergent proxy doesn't support session retrieval, but webhooks still
    # update payment_transactions reliably).
    stripe_checkout = _stripe_for(request)
    payment_status = txn.get("payment_status", "initiated")
    status = txn.get("status", "open")
    amount_total = int(txn.get("amount", 0) * 100)
    currency = txn.get("currency", "usd")

    try:
        status_resp: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
        payment_status = status_resp.payment_status
        status = status_resp.status
        amount_total = status_resp.amount_total
        currency = status_resp.currency
    except Exception as e:
        logger.warning(f"Stripe retrieve failed (using local txn state): {str(e)[:120]}")

    # Update once; never apply credits twice for the same session
    if payment_status == "paid" and txn["payment_status"] != "paid":
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {
                "payment_status": payment_status,
                "status": status,
                "amount_total": amount_total,
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }},
        )
        plan = txn.get("plan") or "pro"
        await db.users.update_one({"_id": ObjectId(txn["user_id"])}, {"$set": {"plan": plan}})
        logger.info(f"[PAYMENT] {txn['user_email']} → plan: {plan} (session {session_id})")
        # Send thank-you email (idempotent — only fires on first transition to paid)
        try:
            buyer = await db.users.find_one({"_id": ObjectId(txn["user_id"])})
            send_payment_thankyou_email(
                to_email=txn["user_email"],
                name=(buyer or {}).get("name", ""),
                plan=plan,
                amount=txn.get("amount", amount_total / 100.0),
                currency=txn.get("currency", "usd"),
            )
        except Exception as e:
            logger.error(f"Thank-you email send failed (non-blocking): {e}")
    elif status == "expired" and txn["status"] != "expired":
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": "expired", "status": "expired",
                      "updated_at": datetime.now(timezone.utc).isoformat()}},
        )
    return {
        "payment_status": payment_status,
        "status": status,
        "amount_total": amount_total,
        "currency": currency,
        "package_id": txn.get("package_id"),
    }


@api.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    if not STRIPE_KEY:
        return {"received": False}
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    try:
        stripe_checkout = _stripe_for(request)
        event = await stripe_checkout.handle_webhook(body, signature)
        if event.payment_status == "paid":
            txn = await db.payment_transactions.find_one({"session_id": event.session_id})
            if txn and txn["payment_status"] != "paid":
                await db.payment_transactions.update_one(
                    {"session_id": event.session_id},
                    {"$set": {"payment_status": "paid", "status": "complete",
                              "updated_at": datetime.now(timezone.utc).isoformat()}},
                )
                plan = (event.metadata or {}).get("plan") or txn.get("plan")
                user_id = (event.metadata or {}).get("user_id") or txn.get("user_id")
                package_id = (event.metadata or {}).get("package_id") or txn.get("package_id")
                pkg = PAYMENT_PACKAGES.get(package_id, {}) if package_id else {}

                # --- One-time UNLOCK purchases (e.g. Premium Background Pack) ---
                if pkg.get("unlock") and user_id:
                    unlock_key = pkg["unlock"]
                    await db.users.update_one(
                        {"_id": ObjectId(user_id)},
                        {"$set": {f"unlocks.{unlock_key}": True,
                                  f"unlocks.{unlock_key}_at": datetime.now(timezone.utc).isoformat()}},
                    )
                    logger.info(f"[WEBHOOK] unlock '{unlock_key}' granted to user {user_id}")
                    return {"received": True}

                # --- Standard plan upgrades ---
                if user_id and plan:
                    await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"plan": plan}})
                    logger.info(f"[WEBHOOK] plan upgrade → {plan} for user {user_id}")
                    # Send thank-you email (idempotent — guarded by payment_status check above)
                    try:
                        buyer = await db.users.find_one({"_id": ObjectId(user_id)})
                        if buyer:
                            send_payment_thankyou_email(
                                to_email=buyer["email"],
                                name=buyer.get("name", ""),
                                plan=plan,
                                amount=txn.get("amount", 0.0),
                                currency=txn.get("currency", "usd"),
                            )
                    except Exception as e:
                        logger.error(f"Thank-you email send failed (non-blocking): {e}")
        return {"received": True}
    except Exception as e:
        logger.exception("Stripe webhook error")
        raise HTTPException(status_code=400, detail=str(e)[:200])


# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------
def _resend_send(to_email: str, subject: str, html: str, from_email: Optional[str] = None):
    """Generic Resend sender used by lumen module (falls back to console log).
    `from_email` lets each sub-app (Lumen, LensFlow) brand its own outbound mail."""
    sender = from_email or RESEND_FROM
    if not RESEND_KEY:
        logger.info(f"[EMAIL DEV] from={sender} :: {subject} → {to_email}")
        return
    try:
        resend.Emails.send({"from": sender, "to": [to_email], "subject": subject, "html": html})
        logger.info(f"[EMAIL] from={sender} :: {subject} → {to_email}")
    except Exception as e:
        logger.error(f"resend send failed: {e}")


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
    await db.login_attempts.create_index("identifier")
    await db.projects.create_index([("user_id", 1), ("updated_at", -1)])
    await db.scripts.create_index([("user_id", 1), ("created_at", -1)])

    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@lensflow.ai").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "LensFlow2026!")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin",
            "role": "admin",
            "plan": "enterprise",
            "created_at": datetime.now(timezone.utc),
        })
        logger.info(f"Seeded admin: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info("Updated admin password")

    # Init Lumen sub-app
    lumen_module.init(
        db=db,
        jwt_secret=get_jwt_secret(),
        frontend_url=FRONTEND_URL,
        emergent_key=EMERGENT_KEY,
        eleven_client=eleven_client,
        stripe_key=STRIPE_KEY,
        resend_send=_resend_send,
        resend_from=LUMEN_RESEND_FROM,
    )
    await lumen_module.ensure_indexes(db)
    logger.info("Lumen sub-app initialized")


@app.on_event("shutdown")
async def shutdown():
    mongo_client.close()


app.include_router(api)
app.include_router(lumen_module.router)

# Studio Plus — Confidence Mode, Glamour Photos, Voice Clone
_studio_plus_router = build_studio_plus_router(
    eleven_client=eleven_client,
    emergent_key=EMERGENT_KEY,
    db=db,
    get_current_user=get_current_user,
)
api_v2 = APIRouter(prefix="/api")
api_v2.include_router(_studio_plus_router)
app.include_router(api_v2)

# CORS — supports wildcard (`*`) while still allowing credentials (cookies)
# by echoing the request origin via regex. Works for preview, production, and
# custom domains without manual whitelisting.
_cors_env = os.environ.get("CORS_ORIGINS", "*").strip()
if _cors_env == "*" or not _cors_env:
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=".*",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    allow_origins = [o.strip() for o in _cors_env.split(",") if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
