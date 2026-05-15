"""
LensFlow Studio Plus — advanced AI features:
1. Confidence Mode  — AI auto-records on behalf of camera-shy agents
2. Glamour Photos   — Gemini Nano Banana property photo enhancement
3. Voice Clone      — ElevenLabs cloned voice for Elite tier agents

All routes mount under /api/studio-plus/*

IMPORTANT: All heavy imports (PIL, moviepy, ImageContent) are LAZY (inside
the route handlers only) to keep the FastAPI cold-start footprint small so
the backend fits within tight memory limits on the Starter deployment plan.
"""
from __future__ import annotations

import asyncio
import base64
import io
import logging
import os
import tempfile
import time
import uuid
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, Field

logger = logging.getLogger("lensflow.studio_plus")

# Lazy-init video directory — created on first use, NOT at import time,
# to avoid filesystem writes during module load.
_VIDEO_DIR: Optional[Path] = None


def _video_dir() -> Path:
    global _VIDEO_DIR
    if _VIDEO_DIR is None:
        _VIDEO_DIR = Path(tempfile.gettempdir()) / "lensflow_videos"
        _VIDEO_DIR.mkdir(parents=True, exist_ok=True)
    return _VIDEO_DIR

VIDEO_DIR = Path(tempfile.gettempdir()) / "lensflow_videos"

GLAMOUR_PRESETS = {
    "magazine_hdr": (
        "Transform this real-estate photo into a magazine-quality architectural photograph: "
        "balance the exposure, lift shadows, recover highlights, increase clarity and detail, "
        "warm the color temperature slightly. Make the sky vibrant and saturated. "
        "Keep the composition and structure identical — only enhance lighting, color, contrast and sharpness. "
        "Output should look like a published Architectural Digest spread."
    ),
    "golden_hour": (
        "Re-light this property photo as if shot during golden hour. "
        "Warm sunset glow on the building, long soft shadows, golden ambient light filling the scene. "
        "Keep the property geometry and composition identical. "
        "Make windows reflect the warm sky. Output should look cinematic and aspirational."
    ),
    "dusk_twilight": (
        "Re-render this property photo at dusk / twilight. "
        "Cool blue sky with subtle purple-orange gradient at the horizon. "
        "All interior and exterior lights warmly glowing through the windows. "
        "Make the pool, water features and glass reflect the sky. "
        "Keep architecture identical. Output should look like premium dusk real-estate photography."
    ),
    "lifestyle_lush": (
        "Enhance this property photo as a lifestyle lifestyle real-estate shot. "
        "Greener, lusher lawn and foliage. Bluer sky. Brighter, cleaner pool water. "
        "Remove any minor clutter (rubbish bins, hoses, cords, parked cars where reasonable). "
        "Keep the building and overall composition identical. "
        "Output should look like a holiday-retreat brochure."
    ),
    "interior_polish": (
        "Enhance this interior real-estate photo. "
        "Brighten the room evenly, balance window blowout, lift dark corners, "
        "warm the lighting slightly, sharpen details on furniture textures. "
        "Make floors gleam and surfaces look pristine. "
        "Keep furniture placement, room layout and architecture identical. "
        "Output should look like a high-end interior magazine spread."
    ),
}


# ===== Pydantic schemas =====
class ConfidenceVideoReq(BaseModel):
    script: str = Field(min_length=20, max_length=2000)
    voice_id: str
    photo_urls: List[str] = Field(min_length=1, max_length=8)  # data:image/...;base64 strings
    duration_per_photo: float = Field(default=4.5, ge=2.0, le=10.0)
    music_url: Optional[str] = None       # public URL OR data:audio/*;base64 of background music
    music_volume: float = Field(default=0.18, ge=0.0, le=0.6)  # mix level — narration stays loud


class GlamourReq(BaseModel):
    image: str  # base64 data URL or raw base64
    preset: str = "magazine_hdr"
    custom_prompt: Optional[str] = None


class VoiceCloneNameReq(BaseModel):
    name: str = Field(min_length=2, max_length=40)


