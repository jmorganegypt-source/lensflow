# LensFlow — Product Requirements (Living Doc)

## Original problem statement
User uploaded an existing single-page LENSFLOW HTML site (luxury Australian real estate AI media platform) and asked to "BUILD A BETTER ONE MORE MODERN, MORE FUNCTIONS, MORE CONVERSION rate website". Existing site had: hero with watermark hiding, Mia & Oliver presenter mentions, 4-step "How It Works", gold accent #C99A2E and Playfair Display luxury font.

## User choices (gathered via ask_human)
- **Scope**: Full platform — Recorder, AI Studio, Mia/Oliver presenter library, Pricing/Billing, Concierge form, Dashboard + Landing + Signup/Login
- **AI**: GPT-5.2 via Emergent LLM key for script generation; ElevenLabs for voice (key provided)
- **Auth**: Email/password (JWT)
- **Design**: Cinematic showcase (full-bleed video, glassmorphism, motion-heavy)
- **Market**: Australia + International

## Architecture
- **Backend**: FastAPI on port 8001, `/api` prefix routed via ingress. MongoDB via motor async. Auth via httpOnly JWT cookies + Bearer fallback. Bcrypt for passwords. Brute-force lockout (5 attempts → 15 min). ElevenLabs SDK for TTS. emergentintegrations for GPT-5.2.
- **Frontend**: React 19, react-router-dom v7, axios with `withCredentials`. Tailwind + custom glass/grain/gold utilities. Playfair Display + Outfit + JetBrains Mono fonts. framer-motion for entrance animations. Sonner toasts.

## User personas
1. **Luxury real estate agent** (AU/UK/US): generates polished video scripts and voice-overs without an agency.
2. **Concierge buyer**: wants white-glove production done for them.
3. **Agency principal**: bulk listings, branded plan upgrades.

## What's implemented (2026-05-12)

