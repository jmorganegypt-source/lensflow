import React, { useEffect, useState } from "react";
import useDocTitle from "../hooks/useDocTitle";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import MarketingNav from "../components/MarketingNav";
import Footer from "../components/Footer";
import api from "../lib/api";
import {
  ArrowUpRight, Play, Sparkles, Mic, Film, Send, Check, Star, Camera,
  Wand2, Volume2, Trophy, Eye, Upload, Building2, Crown, MapPin, Loader2, Pause,
} from "lucide-react";

// Local assets
const MIA_PORTRAIT = "/assets/property/mia-headshot.jpg";
const MIA_VIDEO_CLIP = "/assets/property/mia-clip.mp4";
const OLIVER_PORTRAIT = "/assets/property/oliver-portrait.jpg";
const ARIA_PORTRAIT = "/assets/property/aria-portrait.jpg";
const MARCUS_PORTRAIT = "/assets/property/marcus-portrait.jpg";
const HERO_PROPERTY = "/assets/property/sunset-pool.jpg";
const FEATURE_BG = "/assets/property/tropical-villa.jpg";
const ELITE_ESTATE = "/assets/property/elite-estates.jpg";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease: "easeOut" },
};

const stagger = (i) => ({ ...fadeUp, transition: { duration: 0.7, ease: "easeOut", delay: i * 0.08 } });