# ===== Helpers =====
def _strip_b64(data: str) -> str:
    """Strip data URL prefix if present, return raw base64."""
    if "," in data:
        return data.split(",", 1)[1]
    return data


def _decode_image_to_path(b64_data: str, out_dir: Path, idx: int) -> Path:
    from PIL import Image  # lazy
    raw = base64.b64decode(_strip_b64(b64_data))
    img = Image.open(io.BytesIO(raw)).convert("RGB")
    # Resize to 1920x1080 max while preserving aspect
    img.thumbnail((1920, 1080), Image.Resampling.LANCZOS)
    # Pad to 1920x1080 black canvas
    canvas = Image.new("RGB", (1920, 1080), (0, 0, 0))
    x = (1920 - img.width) // 2
    y = (1080 - img.height) // 2
    canvas.paste(img, (x, y))
    path = out_dir / f"frame_{idx:02d}.jpg"
    canvas.save(path, "JPEG", quality=88)
    return path


def _cleanup_old_videos(max_age_seconds: int = 3600) -> None:
    """Best-effort cleanup of videos older than 1 hour."""
    try:
        vdir = _video_dir()
        now = time.time()
        for p in vdir.glob("*.mp4"):
            if now - p.stat().st_mtime > max_age_seconds:
                p.unlink(missing_ok=True)
    except Exception:
        pass


