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
- Auth: register, login, logout, me, refresh, forgot-password, reset-password
- Presenters: list (Mia, Oliver, Aria, Marcus) with env-overridable ElevenLabs voice IDs
- TTS preview: ElevenLabs convert (friendly 404 if voice not in user's library)
- AI Studio: GPT-5.2 script generation with property fields, tone, presenter, duration
- Projects: full CRUD with status filtering
- Dashboard stats: project/script counts + minutes_saved
- Concierge form intake

### Frontend pages
- `/` Cinematic landing (hero, bento workflow, marquee presenters, testimonials, feature grid, pricing teaser, final CTA)
- `/login`, `/register`, `/forgot-password`, `/reset-password`
- `/presenters` (public): hear voice previews
- `/pricing` (public): 3 tiers, FAQ accordion
- `/concierge` (public): white-glove quote form
- `/app/dashboard`: stats, quick actions, recent projects
- `/app/studio`: GPT-5.2 script form + editable output + TTS preview + save-to-projects + record CTA
- `/app/recorder`: camera preview, auto-scrolling teleprompter with speed/font controls, record/playback
- `/app/projects`: filterable project library with delete
- `/app/settings`: profile, plan, support links
- Persistent sidebar + mobile bottom-nav inside `/app/*`

### Auth seed
- Admin: `admin@lensflow.ai` / `LensFlow2026!` (also documented in `/app/memory/test_credentials.md`)

## Tests
- 14/14 backend pytest green (iteration_2.json)
- Frontend smoke verified via screenshots (landing + pricing)

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