export default function Landing() {
  useDocTitle("LensFlow — AI Real Estate Video · Stop being a videographer.");
  const [presenters, setPresenters] = useState([]);
  useEffect(() => {
    api.get("/presenters").then((r) => setPresenters(r.data.presenters || [])).catch(() => {});
  }, []);

  // ─── "Mia narrates YOUR address" live demo ───────────────────────────────
  const [demoAddress, setDemoAddress] = useState("");
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoResult, setDemoResult] = useState(null); // { script, audio_url, estimated_duration }
  const [demoError, setDemoError] = useState("");
  const [demoPlaying, setDemoPlaying] = useState(false);
  const demoAudioRef = React.useRef(null);

  const runMiaDemo = async (e) => {
    e?.preventDefault?.();
    const addr = demoAddress.trim();
    if (addr.length < 4) {
      setDemoError("Type a real address — at least the street and suburb.");
      return;
    }
    setDemoError("");
    setDemoLoading(true);
    setDemoResult(null);
    try {
      const { data } = await api.post("/marketing/mia-narrate", { address: addr });
      setDemoResult(data);
      // autoplay after a tick so the <audio> ref is mounted
      setTimeout(() => {
        try {
          demoAudioRef.current?.play();
          setDemoPlaying(true);
        } catch (_) {}
      }, 120);
    } catch (err) {
      const msg = err?.response?.data?.detail || "Mia couldn't reach the studio — try again in a moment.";
      setDemoError(typeof msg === "string" ? msg : "Something went sideways. Try again.");
    } finally {
      setDemoLoading(false);
    }
  };

  const togglePlay = () => {
    const a = demoAudioRef.current;
    if (!a) return;
    if (a.paused) { a.play(); setDemoPlaying(true); }
    else { a.pause(); setDemoPlaying(false); }
  };

  return (
    <div className="bg-[#FAF7F2] text-[#0F1A2E] min-h-screen" data-testid="landing-page">
      <MarketingNav />

      {/* ============== HERO ============== */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        {/* Big white villa background photo */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="/assets/property/villa-hero-bg.jpg"
            alt=""
            className="w-full h-full object-cover"
            style={{ objectPosition: "center 35%" }}
          />
          {/* Soft cream wash so text stays readable */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAF7F2] via-[#FAF7F2]/85 to-[#FAF7F2]/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FAF7F2]" />
        </div>
        <div className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full bg-[#C99A2E]/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-12 gap-10 items-center">
          {/* LEFT — Copy */}
          <motion.div {...fadeUp} className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#C99A2E]/40 shadow-sm mb-7" data-testid="hero-badge">
              <Trophy size={12} className="text-[#C99A2E]" />
              <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#0F1A2E]/70">#1 AI Real Estate Media Platform</span>
            </div>

            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl tracking-tighter leading-[0.95] mb-6" data-testid="hero-headline">
              Stop being a videographer. <br />
              <span className="text-[#C99A2E]">Start being an agent.</span>
            </h1>

            <p className="text-lg text-[#0F1A2E]/70 max-w-xl leading-relaxed mb-8" data-testid="hero-subhead">
              The big apps make you do the work. LensFlow lets Mia do it for you — she writes the script, sets the stage, and reads it on camera. Record on your phone, or skip filming entirely.
            </p>

            <ul className="space-y-3 mb-9" data-testid="hero-bullets">
              {[
                { Icon: Eye,      t: "AI Teleprompter with perfect eye-contact" },
                { Icon: Camera,   t: "Mia & Oliver — your digital presenter twins" },
                { Icon: Wand2,    t: "Property photo glamour enhancement" },
                { Icon: Building2,t: "REA · Domain · Rightmove-ready exports" },
              ].map((b, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#C99A2E]/15 flex items-center justify-center">
                    <b.Icon size={13} className="text-[#C99A2E]" />
                  </span>
                  <span className="text-[#0F1A2E]/80 text-sm">{b.t}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3" data-testid="hero-cta-group">
              <Link to="/register" data-testid="hero-cta-primary" className="group inline-flex items-center gap-2.5 px-7 py-4 rounded-full bg-[#0F1A2E] text-white font-medium hover:bg-[#1A2944] transition-all">
                <Sparkles size={16} className="text-[#C99A2E]" />
                <span>Start your trial</span>
                <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
              <Link to="/concierge" data-testid="hero-cta-secondary" className="inline-flex items-center gap-2.5 px-7 py-4 rounded-full bg-white border border-[#0F1A2E]/15 hover:border-[#0F1A2E]/30 text-[#0F1A2E] transition-colors">
                <Play size={14} className="text-[#C99A2E]" />
                <span>Book a live demo</span>
              </Link>
            </div>

            <div className="flex items-center gap-3 mt-9 pt-7 border-t border-[#0F1A2E]/8" data-testid="hero-trust">
              <div className="flex">
                {[0,1,2,3,4].map(i => <Star key={i} size={13} className="fill-[#C99A2E] text-[#C99A2E]" />)}
              </div>
              <span className="text-xs text-[#0F1A2E]/55 font-mono uppercase tracking-wider">Trusted by elite agents — Sydney · London · Dubai</span>
            </div>
          </motion.div>

          {/* RIGHT — Clean Mia portrait + Oliver as a smaller accent card. No overlay text. */}
          <motion.div {...stagger(1)} className="lg:col-span-6 relative">
            <div className="relative h-[560px] lg:h-[640px] flex items-center justify-center">

              {/* MIA — the star. Talking AI avatar (autoplay, muted, loop). */}
              <div className="absolute left-0 top-0 w-[62%] aspect-[3/4] rounded-3xl overflow-hidden bg-[#F1E9DA] shadow-2xl ring-1 ring-[#C99A2E]/30" data-testid="hero-mia-portrait">
                <video
                  src="/assets/property/mia-avatar.mp4"
                  poster="/assets/property/mia-avatar-poster.jpg"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: "50% 25%" }}
                  data-testid="hero-mia-video"
                />
                <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm shadow-md flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-serif text-[12px] text-[#0F1A2E]">Mia</span>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-[#0F1A2E]/55">AU · UK · Live</span>
                </div>
              </div>

              {/* OLIVER — smaller, separated, no overlap with Mia. Talking AI avatar. */}
              <div className="absolute right-0 bottom-0 w-[44%] aspect-[3/4] rounded-3xl overflow-hidden bg-[#F1E9DA] shadow-2xl ring-1 ring-[#C99A2E]/30" data-testid="hero-oliver-portrait">
                <video
                  src="/assets/property/oliver-avatar.mp4"
                  poster="/assets/property/oliver-avatar-poster.jpg"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: "50% 30%" }}
                  data-testid="hero-oliver-video"
                />
                <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm shadow-md flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-serif text-[12px] text-[#0F1A2E]">Oliver</span>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-[#0F1A2E]/55">UK · RP · Live</span>
                </div>
              </div>

              {/* Single floating chip — top right of the whole composition */}
              <div className="absolute -top-2 right-2 px-3.5 py-1.5 rounded-full bg-[#0F1A2E] text-white shadow-lg flex items-center gap-2 z-10" data-testid="hero-chip-ai">
                <Sparkles size={11} className="text-[#C99A2E]" />
                <span className="text-[10px] font-mono uppercase tracking-wider">Live AI Avatars · Talking</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============== MIA NARRATES YOUR ADDRESS — live conversion demo ============== */}
      <section className="relative py-20 lg:py-24 px-6 lg:px-10 bg-gradient-to-b from-[#FAF7F2] via-white to-[#FAF7F2] border-y border-[#C99A2E]/15 overflow-hidden" data-testid="mia-demo-section">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[420px] rounded-full bg-[#C99A2E]/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-5xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0F1A2E] text-white text-[10px] font-mono uppercase tracking-[0.18em] mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C99A2E] animate-pulse" />
              Try it now · no signup
            </div>
            <h2 className="font-serif text-4xl lg:text-6xl tracking-tighter leading-[0.95] mb-4">
              Type any address. <br/>
              <span className="italic text-[#C99A2E]">Hear Mia narrate it.</span>
            </h2>
            <p className="text-[#0F1A2E]/65 text-base lg:text-lg">
              Ten seconds. Cinematic teaser. Your listing's voice — generated live by our AI presenter. No email, no card, no catch.
            </p>
          </motion.div>

          <motion.form
            {...fadeUp}
            onSubmit={runMiaDemo}
            data-testid="mia-demo-form"
            className="bg-white rounded-3xl border border-[#0F1A2E]/10 shadow-xl shadow-[#0F1A2E]/5 p-5 lg:p-7"
          >
            <div className="flex flex-col md:flex-row items-stretch gap-3">
              <div className="relative flex-1">
                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0F1A2E]/40" />
                <input
                  type="text"
                  data-testid="mia-demo-address-input"
                  value={demoAddress}
                  onChange={(e) => setDemoAddress(e.target.value)}
                  placeholder="12 Wolseley Road, Point Piper NSW"
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-[#FAF7F2] border border-[#0F1A2E]/10 text-[#0F1A2E] placeholder:text-[#0F1A2E]/35 text-base focus:outline-none focus:border-[#C99A2E] focus:bg-white transition-all"
                  maxLength={200}
                  disabled={demoLoading}
                />
              </div>
              <button
                type="submit"
                data-testid="mia-demo-submit"
                disabled={demoLoading || demoAddress.trim().length < 4}
                className="h-14 px-7 rounded-2xl bg-[#0F1A2E] text-white font-medium text-sm tracking-wide hover:bg-[#1A2944] disabled:bg-[#0F1A2E]/30 disabled:cursor-not-allowed transition-all inline-flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {demoLoading ? (
                  <><Loader2 size={16} className="animate-spin" /> Mia's writing…</>
                ) : (
                  <><Volume2 size={16} className="text-[#C99A2E]" /> Hear Mia narrate it</>
                )}
              </button>
            </div>

            {demoError && (
              <div data-testid="mia-demo-error" className="mt-3 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {demoError}
              </div>
            )}

            {demoResult && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                data-testid="mia-demo-result"
                className="mt-6 grid lg:grid-cols-[auto_1fr] gap-5 items-center bg-gradient-to-br from-[#0F1A2E] to-[#1A2944] rounded-2xl p-5 lg:p-6 text-white"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={MIA_PORTRAIT}
                      alt="Mia"
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-[#C99A2E]/60"
                      style={{ objectPosition: "50% 18%" }}
                    />
                    <button
                      type="button"
                      onClick={togglePlay}
                      data-testid="mia-demo-play-toggle"
                      className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#C99A2E] text-black flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                      aria-label={demoPlaying ? "Pause" : "Play"}
                    >
                      {demoPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
                    </button>
                  </div>
                  <div className="hidden lg:block">
                    <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#C99A2E]">Mia · AU/UK</div>
                    <div className="text-sm font-medium">~{demoResult.estimated_duration}s teaser</div>
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#C99A2E] mb-1.5 lg:hidden">Mia · AU/UK · ~{demoResult.estimated_duration}s</div>
                  <p data-testid="mia-demo-script" className="font-serif text-lg lg:text-xl leading-snug text-white/95 italic">
                    "{demoResult.script}"
                  </p>
                </div>
                <audio
                  ref={demoAudioRef}
                  src={demoResult.audio_url}
                  onEnded={() => setDemoPlaying(false)}
                  onPause={() => setDemoPlaying(false)}
                  onPlay={() => setDemoPlaying(true)}
                  data-testid="mia-demo-audio"
                  className="hidden"
                />
              </motion.div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#0F1A2E]/45">
              <div className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#C99A2E]" />
                Live AI · GPT-5.2 script + ElevenLabs voice · 3 free demos / hour
              </div>
              {demoResult && (
                <Link
                  to="/register"
                  data-testid="mia-demo-cta"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C99A2E] text-black font-medium text-xs hover:bg-[#DBC075] transition-colors"
                >
                  Lock in Mia for your listings <ArrowUpRight size={12} />
                </Link>
              )}
            </div>
          </motion.form>
        </div>
      </section>

      {/* ============== WHAT IS LENSFLOW — 3 clear demo cards ============== */}
      <section className="relative py-24 px-6 lg:px-10 bg-white border-y border-[#0F1A2E]/8" data-testid="what-is-lensflow">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-14 max-w-3xl mx-auto">
            <div className="text-[11px] uppercase tracking-[0.25em] font-mono text-[#C99A2E] mb-3">What is LensFlow?</div>
            <h2 className="font-serif text-4xl lg:text-6xl tracking-tighter leading-[0.95] mb-5">
              Three things, one platform. <br /><span className="italic text-[#C99A2E]">All for your listings.</span>
            </h2>
            <p className="text-[#0F1A2E]/65 text-lg">Real estate agents use LensFlow to do three things their listings desperately need — without a film crew, without a designer, without a copywriter.</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* CARD 1 — Glamour Photos */}
            <motion.div {...stagger(0)} data-testid="what-card-1" className="rounded-3xl overflow-hidden bg-[#FAF7F2] border border-[#0F1A2E]/8 hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="aspect-[5/3] relative overflow-hidden bg-[#0F1A2E]">
                <img src="/assets/property/sunset-pool.jpg" alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#C99A2E] text-black text-[9px] font-mono uppercase tracking-wider">01 · Photo Enhancement</div>
                <div className="absolute bottom-3 left-3 right-3 flex justify-between text-white text-[10px] font-mono uppercase tracking-wider">
                  <span className="px-2 py-1 rounded bg-black/50 backdrop-blur">Before</span>
                  <span className="px-2 py-1 rounded bg-[#C99A2E] text-black">After · Magazine HDR</span>
                </div>
              </div>
              <div className="p-7">
                <h3 className="font-serif text-2xl mb-2 tracking-tight">Turn iPhone photos<br />into magazine spreads.</h3>
                <p className="text-[#0F1A2E]/60 text-sm leading-relaxed mb-4">Upload any property photo. Pick a look — Magazine HDR, Golden Hour, Dusk Twilight, Lifestyle Lush, Interior Polish. AI enhances it in ~30 seconds.</p>
                <Link to="/pricing#starter" data-testid="what-card-1-cta" className="inline-flex items-center gap-2 text-[#C99A2E] hover:underline font-medium text-sm">
                  See plans & pricing <ArrowUpRight size={14} />
                </Link>
              </div>
            </motion.div>

            {/* CARD 2 — Confidence Mode (videos for camera-shy agents) */}
            <motion.div {...stagger(1)} data-testid="what-card-2" className="rounded-3xl overflow-hidden bg-[#FAF7F2] border border-[#0F1A2E]/8 hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="aspect-[5/3] relative overflow-hidden bg-[#0F1A2E]">
                <img src={MIA_PORTRAIT} alt="" className="w-full h-full object-cover" style={{ objectPosition: "50% 18%" }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#C99A2E] text-black text-[9px] font-mono uppercase tracking-wider">02 · Listing Videos</div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 text-white text-[10px] font-mono uppercase tracking-wider">
                  <span className="px-2 py-1 rounded bg-red-500/90"><span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"/> Auto-narrated</span></span>
                  <span className="px-2 py-1 rounded bg-black/50 backdrop-blur">MP4 · 1080p</span>
                </div>
              </div>
              <div className="p-7">
                <h3 className="font-serif text-2xl mb-2 tracking-tight">Listing videos —<br />without filming yourself.</h3>
                <p className="text-[#0F1A2E]/60 text-sm leading-relaxed mb-4">Mia or Oliver narrates your listing over a Ken-Burns slideshow of your photos. Get a downloadable MP4 in under a minute. Perfect for camera-shy agents.</p>
                <Link to="/presenters" data-testid="what-card-2-cta" className="inline-flex items-center gap-2 text-[#C99A2E] hover:underline font-medium text-sm">
                  Meet Mia & Oliver <ArrowUpRight size={14} />
                </Link>
              </div>
            </motion.div>

            {/* CARD 3 — Listing Cards / Reels */}
            <motion.div {...stagger(2)} data-testid="what-card-3" className="rounded-3xl overflow-hidden bg-[#FAF7F2] border border-[#0F1A2E]/8 hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="aspect-[5/3] relative overflow-hidden bg-[#0F1A2E]">
                <img src="/assets/property/mia-listing-card.jpg" alt="" className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#C99A2E] text-black text-[9px] font-mono uppercase tracking-wider">03 · Branded Reels</div>
                <div className="absolute bottom-3 left-3 right-3 flex justify-between text-white text-[10px] font-mono uppercase tracking-wider">
                  <span className="px-2 py-1 rounded bg-black/50 backdrop-blur">9:16 · 16:9 · 1:1</span>
                  <span className="px-2 py-1 rounded bg-[#C99A2E] text-black">Auto-branded</span>
                </div>
              </div>
              <div className="p-7">
                <h3 className="font-serif text-2xl mb-2 tracking-tight">Auto-branded reels<br />for every property.</h3>
                <p className="text-[#0F1A2E]/60 text-sm leading-relaxed mb-4">Add price, address, your face & logo automatically. Export 9:16 for Reels, 16:9 for YouTube, 1:1 for Instagram. REA · Domain · Rightmove ready.</p>
                <Link to="/compare" data-testid="what-card-3-cta" className="inline-flex items-center gap-2 text-[#C99A2E] hover:underline font-medium text-sm">
                  Compare vs BIGVU & HeyGen <ArrowUpRight size={14} />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============== WATCH THE PRESENTER EXPERIENCE ============== */}
      <section className="relative py-24 px-6 lg:px-10 bg-[#0F1A2E] text-white overflow-hidden" data-testid="watch-presenter-section">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[#C99A2E]/8 blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <div className="text-[11px] uppercase tracking-[0.25em] font-mono text-[#C99A2E] mb-3">Watch the Presenter Experience</div>
            <h2 className="font-serif text-4xl lg:text-6xl tracking-tighter leading-[0.95] mb-4">See Mia <span className="italic text-[#C99A2E]">narrate a real listing.</span></h2>
            <p className="text-white/65 text-lg max-w-2xl mx-auto">Or record yourself with the AI eye-contact teleprompter. Your call — both deliver broadcast quality.</p>
          </motion.div>

          {/* 3-step linear how-it-works flow */}
          <div className="grid md:grid-cols-3 gap-4 mb-14 max-w-4xl mx-auto">
            {[
              { n: "1", t: "Open on your phone", d: "Your script appears near the camera lens.", testid: "step-phone" },
              { n: "2", t: "Read while recording", d: "Speak naturally with perfect eye contact.", testid: "step-read" },
              { n: "3", t: "Export or use AI presenter", d: "Mia, Oliver, Aria or Marcus narrate for you.", testid: "step-export" },
            ].map((s, i) => (
              <motion.div key={s.n} {...stagger(i)} data-testid={s.testid} className="relative bg-white/[0.04] border border-white/10 rounded-2xl p-6 text-center">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#C99A2E] text-black font-serif text-lg flex items-center justify-center shadow-lg">{s.n}</div>
                <div className="pt-4">
                  <div className="font-serif text-xl mb-2">{s.t}</div>
                  <div className="text-white/55 text-sm">{s.d}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* MIA DEMO video — big and centered */}
          <motion.div {...fadeUp} className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-5 gap-6 items-center">
              {/* Demo video card */}
              <div className="md:col-span-3 relative aspect-[16/10] rounded-3xl overflow-hidden bg-black border border-[#C99A2E]/30 shadow-2xl" data-testid="mia-demo-video">
                {/* Property background — the "AI green-screen" effect */}
                <img
                  src="/assets/property/villa-hero-bg.jpg"
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Soft gradient to anchor Mia */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/15 to-black/35" />

                {/* MIA cutout — positioned right side, in front of the property */}
                <img
                  src={MIA_PORTRAIT}
                  alt="Mia narrating a luxury listing"
                  className="absolute right-0 bottom-0 h-[105%] w-auto object-cover object-top"
                  style={{ objectPosition: "50% 12%", filter: "drop-shadow(-10px 10px 30px rgba(0,0,0,0.4))" }}
                />

                {/* Script subtitle bar — bottom, like BIGVU subtitle overlay */}
                <div className="absolute left-5 right-[45%] bottom-5 space-y-2">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#C99A2E] text-black text-[9px] font-mono uppercase tracking-wider font-medium">
                    Mia · live script
                  </div>
                  <div className="rounded-xl bg-black/70 backdrop-blur-md border border-white/10 p-4">
                    <p className="font-serif text-white text-base leading-snug" data-testid="mia-script-line">
                      "Above Sydney Harbour, <span className="text-[#C99A2E]">the world goes quiet…</span> Then you arrive home."
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-[10px] font-mono text-white/55 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" /> Mia · AU·UK</span>
                      <span>·</span>
                      <span>00:14 / 00:60</span>
                    </div>
                  </div>
                </div>

                {/* Top-left chip */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#C99A2E] text-black text-[9px] font-mono uppercase tracking-wider">Mia Demo · 4K</div>
                {/* Top-right green-screen badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/90 text-white text-[10px] font-mono uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> AI Green-Screen
                </div>
              </div>

              {/* Copy + presenter chips */}
              <div className="md:col-span-2">
                <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#C99A2E] mb-3">Featuring Mia</div>
                <h3 className="font-serif text-3xl tracking-tight mb-4 leading-tight">Female luxury<br />presenter template.</h3>
                <p className="text-white/65 text-sm leading-relaxed mb-6">Mia delivers your script in a warm Australian-British accent — perfect for residential, beachfront and heritage listings. Drop in a property script and she takes over.</p>
                <ul className="space-y-2 mb-6">
                  {["4K cinematic export", "60-second listing video", "REA · Domain · Rightmove ready"].map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-white/75 text-xs">
                      <Check size={12} className="text-[#C99A2E] mt-0.5 shrink-0" /> <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register?next=/app/confidence" data-testid="mia-demo-cta" className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#C99A2E] text-[#0F1A2E] font-medium text-sm hover:bg-[#DBC075] transition-colors">
                  <Sparkles size={14} /> Try Mia free for 7 days
                </Link>
              </div>
            </div>

            {/* All 4 presenters strip */}
            <div className="mt-10 pt-8 border-t border-white/10">
              <div className="text-center mb-5">
                <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-white/45 mb-1">All four presenters · included on every paid tier</div>
              </div>
              <div className="grid grid-cols-4 gap-3 max-w-3xl mx-auto">
                {[
                  { name: "Mia", accent: "AU/UK · Warm", img: MIA_PORTRAIT, op: "50% 18%" },
                  { name: "Oliver", accent: "British RP", img: OLIVER_PORTRAIT, op: "50% 18%" },
                  { name: "Aria", accent: "American · Crisp", img: ARIA_PORTRAIT, op: "50% 18%" },
                  { name: "Marcus", accent: "Continental", img: MARCUS_PORTRAIT, op: "50% 18%" },
                ].map((p) => (
                  <div key={p.name} className="text-center" data-testid={`presenter-chip-${p.name.toLowerCase()}`}>
                    <div className="aspect-square rounded-2xl overflow-hidden bg-[#0A0A0A] mb-2 ring-1 ring-white/10">
                      <img src={p.img} alt={p.name} className="w-full h-full object-cover" style={{ objectPosition: p.op }} />
                    </div>
                    <div className="font-serif text-base">{p.name}</div>
                    <div className="text-white/50 text-[10px] font-mono uppercase tracking-wider">{p.accent}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============== LIVE LISTING DEMO ============== */}
      <section className="relative py-24 px-6 lg:px-10 bg-[#0F1A2E] text-white overflow-hidden" data-testid="live-listing-demo">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#C99A2E]/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div {...fadeUp}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C99A2E]/15 border border-[#C99A2E]/30 mb-5">
              <span className="w-1.5 h-1.5 bg-[#C99A2E] rounded-full animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#C99A2E]">Live demo · Real listing</span>
            </div>
            <h2 className="font-serif text-4xl lg:text-6xl tracking-tighter leading-[0.95] mb-6">
              This is what your <br /><span className="italic text-[#C99A2E]">next listing</span> looks like.
            </h2>
            <p className="text-white/65 text-lg leading-relaxed mb-8">A real Mosman premium listing, narrated by Mia, branded as <em className="text-[#C99A2E]">LENSFLOW PRO ELITE ACCESS</em>. Same Mia. Same Oliver. Any property. Any agent.</p>
            <ul className="space-y-3 mb-8">
              {[
                "Auto-overlay price, address, agent + brokerage",
                "Mia or Oliver narrate in 4 voice profiles",
                "Export 9:16 reel · 16:9 hero · 1:1 social",
              ].map((b, i) => (
                <li key={i} className="flex items-start gap-3 text-white/75 text-sm">
                  <Check size={14} className="text-[#C99A2E] mt-1 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <Link to="/register" data-testid="demo-cta" className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#C99A2E] text-[#0F1A2E] font-medium hover:bg-[#DBC075] transition-colors">
              <Sparkles size={16} /> Make my first listing
              <ArrowUpRight size={16} />
            </Link>
          </motion.div>

          <motion.div {...stagger(1)} className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-black border border-[#C99A2E]/30" data-testid="demo-listing-card">
              <img src="/assets/property/mia-listing-card.jpg" alt="LensFlow listing demo — Mia narrating a Mosman waterfront residence" className="w-full h-full object-cover" />
              <div className="absolute -top-3 -right-3 px-3 py-1.5 rounded-full bg-[#C99A2E] text-black text-[10px] font-mono uppercase tracking-wider shadow-lg">
                Live render
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============== ONE UPLOAD. COMPLETE CAMPAIGN. ============== */}
      <section className="relative py-24 px-6 lg:px-10 bg-white border-y border-[#0F1A2E]/8" data-testid="campaign-flow">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-14">
            <div className="text-[11px] uppercase tracking-[0.25em] font-mono text-[#C99A2E] mb-3">How it works</div>
            <h2 className="font-serif text-4xl lg:text-6xl tracking-tighter leading-[0.95]">One upload. <span className="italic text-[#C99A2E]">Complete campaign.</span></h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-3">
            {[
              { Icon: Upload,  t: "Upload Photos",     d: "Add your property photos or video", testid: "flow-1" },
              { Icon: Camera,  t: "Choose Mia or Oliver", d: "Or upload your own face",          testid: "flow-2" },
              { Icon: Mic,     t: "Read & Record",     d: "Teleprompter, perfect eye-contact",  testid: "flow-3" },
              { Icon: Sparkles,t: "AI Enhances",       d: "Visuals, audio & script polished",   testid: "flow-4" },
              { Icon: Send,    t: "Get Your Assets",   d: "Videos, reels, brochures & copy",    testid: "flow-5" },
            ].map((s, i) => (
              <motion.div key={i} {...stagger(i)} data-testid={s.testid} className="relative">
                <div className="text-center px-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-[#FAF7F2] border border-[#C99A2E]/20 flex items-center justify-center mb-4">
                    <s.Icon size={22} className="text-[#C99A2E]" />
                  </div>
                  <div className="font-serif text-lg mb-1.5 text-[#0F1A2E]">{s.t}</div>
                  <div className="text-xs text-[#0F1A2E]/55 leading-relaxed">{s.d}</div>
                </div>
                {i < 4 && (
                  <div className="hidden lg:block absolute top-8 right-[-12px] text-[#C99A2E]/40 text-xl pointer-events-none">›</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== AI PRESENTERS SHOWCASE ============== */}
      <section className="relative py-28 px-6 lg:px-10" data-testid="presenters-showcase">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-14">
            <div className="text-[11px] uppercase tracking-[0.25em] font-mono text-[#C99A2E] mb-3">Your AI Twins</div>
            <h2 className="font-serif text-4xl lg:text-6xl tracking-tighter leading-[0.95] mb-4">Meet <span className="italic text-[#C99A2E]">Mia & Oliver.</span></h2>
            <p className="text-[#0F1A2E]/60 text-lg max-w-2xl mx-auto">Photoreal AI presenters that speak in your voice and style — so you can be everywhere, without being there.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* MIA */}
            <motion.div {...stagger(0)} data-testid="presenter-mia-card" className="group bg-white border border-[#0F1A2E]/8 rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all">
              <div className="aspect-[4/5] relative overflow-hidden bg-[#0F1A2E]">
                <img src={MIA_PORTRAIT} alt="Mia" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" style={{ objectPosition: "50% 22%" }} />
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur text-[10px] font-mono uppercase tracking-[0.22em] text-[#0F1A2E]">
                  Australian-British
                </div>
              </div>
              <div className="p-7">
                <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#C99A2E] mb-2">AI Presenter · 01</div>
                <h3 className="font-serif text-3xl tracking-tight mb-2">Mia</h3>
                <p className="text-[#0F1A2E]/65 text-sm mb-4">Warm. Engaging. Trustworthy. Best for luxury residential, beachfront and heritage estates.</p>
                <div className="flex flex-wrap gap-2">
                  {["Residential", "Beachfront", "Heritage"].map((t) => (
                    <span key={t} className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider bg-[#FAF7F2] border border-[#0F1A2E]/10 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* OLIVER */}
            <motion.div {...stagger(1)} data-testid="presenter-oliver-card" className="group bg-white border border-[#0F1A2E]/8 rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all">
              <div className="aspect-[4/5] relative overflow-hidden bg-[#0F1A2E]">
                <img src={OLIVER_PORTRAIT} alt="Oliver" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" style={{ objectPosition: "50% 18%" }} />
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur text-[10px] font-mono uppercase tracking-[0.22em] text-[#0F1A2E]">
                  British RP
                </div>
              </div>
              <div className="p-7">
                <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#C99A2E] mb-2">AI Presenter · 02</div>
                <h3 className="font-serif text-3xl tracking-tight mb-2">Oliver</h3>
                <p className="text-[#0F1A2E]/65 text-sm mb-4">Distinguished. Authoritative. Trusted closer. Built for commercial, off-the-plan and investor-grade properties.</p>
                <div className="flex flex-wrap gap-2">
                  {["Commercial", "Off-the-plan", "Investor"].map((t) => (
                    <span key={t} className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider bg-[#FAF7F2] border border-[#0F1A2E]/10 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="text-center mt-10">
            <Link to="/presenters" data-testid="see-all-presenters" className="inline-flex items-center gap-2 text-[#0F1A2E] hover:text-[#C99A2E] transition-colors font-medium text-sm">
              See all 5 presenters · Aria, Marcus, Emma <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ============== THREE EDGES — feature showcase ============== */}
      <section className="relative py-28 px-6 lg:px-10 bg-[#0F1A2E] text-white" data-testid="three-edges">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C99A2E]/15 border border-[#C99A2E]/30 mb-5">
              <span className="w-1.5 h-1.5 bg-[#C99A2E] rounded-full animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#C99A2E]">World-first · Real estate only</span>
            </div>
            <h2 className="font-serif text-4xl lg:text-6xl tracking-tighter leading-[0.95]">Three things <span className="italic text-[#C99A2E]">no one else offers.</span></h2>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-5">
            <motion.div {...stagger(0)} data-testid="edge-confidence" className="bg-white/[0.04] border border-white/10 rounded-3xl p-8 hover:bg-white/[0.06] hover:border-[#C99A2E]/40 transition-all">
              <div className="w-12 h-12 rounded-full bg-[#C99A2E]/15 flex items-center justify-center mb-5"><Camera size={20} className="text-[#C99A2E]" /></div>
              <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#C99A2E] mb-2">01 — Confidence Mode</div>
              <h3 className="font-serif text-2xl mb-3 leading-tight">For agents who'd rather not film themselves.</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-5">Drop a script and listing photos. Pick a presenter. LensFlow composes a finished MP4 listing video — narrated by AI, Ken-Burns slideshow. No camera, no anxiety.</p>
              <Link to="/register" data-testid="edge-confidence-cta" className="inline-flex items-center gap-2 text-[#C99A2E] hover:underline font-medium text-sm">Try Confidence Mode <ArrowUpRight size={14} /></Link>
            </motion.div>

            <motion.div {...stagger(1)} data-testid="edge-glamour" className="bg-white/[0.04] border border-white/10 rounded-3xl p-8 hover:bg-white/[0.06] hover:border-[#C99A2E]/40 transition-all">
              <div className="w-12 h-12 rounded-full bg-[#C99A2E]/15 flex items-center justify-center mb-5"><Wand2 size={20} className="text-[#C99A2E]" /></div>
              <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#C99A2E] mb-2">02 — Glamour Studio</div>
              <h3 className="font-serif text-2xl mb-3 leading-tight">iPhone photos → Architectural Digest grade.</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-5">Upload a regular listing photo. Pick a look — Magazine HDR, Golden Hour, Dusk Twilight, Lifestyle, Interior Polish. Powered by Gemini Nano Banana.</p>
              <Link to="/register" data-testid="edge-glamour-cta" className="inline-flex items-center gap-2 text-[#C99A2E] hover:underline font-medium text-sm">Try Glamour Studio <ArrowUpRight size={14} /></Link>
            </motion.div>

            <motion.div {...stagger(2)} data-testid="edge-voice" className="bg-white/[0.04] border border-white/10 rounded-3xl p-8 hover:bg-white/[0.06] hover:border-[#C99A2E]/40 transition-all">
              <div className="w-12 h-12 rounded-full bg-[#C99A2E]/15 flex items-center justify-center mb-5"><Volume2 size={20} className="text-[#C99A2E]" /></div>
              <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#C99A2E] mb-2">03 — Voice Clone · Elite</div>
              <h3 className="font-serif text-2xl mb-3 leading-tight">Listings in your voice — without filming.</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-5">Record 60 seconds. ElevenLabs clones your voice. Every future listing video is narrated by you, on autopilot. Personal brand without the camera.</p>
              <Link to="/pricing" data-testid="edge-voice-cta" className="inline-flex items-center gap-2 text-[#C99A2E] hover:underline font-medium text-sm">See Elite Partner <ArrowUpRight size={14} /></Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============== WORKFLOW: From Zero to Sold ============== */}
      <section className="relative py-24 px-6 lg:px-10 bg-[#0a0a0a] text-white" data-testid="workflow-section">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#C99A2E] mb-3">The Workflow</div>
            <h2 className="font-serif text-4xl lg:text-6xl tracking-tighter leading-[0.95]">From <span className="italic text-[#C99A2E]">Zero to Sold</span> in three steps.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: "1", title: "Input",    sub: "Agent uploads property photos and details.",  Icon: Camera },
              { n: "2", title: "Generate", sub: "Mia writes the script — then voices it for you.",         Icon: Sparkles },
              { n: "3", title: "Close",    sub: "The cinematic video hits the market in minutes.", Icon: Trophy },
            ].map((s) => (
              <div key={s.n} className="relative glass rounded-3xl p-7 border border-white/10 hover:border-[#C99A2E]/40 transition-colors" data-testid={`workflow-step-${s.n}`}>
                <div className="absolute -top-3 left-7 px-3 py-1 rounded-full bg-[#C99A2E] text-black text-[10px] font-mono uppercase tracking-widest">Step {s.n}</div>
                <s.Icon size={28} className="text-[#C99A2E] mb-5" />
                <h3 className="font-serif text-3xl tracking-tight mb-2">{s.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== LENSFLOW PHILOSOPHY QUOTE ============== */}
      <section className="relative py-28 px-6 lg:px-10 bg-[#0F1A2E] text-white overflow-hidden" data-testid="philosophy-section">
        <div className="absolute inset-0 bg-gradient-to-br from-[#C99A2E]/5 via-transparent to-transparent" />
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="font-serif text-7xl text-[#C99A2E] leading-none mb-6">"</div>
          <blockquote className="font-serif italic text-3xl lg:text-5xl leading-[1.1] tracking-tighter mb-8">
            Stop being a videographer. Start being an agent. Let <span className="text-[#C99A2E] not-italic">Mia</span> and <span className="text-[#C99A2E] not-italic">Oliver</span> handle the screen while <em className="italic">you</em> handle the sale.
          </blockquote>
          <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#C99A2E]">— The LensFlow Philosophy</div>
        </div>
      </section>

      {/* ============== FOUNDER STORY + GUARANTEE ============== */}
      <section className="relative py-24 px-6 lg:px-10 bg-[#FAF7F2] text-[#0F1A2E]" data-testid="founder-section">
        <div className="max-w-5xl mx-auto grid md:grid-cols-5 gap-10 items-center">
          {/* Portrait column */}
          <div className="md:col-span-2">
            <div className="aspect-square rounded-3xl overflow-hidden border-4 border-[#C99A2E]/30 shadow-2xl" data-testid="founder-portrait">
              <img
                src="/assets/brand/founder.jpg"
                alt="LensFlow Founder"
                className="w-full h-full object-cover"
                style={{ objectPosition: "center top" }}
              />
            </div>
            <div className="mt-4 text-center">
              <div className="font-serif text-xl text-[#0F1A2E]">The Founder</div>
              <div className="text-xs text-[#0F1A2E]/55 font-mono uppercase tracking-wider mt-1">LensFlow · Sydney · Australia</div>
            </div>
          </div>

          {/* Story column */}
          <div className="md:col-span-3">
            <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#C99A2E] mb-3">Why I built this</div>
            <h2 className="font-serif text-4xl lg:text-5xl tracking-tighter leading-[1.05] mb-6">
              Built by an <em className="italic text-[#C99A2E]">agent</em>, for agents who refuse to be videographers.
            </h2>
            <div className="space-y-4 text-[#0F1A2E]/75 leading-relaxed text-[15px]">
              <p>
                I spent years quoting $4,000+ per listing video — drone crews, dusk shoots, voice-over artists, editors. Then I'd wait two weeks for the cut. By the time the video was ready, the vendor had cooled, the buyer had moved on, and the property had stopped trending on REA.
              </p>
              <p>
                LensFlow is the platform I wanted to exist. Mia and Oliver are the production crew I could never afford on every listing — Mia writes your script at 2am, then voices it on camera. <span className="text-[#0F1A2E] font-medium">You hit "render" — the cinematic video is in your inbox before your coffee gets cold.</span>
              </p>
              <p>
                This isn't a generic SaaS dressed up for real estate. It's the operating system I built because the industry deserved one.
              </p>
            </div>

            {/* Guarantee strip */}
            <div className="mt-8 grid grid-cols-3 gap-3" data-testid="guarantee-strip">
              {[
                { icon: Check, title: "Cancel anytime", sub: "No lock-in. No fine print." },
                { icon: Sparkles, title: "7-day free trial", sub: "Watermarked, full feature access." },
                { icon: Star, title: "Built in Australia", sub: "REA · Domain · 4K presets." },
              ].map((g, i) => (
                <div key={i} className="rounded-2xl border border-[#0F1A2E]/10 bg-white p-4 text-center" data-testid={`guarantee-${i}`}>
                  <g.icon size={18} className="text-[#C99A2E] mx-auto mb-1.5" />
                  <div className="text-xs font-medium text-[#0F1A2E]">{g.title}</div>
                  <div className="text-[10px] text-[#0F1A2E]/55 mt-0.5">{g.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============== TRUST STRIP + STATS ============== */}
      <section className="relative py-20 px-6 lg:px-10 bg-white border-y border-[#0F1A2E]/8" data-testid="trust-stats">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-8">
          {[
            { Icon: Trophy, t: "Save 20+ Hours", d: "Per listing" },
            { Icon: Sparkles, t: "Win More Mandates", d: "Premium presentation" },
            { Icon: Crown, t: "Ultra Premium", d: "Stand out instantly" },
            { Icon: Building2, t: "All in One Platform", d: "Everything you need" },
          ].map((s, i) => (
            <motion.div key={i} {...stagger(i)} data-testid={`trust-${i}`} className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-full bg-[#FAF7F2] border border-[#C99A2E]/20 flex items-center justify-center shrink-0">
                <s.Icon size={18} className="text-[#C99A2E]" />
              </div>
              <div>
                <div className="font-serif text-xl tracking-tight">{s.t}</div>
                <div className="text-[#0F1A2E]/55 text-xs font-mono uppercase tracking-wider mt-1">{s.d}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============== PRICING TEASER ============== */}
      <section className="relative py-28 px-6 lg:px-10" data-testid="pricing-teaser">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <div className="text-[11px] uppercase tracking-[0.25em] font-mono text-[#C99A2E] mb-3">Pricing</div>
            <h2 className="font-serif text-4xl lg:text-6xl tracking-tighter mb-5 leading-[0.95]">From $79 / month. <br/><span className="italic text-[#C99A2E]">Less than one listing photographer.</span></h2>
            <p className="text-[#0F1A2E]/60 text-lg max-w-2xl mx-auto mb-10">Four tiers · <span className="text-[#C99A2E] font-medium">7-day free trial on all subscriptions</span> · Cancel anytime.</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10 max-w-3xl mx-auto">
              {[
                { name: "Starter",      price: "$79",    note: "/ month",  testid: "tier-starter" },
                { name: "Elite",        price: "$199",   note: "/ month",  featured: true, testid: "tier-elite" },
                { name: "Concierge",    price: "$399",   note: "/ month",  testid: "tier-concierge-monthly" },
                { name: "Done-for-You", price: "$1,790", note: "/ listing", testid: "tier-done-for-you" },
              ].map((p) => (
                <div key={p.name} data-testid={p.testid} className={`rounded-2xl p-5 border ${p.featured ? "bg-[#0F1A2E] text-white border-[#0F1A2E]" : "bg-white border-[#0F1A2E]/10"}`}>
                  <div className={`text-[10px] font-mono uppercase tracking-[0.18em] mb-2 ${p.featured ? "text-[#C99A2E]" : "text-[#0F1A2E]/45"}`}>{p.name}</div>
                  <div className={`font-serif text-2xl ${p.featured ? "text-white" : "text-[#0F1A2E]"}`}>{p.price}</div>
                  <div className={`text-xs ${p.featured ? "text-white/55" : "text-[#0F1A2E]/45"}`}>{p.note}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/pricing" data-testid="landing-pricing-cta" className="px-8 py-4 rounded-full bg-[#0F1A2E] text-white hover:bg-[#1A2944] font-medium transition-colors">See full pricing</Link>
              <Link to="/register" data-testid="landing-register-cta" className="px-8 py-4 rounded-full bg-white border border-[#0F1A2E]/15 hover:border-[#0F1A2E]/30 text-[#0F1A2E] transition-colors">Create account</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============== FINAL CTA ============== */}
      <section className="relative py-24 px-6 lg:px-10 bg-[#FAF7F2] border-t border-[#0F1A2E]/8" data-testid="final-cta-section">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <h2 className="font-serif text-4xl lg:text-6xl tracking-tighter leading-[0.95] mb-6">
              Your listings. <br /><span className="italic text-[#C99A2E]">Reimagined.</span>
            </h2>
            <p className="text-[#0F1A2E]/65 text-lg max-w-2xl mx-auto mb-9">Join the agents already replacing $14K agency invoices with one platform.</p>
            <Link to="/register" data-testid="final-cta" className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-[#C99A2E] text-[#0F1A2E] font-medium text-lg hover:bg-[#DBC075] transition-all hover:scale-[1.02] shadow-lg">
              Start recording today
              <ArrowUpRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