# ===== Builder =====
def build_router(
    eleven_client,  # Optional[ElevenLabs] — typed loosely to avoid eager import
    emergent_key: str,
    db,
    get_current_user,
) -> APIRouter:
    router = APIRouter(prefix="/studio-plus", tags=["studio-plus"])

    # -------- Confidence Mode --------
    from fastapi import Depends

    @router.post("/confidence-video")
    async def confidence_video_route(
        req: ConfidenceVideoReq,
        user: dict = Depends(get_current_user),
    ):
        if not eleven_client:
            raise HTTPException(status_code=503, detail="Voice engine not configured")

        _cleanup_old_videos()
        work_dir = Path(tempfile.mkdtemp(prefix="lf_conf_"))
        try:
            # 1) Generate the narration audio
            def _gen_audio():
                audio_iter = eleven_client.text_to_speech.convert(
                    text=req.script[:1500],
                    voice_id=req.voice_id,
                    model_id="eleven_multilingual_v2",
                    output_format="mp3_44100_128",
                    voice_settings={
                        "stability": 0.60,
                        "similarity_boost": 0.85,
                        "style": 0.30,
                        "use_speaker_boost": True,
                    },
                )
                return b"".join(audio_iter)

            audio_bytes = await asyncio.to_thread(_gen_audio)
            audio_path = work_dir / "narration.mp3"
            audio_path.write_bytes(audio_bytes)

            # 1b) Optional: download/decode background music
            music_path: Optional[Path] = None
            if req.music_url:
                try:
                    if req.music_url.startswith("data:"):
                        # data URL upload from the agent
                        b64 = _strip_b64(req.music_url)
                        music_path = work_dir / "music.input"
                        music_path.write_bytes(base64.b64decode(b64))
                    elif req.music_url.startswith("/assets/"):
                        # Self-hosted track served by the React frontend public folder
                        local = Path("/app/frontend/public") / req.music_url.lstrip("/")
                        if local.exists():
                            music_path = work_dir / "music.input"
                            music_path.write_bytes(local.read_bytes())
                    elif req.music_url.startswith(("http://", "https://")):
                        # Remote URL — fetch in a thread
                        def _fetch():
                            import urllib.request
                            req_obj = urllib.request.Request(req.music_url, headers={"User-Agent": "LensFlow/1.0"})
                            with urllib.request.urlopen(req_obj, timeout=15) as r:
                                return r.read()
                        mb = await asyncio.to_thread(_fetch)
                        music_path = work_dir / "music.input"
                        music_path.write_bytes(mb)
                except Exception as me:
                    logger.warning(f"Music load failed, proceeding without: {me}")
                    music_path = None

            # 2) Decode photos to 1920x1080 jpgs
            frame_paths = [
                _decode_image_to_path(p, work_dir, i) for i, p in enumerate(req.photo_urls)
            ]

            # 3) Compose video using moviepy in a worker thread
            def _render() -> Path:
                from moviepy import ImageClip, AudioFileClip, CompositeAudioClip, concatenate_videoclips, afx
                audio = AudioFileClip(str(audio_path))
                target_total = max(audio.duration, len(frame_paths) * 2.5)
                per = target_total / len(frame_paths)
                clips = []
                for fp in frame_paths:
                    c = ImageClip(str(fp), duration=per)
                    # Gentle Ken-Burns zoom (1.0 -> 1.06)
                    c = c.resized(lambda t, per=per: 1 + 0.06 * (t / per))
                    c = c.with_position("center")
                    clips.append(c)

                # Mix narration + (optional) music
                final_audio = audio
                music_clip = None
                if music_path and music_path.exists():
                    try:
                        music_clip = AudioFileClip(str(music_path))
                        # Loop music if shorter than narration; trim if longer
                        if music_clip.duration < target_total:
                            music_clip = music_clip.with_effects([afx.AudioLoop(duration=target_total)])
                        else:
                            music_clip = music_clip.subclipped(0, target_total)
                        # Lower the music volume so narration is dominant
                        music_clip = music_clip.with_effects([afx.MultiplyVolume(req.music_volume)])
                        final_audio = CompositeAudioClip([music_clip, audio])
                    except Exception as mix_err:
                        logger.warning(f"Music mix failed: {mix_err} — using narration only")
                        music_clip = None

                video = concatenate_videoclips(clips, method="compose").with_audio(final_audio)
                out = _video_dir() / f"confidence_{uuid.uuid4().hex}.mp4"
                video.write_videofile(
                    str(out),
                    fps=24,
                    codec="libx264",
                    audio_codec="aac",
                    preset="veryfast",
                    threads=2,
                    logger=None,
                )
                audio.close()
                if music_clip:
                    try:
                        music_clip.close()
                    except Exception:
                        pass
                for c in clips:
                    c.close()
                video.close()
                return out

            video_path = await asyncio.to_thread(_render)

            import gc
            gc.collect()  # Reclaim moviepy buffers before sending response

            return {
                "video_url": f"/api/studio-plus/video/{video_path.name}",
                "duration_seconds": int(video_path.stat().st_size > 0) * 1,  # placeholder
                "size_bytes": video_path.stat().st_size,
                "mode": "confidence",
            }
        except Exception as e:
            logger.exception("Confidence video render failed")
            import gc
            gc.collect()
            raise HTTPException(status_code=500, detail=f"Video render failed: {str(e)[:200]}")
        finally:
            # Best-effort cleanup of source dir (keep output mp4)
            try:
                for f in work_dir.iterdir():
                    f.unlink(missing_ok=True)
                work_dir.rmdir()
            except Exception:
                pass

    @router.get("/video/{filename}")
    async def serve_video(filename: str):
        # Filename safety: only allow our generated naming pattern
        if not filename.startswith("confidence_") or not filename.endswith(".mp4"):
            raise HTTPException(status_code=404, detail="Not found")
        path = _video_dir() / filename
        if not path.exists():
            raise HTTPException(status_code=404, detail="Video expired or not found")
        from fastapi.responses import FileResponse
        return FileResponse(str(path), media_type="video/mp4", filename="lensflow-listing.mp4")

    # -------- Music library (royalty-free quick-picks) --------
    @router.get("/music/library")
    async def list_music():
        """Curated royalty-free background tracks (self-hosted under /assets/music/).
        Frontend gets the list, sends the chosen track URL back in /confidence-video.music_url.
        Source: SoundHelix royalty-free demo library — free for commercial use, no attribution required."""
        # NOTE: returns absolute paths so Confidence Mode (which posts to backend) can fetch them
        # The frontend uses these for preview playback as well.
        return {
            "tracks": [
                {"id": "luxury_cinematic", "label": "Luxury Cinematic", "mood": "Soaring · piano · strings",       "url": "/assets/music/track-1.mp3"},
                {"id": "warm_acoustic",    "label": "Warm Acoustic",    "mood": "Guitar · sunshine · home",         "url": "/assets/music/track-2.mp3"},
                {"id": "modern_corporate", "label": "Modern · Confident","mood": "Clean · professional · uplifting","url": "/assets/music/track-3.mp3"},
                {"id": "ambient_calm",     "label": "Ambient · Spa",    "mood": "Floating pads · gentle pulse",     "url": "/assets/music/track-4.mp3"},
                {"id": "bold_dramatic",    "label": "Bold · Dramatic",  "mood": "Strings · crescendo · cinema",     "url": "/assets/music/track-5.mp3"},
                {"id": "lofi_chill",       "label": "Lo-fi · Loft",     "mood": "Mellow beats · vibe · subtle",     "url": "/assets/music/track-6.mp3"},
            ],
            "note": "All tracks are royalty-free for commercial use. You can also upload your own.",
        }

    # -------- Glamour Photo Studio --------
    @router.get("/glamour/presets")
    async def list_presets():
        return {
            "presets": [
                {"id": k, "label": k.replace("_", " ").title(), "description": v[:140]}
                for k, v in GLAMOUR_PRESETS.items()
            ]
        }

    @router.post("/glamour/enhance")
    async def glamour_enhance(
        req: GlamourReq,
        user: dict = Depends(get_current_user),
    ):
        if not emergent_key:
            raise HTTPException(status_code=503, detail="Image engine not configured")

        prompt = req.custom_prompt or GLAMOUR_PRESETS.get(req.preset)
        if not prompt:
            raise HTTPException(status_code=400, detail="Unknown preset")

        # Lazy imports — keep cold-start memory low
        import gc
        from PIL import Image
        from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

        image_b64_in = _strip_b64(req.image)

        # ---- Downscale upfront to keep memory + payload manageable on small pods ----
        # Source photos from agents are often 5-12 MB DSLR shots. Gemini Nano works fine at 1600px.
        try:
            raw = base64.b64decode(image_b64_in)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid base64 image data")

        # Discard the raw input b64 string ASAP — it's a duplicate of `raw`
        del image_b64_in

        try:
            with Image.open(io.BytesIO(raw)) as im:
                im.load()  # force-decode while file handle is open
                if im.mode not in ("RGB", "L"):
                    im = im.convert("RGB")
                max_side = 1600
                if max(im.size) > max_side:
                    im.thumbnail((max_side, max_side), Image.LANCZOS)
                buf = io.BytesIO()
                im.save(buf, format="JPEG", quality=85, optimize=True)
                downscaled = buf.getvalue()
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(status_code=400, detail="Could not read image — please upload a JPG, PNG or WebP")
        finally:
            del raw  # free the original bytes

        upload_b64 = base64.b64encode(downscaled).decode("ascii")
        del downscaled

        try:
            chat = LlmChat(
                api_key=emergent_key,
                session_id=f"glamour-{user.get('_id', 'anon')}-{uuid.uuid4().hex[:8]}",
                system_message="You enhance real-estate photographs to magazine quality.",
            )
            chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(
                modalities=["image", "text"]
            )

            msg = UserMessage(
                text=prompt,
                file_contents=[ImageContent(upload_b64)],
            )
            del upload_b64  # we don't need it after the chat has it

            text_resp, images = await chat.send_message_multimodal_response(msg)

            if not images:
                raise HTTPException(status_code=502, detail="Image engine returned no result. Try a different photo or preset.")

            out = images[0]
            mime = out.get("mime_type", "image/png")
            data_out = out["data"]  # base64 string from Gemini
            notes = (text_resp or "")[:300]

            # Free the chat object + returned images ref BEFORE we return the response
            # (the response body itself still needs the b64 string)
            del images, out, chat, msg, text_resp

            # Track usage (best-effort — never block the response)
            try:
                await db.glamour_jobs.insert_one({
                    "user_id": str(user["_id"]),
                    "preset": req.preset,
                    "created_at": time.time(),
                })
            except Exception:
                pass

            response = {
                "enhanced_image": f"data:{mime};base64,{data_out}",
                "preset": req.preset,
                "notes": notes,
            }
            gc.collect()
            return response
        except HTTPException:
            gc.collect()
            raise
        except Exception as e:
            logger.exception("Glamour enhance failed")
            err = str(e)
            gc.collect()
            raise HTTPException(status_code=500, detail=f"Enhancement failed: {err[:200]}")

    # -------- Voice Clone (Elite tier) --------
    def _ensure_elite(user: dict) -> None:
        plan = (user.get("plan") or "free").lower()
        if plan not in {"elite", "concierge", "enterprise", "admin"}:
            raise HTTPException(
                status_code=403,
                detail="Voice cloning is an Elite Partner feature. Upgrade to unlock your own AI voice.",
            )

    @router.post("/voice-clone/create")
    async def voice_clone_create(
        name: str = Form(...),
        audio: UploadFile = File(...),
        user: dict = Depends(get_current_user),
    ):
        if not eleven_client:
            raise HTTPException(status_code=503, detail="Voice engine not configured")
        _ensure_elite(user)

        if not (audio.content_type or "").startswith("audio/"):
            raise HTTPException(status_code=400, detail="Please upload an audio file (mp3, wav, m4a, etc.)")

        try:
            data = await audio.read()
            if len(data) > 25 * 1024 * 1024:
                raise HTTPException(status_code=413, detail="Audio file must be under 25 MB")

            buf = io.BytesIO(data)
            buf.name = audio.filename or "voice-sample.mp3"

            def _clone():
                return eleven_client.voices.ivc.create(
                    name=name.strip(),
                    files=[buf],
                    description=f"LensFlow agent voice — {name.strip()}",
                )

            result = await asyncio.to_thread(_clone)
            voice_id = getattr(result, "voice_id", None) or getattr(result, "id", None)
            if not voice_id:
                raise HTTPException(status_code=502, detail="Voice clone failed: no voice_id returned")

            # Save to user's record
            await db.users.update_one(
                {"_id": user["_id"]},
                {"$push": {"cloned_voices": {
                    "voice_id": voice_id,
                    "name": name.strip(),
                    "created_at": time.time(),
                }}},
            )
            return {"voice_id": voice_id, "name": name.strip()}
        except HTTPException:
            raise
        except Exception as e:
            logger.exception("Voice clone failed")
            err = str(e).lower()
            if "permissions" in err or "401" in err or "403" in err:
                raise HTTPException(
                    status_code=403,
                    detail="Your ElevenLabs key needs voices_write + voice_cloning permissions. Update key at elevenlabs.io.",
                )
            if "subscription" in err or "voice_limit_reached" in err or "max_voices" in err:
                raise HTTPException(
                    status_code=402,
                    detail="ElevenLabs voice slots are full. Free a slot in your ElevenLabs library, or upgrade plan.",
                )
            raise HTTPException(status_code=500, detail=f"Voice clone failed: {str(e)[:200]}")

    @router.get("/voice-clone/mine")
    async def my_voices(user: dict = Depends(get_current_user)):
        voices = user.get("cloned_voices") or []
        # Strip internal fields, return clean list
        return {"voices": [{"voice_id": v.get("voice_id"), "name": v.get("name")} for v in voices]}

    @router.delete("/voice-clone/{voice_id}")
    async def delete_voice(voice_id: str, user: dict = Depends(get_current_user)):
        _ensure_elite(user)
        # Remove from user document (don't actually delete from ElevenLabs to preserve their library)
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$pull": {"cloned_voices": {"voice_id": voice_id}}},
        )
        return {"success": True}

    return router