### Backend endpoints
- Auth: register, login, logout, me, refresh, forgot-password (Resend email + console fallback), reset-password
- Presenters: list (Mia, Oliver, Aria, Marcus) with env-overridable ElevenLabs voice IDs (`os.environ.get(K) or default`)
- TTS preview: ElevenLabs convert (friendly 404 if voice not in user's library)
- AI Studio: GPT-5.2 script generation
- Projects: full CRUD with status filtering
- Dashboard stats
- Concierge form intake
- **Payments (Stripe)**: POST /api/payments/checkout (server-side authoritative packages), GET /api/payments/status/{session_id} (graceful fallback when sk_test_emergent proxy can't retrieve), POST /api/webhook/stripe (signature-verified, flips user.plan to "pro"/"concierge")
- **Email (Resend)**: send_password_reset_email helper sends branded HTML email when RESEND_API_KEY is set, else falls back to console log

### Frontend pages
- Marketing: /, /presenters, /pricing (Stripe Checkout integrated for Pro tier), /concierge, /login, /register, /forgot-password, /reset-password
- App shell `/app/*`: /dashboard, /studio, /recorder, /projects, /settings, **/billing/success (polling with graceful pending fallback)**

## Sibling product — LUMEN (2026-05-12)

Built a fully independent consumer brand sharing the same backend infrastructure.

**Backend** (`/app/backend/lumen.py`, mounted at `/api/lumen/*`):
- Separate `lumen_users` / `lumen_moments` / `lumen_payments` collections, separate JWT scope='lumen', separate cookie `lumen_token`, separate localStorage key `lumen_access_token`
- Catalogs (occasions, looks, music, backgrounds, voices), GPT-5.2 script gen, ElevenLabs TTS, moments CRUD + share tokens + public share view (no auth, increments views, watermark flag), Stripe checkout for 4 packs ($9.90/1h, $17.90/2h, $24.95/3h, $5/mo no-watermark), graceful status polling, branded Resend email on send-moment, minutes gating (trial=unlimited, free=10/mo, credit-based)

**Frontend** (`/lumen/*` routes, totally separate visual language):
- Warm sunrise palette (#FF6B6B coral + #FFD166 sunshine + cream), Fraunces + Plus Jakarta Sans + Caveat hand-script
- Marketing: `/lumen` (photo-heavy hero + 3-step Record/Read/Send + occasion grid + testimonials + final CTA), `/lumen/pricing`, `/lumen/share/:token` (public)
- App `/lumen/app/*`: Home, Create (5-step wizard: occasion → script → style → record → send), Library, Billing (top-ups + watermark sub), Settings

**Tests**: 23/23 new Lumen pytest green + full frontend E2E pass (iteration_6.json).

## PWA support added (2026-05-12)
Both apps are now installable on phone/desktop:
- `/app/frontend/public/manifest.json` (LensFlow, dark + gold) and `/app/frontend/public/lumen.webmanifest` (Lumen, coral + sun)
- Branded SVG icons (`lensflow-icon.svg`, `lumen-icon.svg`)
- `/app/frontend/public/sw.js` — network-first for HTML, cache-first for static assets, never caches `/api/*`
- `/app/frontend/src/pwa.js` — boots SW + dynamically swaps manifest/theme/title based on path (/ vs /lumen)
- `/app/frontend/src/components/PWAInstallPrompt.jsx` — branded "Install app" bottom-card listening for `beforeinstallprompt`
- Apple iOS PWA meta tags added (apple-touch-icon, apple-mobile-web-app-*)
- Both apps pass Lighthouse PWA core requirements (manifest + SW + icons + HTTPS + responsive)

## Deployment & pricing refresh (2026-05-12, later session)
- **Deployed to Emergent**: production URL `https://luxury-video-studio-1.emergent.host`. Pre-deployment health check passed (deployment_agent green).
- **DB query optimization**: Replaced 3 sequential `count_documents` calls in `/api/dashboard/stats` with a single `$facet` aggregation pipeline.
- **Pricing — competitor-beating 4-tier (AUD)**:
  - `starter_monthly` — A$23.90 / mo · Standard
  - `professional_monthly` — A$59.90 / mo · Professional (highlighted)
  - `elite_monthly` — A$1,199 / mo · Elite Partner
  - `concierge_listing` — A$1,790 / listing · Concierge
  - Added "**Lowest Price Guarantee — 20% below any competitor**" gold pill on pricing page.
  - Added competitor comparison strip (BombBomb $59 USD · Synthesia $89 USD · HeyGen $89 USD · Pictory $59 USD all crossed out, our $59.90 AUD shown in gold).
  - "Show us a comparable quote and we'll beat it by 20% — locked in for 12 months" guarantee copy.
- **Landing page refresh**:
  - Hero/feature/concierge images swapped to 5 new user-provided luxury assets: `sunset-pool.jpg`, `tropical-villa.jpg`, `elite-estates.jpg`, `agent-marcus.jpg`, `teleprompter-demo.jpg`.
  - Teleprompter demo phone mockup now visible in the Bento "RECORD" card.
  - Concierge bento card features "Elite Estates · Redefining Luxury Living" branded shot.
  - Testimonials now have agent headshots (Jasmine + Marcus).

## The 3 World-First Features — built 2026-05-12 (this session)
LensFlow now positions as **"The first AI real estate platform built for camera-shy agents."** Three differentiator features:

### 1. Confidence Mode (`/app/confidence`)
- **What**: Camera-shy agents drop a script + 1-8 property photos + pick a presenter. Backend composes a full MP4 listing video (1920x1080 H.264 + AAC audio) with Ken-Burns slideshow + ElevenLabs narration. NO filming required.
- **Backend**: `POST /api/studio-plus/confidence-video` — moviepy + ffmpeg compose. Output stored in `/tmp/lensflow_videos/`, served via `GET /api/studio-plus/video/{filename}`. Cleaned up hourly.
- **Frontend**: `ConfidenceMode.jsx` — 4-step wizard (Script → Photos → Presenter → Render). Result is downloadable MP4.
- **Verified**: 16.4s test render produced valid 865KB MP4, validated with ffprobe (h264 1920x1080, aac audio).

### 2. Glamour Photo Studio (`/app/glamour`)
- **What**: Agent uploads regular listing photo → AI returns magazine-grade architectural shot. 5 presets: Magazine HDR, Golden Hour, Dusk Twilight, Lifestyle Lush, Interior Polish.
- **Integration**: Gemini Nano Banana via `emergentintegrations.llm.chat.LlmChat` with model `gemini-3.1-flash-image-preview`. Uses `EMERGENT_LLM_KEY` (no extra cost to user).
- **Backend**: `POST /api/studio-plus/glamour/enhance` (auth + preset + base64 image in, enhanced base64 image out). Tracks usage in `glamour_jobs` collection.
- **Frontend**: `GlamourStudio.jsx` — preset selector, drop zone, before/after slider, AI notes panel, download button.
- **Verified**: Returned 894KB enhanced JPEG (1365x768) for sunset-pool test photo.

### 3. Voice Clone Studio (Elite tier only, in Settings)
- **What**: Elite plan agents record 60s of their voice → ElevenLabs `voices.ivc.create` → cloned voice_id saved to user record. Used for narration in their own voice.
- **Backend**: `POST /api/studio-plus/voice-clone/create` (multipart audio + name), `GET /api/studio-plus/voice-clone/mine`, `DELETE /api/studio-plus/voice-clone/{voice_id}`. Plan gating: `elite`/`concierge`/`enterprise`/`admin` only.
- **Frontend**: `Settings.jsx` voice-clone section — in-browser MediaRecorder (audio/webm) OR file upload, name field, list of cloned voices with delete button. Non-Elite users see a locked upsell card.
- **Note**: Requires ElevenLabs key with `voices_write` + `voice_cloning` permissions. Friendly error messaging on permission/limit failures.

### Architecture
- New module: `/app/backend/studio_plus.py` — `build_router()` pattern, mounted under `/api/studio-plus/*`.
- New dependencies installed: `ffmpeg` (apt) + `moviepy 2.2.1` (pip) for video composition.
- Sidebar nav (`AppShell.jsx`) updated: Dashboard → AI Studio → **Confidence Mode** → **Glamour Photos** → Recorder → Projects → Settings.
- Landing page now has "Three things no one else offers" section advertising Confidence Mode + Glamour Photos + Voice Clone with direct CTAs.

  - Added clean linear "How LensFlow Works" 4-step section.
  - Stats updated: $23.90 starter price + 20% below competitors callout.
- **Cloudflare cleanup**: User removed `lensflow.com.au` + `www.lensflow.com.au` Pages domain bindings. Pending: re-point DNS to Emergent production URL via Entri in Deployments → Connect Custom Domain.


## Backlog (P0 → P2)
- **P1**: ElevenLabs voice IDs — user's provided key lacks `voices_read` permission and the default preset IDs aren't in their library. They can fix instantly by either (a) adding a voice to their elevenlabs.io library and setting `ELEVENLABS_VOICE_MIA/_OLIVER/_ARIA/_MARCUS` in `backend/.env`, or (b) regenerating an API key with `voices_read` enabled.
- **P1**: D-ID avatar video generation (deferred — user said "skip" for now).
- **P2**: Brute-force keying by `X-Forwarded-For` first hop so K8s ingress IP rotation doesn't split lockout buckets.
- **P2**: Real email delivery for password reset (currently logs link to backend console).
- **P2**: Stripe billing wired to Pricing tier upgrades.
- **P2**: Export presets (REA XML, Domain JSON, 9:16/16:9/1:1 video crop).
- **P2**: Multi-user agency seats.

## Next session priorities
1. If user adds voice IDs → verify TTS round-trips.
2. Wire Stripe to Pricing upgrade buttons (revenue lever).
3. Add referral link generator (shareability for agents).

## Onboarding wizard — built 2026-05-14 (this session)
- **`/onboarding`** route now lives between Register and `/app/dashboard`.
- 5-step wizard (`Onboarding.jsx`): Toolkit → Role → Presenter → Publishing platforms → Brand identity (website + handle).
- Backend: `POST /api/auth/onboarding` persists prefs onto user doc + flips `onboarded:true`. `serialize_user` now returns `onboarded` + `onboarding` dict so the frontend can auto-skip the wizard for returning users.
- Register.jsx now nav's to `/onboarding` after successful sign-up; Onboarding auto-redirects to `/app/dashboard` if `user.onboarded` is already true.
- Verified end-to-end via curl (register → onboarding POST → /me returns prefs).

## Stripe LIVE key + Resend branded sender — 2026-05-14
- Backend `.env` updated to `sk_live_51TVCs2EH…rnxCZ` (lensflow live secret key). Backend restarts cleanly; `/api/health → 200`.
- Resend domain `lensflow.com.au` verified ✓. `RESEND_FROM_EMAIL=LensFlow <noreply@lensflow.com.au>`. Forgot-password flow now dispatches branded emails.
- Production live at https://lensflow.com.au and https://www.lensflow.com.au.

## Onboarding final touch — Mia welcome video (2026-05-14)
- Step 5 of `/onboarding` now plays `mia-clip.mp4` autoplay/muted/looped with "Let's make your first listing — together." quote overlay. Beats BIGVU's static onboarding flow.

## Product completeness sprint — 2026-05-15 (this session)
Three big upgrades to make existing claims actually true:

### 1. 3 script variants (`POST /api/studio/scripts/variants`)
- New endpoint generates **Polished · Casual · Cinematic** in parallel via `asyncio.gather` (3 simultaneous GPT-5.2 calls).
- `_build_script_prompt(req, style=...)` injects style-specific guidance.
- `Studio.jsx` redesigned: 3 chip-style variant tabs, agent picks favourite, voice/copy/save buttons act on the picked one.
- Verified via curl — all 3 styles return clearly distinct opening lines.

### 2. Multi-photo Glamour Studio (up to 5 in parallel)
- `GlamourStudio.jsx` rewritten as multi-photo grid (drop up to 5 → status pills queued/processing/done/error → batch enhance with concurrency cap 2 → individual + bulk download).
- Backend `POST /api/studio-plus/glamour/enhance` unchanged — frontend calls it N times in parallel.

### 3. Music library + custom upload + mixing (Confidence Mode)
- New endpoint `GET /api/studio-plus/music/library` returns 6 self-hosted royalty-free tracks (`/assets/music/track-1..6.mp3`, sourced from SoundHelix CC0, ~50MB).
- `ConfidenceVideoReq` extended with `music_url` + `music_volume` fields; supports `data:audio/...`, `/assets/...`, or external `https://` URL.
- Renderer mixes background music under narration via `CompositeAudioClip` with `afx.AudioLoop` + `afx.MultiplyVolume`. Defaults to 18% volume so narration stays dominant.
- `ConfidenceMode.jsx` Step 4 has a music picker grid (None · 6 quick-picks · Upload your own) with preview-on-click and a volume slider.

## Honest known gaps (P0 next session)
- D-ID lip-sync avatars (presenters are still images + voiceover slideshow, not real talking heads). Need user's D-ID API key.
- "Send to CRM" button (download + email-to-self exists; no native CRM integration yet).
- Talking-head avatar engine claim on Compare.jsx is aspirational — needs D-ID.

## Mobile native app plan (deferred — user picked product fixes first)
- Capacitor wrapping path (CRA-based, not Vite). Target: Google Play first ($25 one-time), then Apple App Store ($99/year, DUNS already submitted).
