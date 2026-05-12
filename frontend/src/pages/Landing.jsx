import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import MarketingNav from "../components/MarketingNav";
import Footer from "../components/Footer";
import api from "../lib/api";
import { ArrowUpRight, Play, Sparkles, Mic, Film, Send, Check, Star, Zap, Shield, Globe2 } from "lucide-react";

const HERO_BG = "/assets/property/sunset-pool.jpg";
const FEATURE_BG = "/assets/property/tropical-villa.jpg";
const AGENT_HERO = "/assets/property/agent-hero.jpg";
const TELEPROMPTER_DEMO = "/assets/property/teleprompter-demo.jpg";
const ELITE_ESTATE = "/assets/property/elite-estates.jpg";
const AGENT_TESTIMONIAL = "/assets/property/agent-marcus.jpg";

const stats = [
  { v: "12×", l: "Faster than agencies", id: "stat-1" },
  { v: "<5 min", l: "From brief to broadcast", id: "stat-2" },
  { v: "$23.90", l: "Standard / month", id: "stat-3" },
  { v: "20%", l: "Below competitors", id: "stat-4" },
];

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-80px" }, transition: { duration: 0.7, ease: "easeOut" } };

export default function Landing() {
  const [presenters, setPresenters] = useState([]);

  useEffect(() => {
    api.get("/presenters").then(r => setPresenters(r.data.presenters || [])).catch(() => {});
  }, []);

  return (
    <div className="bg-[#050505] text-white min-h-screen" data-testid="landing-page">
      <MarketingNav />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-28 pb-20 overflow-hidden grain">
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="" className="w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-[#050505]" />
          <div className="absolute inset-0 hero-radial" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 w-full">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <motion.div className="lg:col-span-7" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8" data-testid="hero-badge">
                <span className="w-1.5 h-1.5 bg-[#C99A2E] rounded-full animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-white/70">
                  AI Real Estate Media · Australia & Global
                </span>
              </div>

              <h1 className="font-serif text-5xl sm:text-7xl lg:text-[7.5rem] leading-[0.9] tracking-tighter mb-8" data-testid="hero-title">
                Listings <span className="italic text-[#C99A2E]">that close</span><br />
                in <span className="italic">minutes</span>.
              </h1>

              <p className="text-lg sm:text-xl text-white/65 max-w-xl leading-relaxed mb-10 font-light">
                Generate broadcast-grade property videos with AI presenters, AR teleprompter & studio polish — without filming a single take yourself.
              </p>

              <div className="flex flex-wrap gap-4 mb-12" data-testid="hero-cta-group">
                <Link to="/register" data-testid="hero-cta-primary" className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#C99A2E] text-black font-medium hover:bg-[#DBC075] transition-all hover:scale-[1.02]">
                  <Sparkles size={18} />
                  <span>Start Recording</span>
                  <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
                <Link to="/presenters" data-testid="hero-cta-secondary" className="inline-flex items-center gap-3 px-8 py-4 rounded-full glass-strong hover:bg-white/10 transition-colors text-white">
                  <Play size={16} className="text-[#C99A2E]" />
                  <span>Hear Mia & Oliver</span>
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-xl">
                {stats.map((s) => (
                  <div key={s.id} data-testid={s.id}>
                    <div className="font-serif text-3xl text-[#C99A2E]">{s.v}</div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-white/45 font-mono mt-1">{s.l}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div className="lg:col-span-5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.2 }}>
              <div className="relative">
                <div className="absolute -inset-6 bg-[#C99A2E]/15 blur-3xl rounded-full" />
                <div className="relative glass-strong rounded-3xl p-2 gold-glow">
                  <div className="aspect-[4/5] rounded-2xl overflow-hidden relative bg-[#0A0A0A]">
                    <img src={AGENT_HERO} alt="LensFlow AI Presenter" className="w-full h-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/95 via-black/40 to-transparent">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">Live Preview</span>
                      </div>
                      <div className="font-serif text-2xl mb-1">Mia · Luxury Residential</div>
                      <p className="text-white/70 text-sm">Australian-British · Warm tone</p>
                    </div>
                    <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full glass-strong text-xs font-mono uppercase tracking-wider">
                      AI Presenter
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* logos strip */}
        <div className="absolute bottom-0 inset-x-0 z-10 border-t border-white/5 bg-black/40 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex items-center justify-between gap-6 flex-wrap text-white/40 text-xs uppercase tracking-[0.2em] font-mono">
            <span>Built for</span>
            <span>REA Group</span>
            <span>Domain</span>
            <span>Rightmove</span>
            <span>Zillow</span>
            <span>Compass</span>
            <span>LuxuryEstate</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — clean 4-step linear flow */}
      <section className="relative py-28 px-6 lg:px-10 border-b border-white/5" data-testid="how-it-works">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <div className="text-xs uppercase tracking-[0.25em] font-mono text-[#C99A2E] mb-4">How LensFlow Works</div>
            <h2 className="font-serif text-5xl lg:text-7xl tracking-tighter leading-[0.95]">
              Simple. Fast. <span className="italic text-[#C99A2E]">Powerful.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-2">
            {[
              { n: "1", t: "Write", d: "Add your script — or let our AI assistant draft it from a single listing prompt.", Icon: Sparkles, testid: "step-write" },
              { n: "2", t: "Record", d: "Use the AI teleprompter to record cleanly in 4K, or assign a presenter.", Icon: Mic, testid: "step-record" },
              { n: "3", t: "Enhance", d: "AI polishes audio, color and pacing — broadcast finish, automatically.", Icon: Film, testid: "step-enhance" },
              { n: "4", t: "Share", d: "Export 9:16, 16:9 and 1:1 — ready for REA, Domain, Instagram and Reels.", Icon: Send, testid: "step-share" },
            ].map((s, i) => (
              <motion.div
                key={s.n}
                {...fadeUp}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                data-testid={s.testid}
                className="relative group"
              >
                <div className="glass rounded-3xl p-7 h-full hover:border-[#C99A2E]/40 transition-colors">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-full bg-[#C99A2E]/10 border border-[#C99A2E]/30 flex items-center justify-center font-serif text-2xl text-[#C99A2E]">
                      {s.n}
                    </div>
                    <s.Icon size={22} className="text-white/40 group-hover:text-[#C99A2E] transition-colors" />
                  </div>
                  <h3 className="font-serif text-2xl mb-2">{s.t}</h3>
                  <p className="text-white/55 text-sm leading-relaxed">{s.d}</p>
                </div>
                {i < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-2 -translate-y-1/2 z-10 text-[#C99A2E]/50 text-2xl pointer-events-none">›</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* THE THREE EDGES — what makes us first */}
      <section className="relative py-28 px-6 lg:px-10 bg-[#070707] border-b border-white/5" data-testid="three-edges">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C99A2E]/10 border border-[#C99A2E]/30 mb-5">
              <span className="w-1.5 h-1.5 bg-[#C99A2E] rounded-full animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#C99A2E]">World-first features · Built for real estate, not generic video</span>
            </div>
            <h2 className="font-serif text-5xl lg:text-7xl tracking-tighter leading-[0.95]">
              Three things <span className="italic text-[#C99A2E]">no one else offers.</span>
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            <motion.div {...fadeUp} data-testid="edge-confidence" className="glass rounded-3xl p-8 hover:border-[#C99A2E]/40 transition-colors">
              <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#C99A2E] mb-3">01 — Confidence Mode</div>
              <h3 className="font-serif text-3xl mb-4">For agents who'd rather not film themselves.</h3>
              <p className="text-white/60 leading-relaxed mb-5">Drop in your script and listing photos. Pick a presenter. LensFlow composes a finished MP4 listing video — narrated by AI, set to a Ken-Burns slideshow. <span className="text-[#C99A2E]">No filming. No second takes. No camera anxiety.</span></p>
              <Link to="/register" data-testid="edge-confidence-cta" className="inline-flex items-center gap-2 text-[#C99A2E] hover:underline font-medium text-sm">
                Try Confidence Mode <ArrowUpRight size={14} />
              </Link>
            </motion.div>

            <motion.div {...fadeUp} transition={{ duration: 0.7, delay: 0.1 }} data-testid="edge-glamour" className="glass rounded-3xl p-8 hover:border-[#C99A2E]/40 transition-colors">
              <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#C99A2E] mb-3">02 — Glamour Photos</div>
              <h3 className="font-serif text-3xl mb-4">iPhone photos → Architectural Digest grade.</h3>
              <p className="text-white/60 leading-relaxed mb-5">Upload a regular listing photo. Pick a look — Magazine HDR, Golden Hour, Dusk Twilight, Lifestyle, Interior Polish. Powered by Gemini Nano Banana. <span className="text-[#C99A2E]">No more crap phone shots dragging your listing down.</span></p>
              <Link to="/register" data-testid="edge-glamour-cta" className="inline-flex items-center gap-2 text-[#C99A2E] hover:underline font-medium text-sm">
                Try Glamour Studio <ArrowUpRight size={14} />
              </Link>
            </motion.div>

            <motion.div {...fadeUp} transition={{ duration: 0.7, delay: 0.2 }} data-testid="edge-voice" className="glass rounded-3xl p-8 hover:border-[#C99A2E]/40 transition-colors">
              <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#C99A2E] mb-3">03 — Voice Clone (Elite)</div>
              <h3 className="font-serif text-3xl mb-4">Listings narrated in your voice — without filming.</h3>
              <p className="text-white/60 leading-relaxed mb-5">Record 60 seconds. ElevenLabs clones your voice. Every future listing video is narrated by <em className="text-[#C99A2E]">you</em>, on autopilot. <span className="text-[#C99A2E]">Personal brand without the camera.</span></p>
              <Link to="/pricing" data-testid="edge-voice-cta" className="inline-flex items-center gap-2 text-[#C99A2E] hover:underline font-medium text-sm">
                See Elite Partner <ArrowUpRight size={14} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — Bento Tetris */}
      <section className="relative py-32 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="max-w-3xl mb-16">
            <div className="text-xs uppercase tracking-[0.25em] font-mono text-[#C99A2E] mb-4">Workflow</div>
            <h2 className="font-serif text-5xl lg:text-7xl tracking-tighter leading-[0.95] mb-6">
              From brief to <span className="italic text-[#C99A2E]">broadcast</span>, in four moves.
            </h2>
            <p className="text-white/55 text-lg">No camera crew. No agency. No revision purgatory.</p>
          </motion.div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <motion.div {...fadeUp} className="md:col-span-3 md:row-span-2 glass tracing-border rounded-3xl p-10 relative">
              <div className="font-mono text-xs text-white/40 mb-6">01 — INTAKE</div>
              <Sparkles className="text-[#C99A2E] mb-5" size={36} />
              <h3 className="font-serif text-3xl mb-3">AI Studio writes the script</h3>
              <p className="text-white/60 leading-relaxed mb-6">Paste your listing — GPT-5.2 returns a broadcast-cadence script in your tone, within seconds.</p>
              <div className="glass-strong rounded-2xl p-4 font-mono text-xs text-white/70 space-y-1">
                <div className="text-[#C99A2E]">{"// generated_script"}</div>
                <div>"Behind these gates, a Federation manor reborn..."</div>
                <div className="text-white/30">~62 sec · luxury · warm</div>
              </div>
            </motion.div>

            <motion.div {...fadeUp} className="md:col-span-3 glass tracing-border rounded-3xl p-8 overflow-hidden relative">
              <img src={TELEPROMPTER_DEMO} alt="" className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-25 pointer-events-none" />
              <div className="relative">
                <div className="font-mono text-xs text-white/40 mb-4">02 — RECORD</div>
                <Mic className="text-[#C99A2E] mb-4" size={28} />
                <h3 className="font-serif text-2xl mb-2">Or speak it yourself</h3>
                <p className="text-white/55 text-sm">AR teleprompter overlay on iPhone, iPad & desktop. Eye-line stays on camera.</p>
              </div>
            </motion.div>

            <motion.div {...fadeUp} className="md:col-span-3 glass tracing-border rounded-3xl p-8">
              <div className="font-mono text-xs text-white/40 mb-4">03 — VOICE</div>
              <Film className="text-[#C99A2E] mb-4" size={28} />
              <h3 className="font-serif text-2xl mb-2">Mia & Oliver narrate</h3>
              <p className="text-white/55 text-sm">ElevenLabs-grade voices in Australian-British, RP and Continental accents.</p>
            </motion.div>

            <motion.div {...fadeUp} className="md:col-span-2 glass rounded-3xl p-8 tracing-border">
              <div className="font-mono text-xs text-white/40 mb-4">04 — PUBLISH</div>
              <Send className="text-[#C99A2E] mb-4" size={28} />
              <h3 className="font-serif text-2xl mb-1">REA & Instagram-ready</h3>
              <p className="text-white/55 text-sm">9:16, 16:9, 1:1 — exported in one click.</p>
            </motion.div>

            <motion.div {...fadeUp} className="md:col-span-4 glass rounded-3xl p-10 relative overflow-hidden">
              <img src={ELITE_ESTATE} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
              <div className="relative">
                <div className="font-mono text-xs text-[#C99A2E] mb-3">CONCIERGE — WHITE GLOVE</div>
                <h3 className="font-serif text-3xl mb-3">Prefer it done for you?</h3>
                <p className="text-white/60 mb-6 max-w-md">Hand the listing to our editors. 24-hour turnaround, broadcast deliverables.</p>
                <Link to="/concierge" data-testid="bento-concierge-cta" className="inline-flex items-center gap-2 text-[#C99A2E] hover:underline font-medium">
                  Request a quote <ArrowUpRight size={16} />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PRESENTERS marquee */}
      <section className="py-24 border-y border-white/5 bg-[#070707] overflow-hidden">
        <motion.div {...fadeUp} className="max-w-7xl mx-auto px-6 lg:px-10 mb-12">
          <div className="text-xs uppercase tracking-[0.25em] font-mono text-[#C99A2E] mb-4">The Cast</div>
          <h2 className="font-serif text-5xl lg:text-6xl tracking-tighter">Voices that sell <span className="italic">prestige</span>.</h2>
        </motion.div>

        <div className="relative">
          <div className="flex gap-6 marquee-track w-max">
            {[...presenters, ...presenters].map((p, i) => (
              <Link key={i} to="/presenters" className="block w-[300px] shrink-0 group" data-testid={`marquee-presenter-${i}`}>
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
                  <img src={p.avatar} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/95 to-transparent">
                    <div className="font-serif text-2xl">{p.name}</div>
                    <div className="text-xs font-mono text-white/60 uppercase tracking-wider">{p.accent}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <Link to="/presenters" className="inline-flex items-center gap-2 px-7 py-3 rounded-full glass-strong hover:bg-white/10 text-sm" data-testid="presenters-explore-cta">
            Explore all presenters <ArrowUpRight size={14} />
          </Link>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-32 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
          {[
            { q: "We replaced a $14K agency line item with LensFlow in one weekend.", a: "Jasmine Reid", r: "Principal · Sotheby's Mosman", id: "test-1", img: AGENT_HERO },
            { q: "Mia closed two viewings before the listing went live. The hook is unreal.", a: "Daniel Whitford", r: "Director · Belle Property", id: "test-2", img: AGENT_TESTIMONIAL },
            { q: "Mayfair to Manly in one platform. The concierge tier is genuinely magic.", a: "Hugo Lambert", r: "Knight Frank · London", id: "test-3", img: null },
          ].map((t) => (
            <motion.div key={t.id} {...fadeUp} data-testid={t.id} className="glass rounded-3xl p-10 hover:border-white/15 transition-colors">
              <div className="flex gap-1 mb-6">{[0,1,2,3,4].map(i => <Star key={i} size={14} className="fill-[#C99A2E] text-[#C99A2E]" />)}</div>
              <p className="font-serif text-xl leading-snug mb-8">"{t.q}"</p>
              <div className="flex items-center gap-4">
                {t.img && (
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 shrink-0">
                    <img src={t.img} alt={t.a} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="text-sm">
                  <div className="font-medium">{t.a}</div>
                  <div className="text-white/40 font-mono text-xs uppercase tracking-wider mt-0.5">{t.r}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* WHY LENSFLOW */}
      <section className="py-32 px-6 lg:px-10 bg-[#070707] border-y border-white/5">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          {[
            { Icon: Zap, t: "Real-time generation", d: "GPT-5.2 + ElevenLabs deliver hero edits in under 5 minutes." },
            { Icon: Shield, t: "Brand-safe", d: "Trained on luxury copywriting. Never generic, never AI-flavored." },
            { Icon: Globe2, t: "27 markets", d: "Sydney to Manhattan, with local accent libraries and unit metrics." },
            { Icon: Sparkles, t: "Cinematic by default", d: "Color, sound, captions and pacing tuned for prestige listings." },
          ].map((f, i) => (
            <motion.div key={i} {...fadeUp} className="space-y-4" data-testid={`feature-${i}`}>
              <f.Icon className="text-[#C99A2E]" size={28} />
              <h4 className="font-serif text-2xl">{f.t}</h4>
              <p className="text-white/55 text-sm leading-relaxed">{f.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PRICING TEASER */}
      <section className="py-32 px-6 lg:px-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <div className="text-xs uppercase tracking-[0.25em] font-mono text-[#C99A2E] mb-4">Pricing</div>
            <h2 className="font-serif text-5xl lg:text-7xl tracking-tighter mb-6">
              From $23.90 a month. <span className="italic text-[#C99A2E]">Cancel anytime.</span>
            </h2>
            <p className="text-white/55 text-lg max-w-2xl mx-auto mb-10">Four tiers — Standard, Professional, Elite Partner and Concierge. <span className="text-[#C99A2E]">20% under any comparable AI video tool</span>, guaranteed.</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-3xl mx-auto">
              {[
                { name: "Standard", price: "$23.90", note: "/ mo" },
                { name: "Professional", price: "$59.90", note: "/ mo", featured: true },
                { name: "Elite", price: "$1,199", note: "/ mo" },
                { name: "Concierge", price: "$1,790", note: "/ listing" },
              ].map((p, i) => (
                <div key={i} data-testid={`pricing-teaser-${p.name.toLowerCase()}`} className={`rounded-2xl p-5 ${p.featured ? "bg-[#C99A2E] text-black" : "glass"}`}>
                  <div className={`text-[10px] font-mono uppercase tracking-[0.18em] mb-2 ${p.featured ? "text-black/60" : "text-white/45"}`}>{p.name}</div>
                  <div className="font-serif text-2xl">{p.price}</div>
                  <div className={`text-xs ${p.featured ? "text-black/60" : "text-white/40"}`}>{p.note}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/pricing" data-testid="landing-pricing-cta" className="px-8 py-4 rounded-full bg-[#C99A2E] text-black font-medium hover:bg-[#DBC075] transition-colors">See full pricing</Link>
              <Link to="/register" data-testid="landing-register-cta" className="px-8 py-4 rounded-full glass-strong hover:bg-white/10">Create account</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-32 px-6 lg:px-10 overflow-hidden">
        <div className="absolute inset-0">
          <img src={FEATURE_BG} alt="" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-black/70 to-[#050505]" />
        </div>
        <motion.div {...fadeUp} className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-6xl lg:text-8xl tracking-tighter leading-[0.95] mb-8">
            Your next listing<br /><span className="italic text-[#C99A2E]">deserves cinema</span>.
          </h2>
          <p className="text-xl text-white/65 mb-10">Open the studio. Your first hero edit ships before your coffee gets cold.</p>
          <Link to="/register" data-testid="final-cta" className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-[#C99A2E] text-black font-medium text-lg hover:bg-[#DBC075] transition-all hover:scale-[1.02] gold-glow">
            Start recording today
            <ArrowUpRight size={20} />
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
