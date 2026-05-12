import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import MarketingNav from "../components/MarketingNav";
import Footer from "../components/Footer";
import api from "../lib/api";
import {
  ArrowUpRight, Play, Sparkles, Mic, Film, Send, Check, Star, Camera,
  Wand2, Volume2, Trophy, Eye, Upload, Building2, Crown,
} from "lucide-react";

// Local assets
const MIA_PORTRAIT = "/assets/property/mia-headshot.jpg";
const OLIVER_PORTRAIT = "/assets/property/oliver-portrait.jpg";
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
  const [presenters, setPresenters] = useState([]);
  useEffect(() => {
    api.get("/presenters").then((r) => setPresenters(r.data.presenters || [])).catch(() => {});
  }, []);

  return (
    <div className="bg-[#FAF7F2] text-[#0F1A2E] min-h-screen" data-testid="landing-page">
      <MarketingNav />

      {/* ============== HERO ============== */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        {/* Soft warm gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7F2] via-[#F5EFE3] to-[#FAF7F2] pointer-events-none" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full bg-[#C99A2E]/8 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-12 gap-10 items-center">
          {/* LEFT — Copy */}
          <motion.div {...fadeUp} className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#C99A2E]/40 shadow-sm mb-7" data-testid="hero-badge">
              <Trophy size={12} className="text-[#C99A2E]" />
              <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#0F1A2E]/70">#1 AI Real Estate Media Platform</span>
            </div>

            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl tracking-tighter leading-[0.95] mb-6" data-testid="hero-headline">
              Turn Listings Into <br />
              <span className="text-[#C99A2E]">Luxury Experiences.</span>
            </h1>

            <p className="text-lg text-[#0F1A2E]/70 max-w-xl leading-relaxed mb-8" data-testid="hero-subhead">
              Read. Record. Transform. AI presenters, magazine-grade photo enhancement and premium listing assets — built for the agents who win the prestige market.
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

          {/* RIGHT — Phone teleprompter + Mia + Oliver cards */}
          <motion.div {...stagger(1)} className="lg:col-span-6 relative">
            <div className="relative h-[560px] lg:h-[640px]">
              {/* MIA card — left back */}
              <div className="absolute left-0 top-12 w-[42%] aspect-[3/4.2] rounded-2xl overflow-hidden bg-[#0F1A2E] shadow-2xl transform -rotate-3" data-testid="hero-mia-card">
                <img src={MIA_PORTRAIT} alt="Mia — LensFlow AI Presenter" className="w-full h-full object-cover object-top" />
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/95 via-black/50 to-transparent text-white">
                  <div className="text-[9px] font-mono uppercase tracking-[0.22em] text-[#C99A2E] mb-1">AI Presenter · 01</div>
                  <div className="font-serif text-lg leading-none">Mia</div>
                  <div className="text-white/65 text-[10px] mt-1">Australian-British · Warm</div>
                </div>
              </div>

              {/* OLIVER card — right back */}
              <div className="absolute right-0 top-12 w-[42%] aspect-[3/4.2] rounded-2xl overflow-hidden bg-[#0F1A2E] shadow-2xl transform rotate-3" data-testid="hero-oliver-card">
                <img src={OLIVER_PORTRAIT} alt="Oliver — LensFlow AI Presenter" className="w-full h-full object-cover object-top" />
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/95 via-black/50 to-transparent text-white">
                  <div className="text-[9px] font-mono uppercase tracking-[0.22em] text-[#C99A2E] mb-1">AI Presenter · 02</div>
                  <div className="font-serif text-lg leading-none">Oliver</div>
                  <div className="text-white/65 text-[10px] mt-1">British RP · Authoritative</div>
                </div>
              </div>

              {/* PHONE teleprompter — front center */}
              <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[58%] aspect-[9/19] rounded-[2.5rem] bg-[#0A0A0A] shadow-[0_30px_80px_-20px_rgba(15,26,46,0.45)] border-[6px] border-[#1A1A1A] overflow-hidden" data-testid="hero-phone">
                {/* Status bar */}
                <div className="flex items-center justify-between px-5 pt-3 text-white text-[10px] font-mono">
                  <span>9:41</span>
                  <span className="flex items-center gap-1 text-red-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span>00:00:45</span>
                  </span>
                  <span>1080p</span>
                </div>
                {/* Teleprompter script */}
                <div className="px-5 py-6">
                  <p className="text-white text-[13px] leading-relaxed">
                    Welcome to this extraordinary waterfront residence, where <span className="text-[#C99A2E]">modern elegance</span> meets breathtaking views. Every detail has been meticulously designed to deliver the ultimate luxury <span className="text-[#C99A2E]">lifestyle</span>.
                  </p>
                </div>
                {/* Property preview thumbnail */}
                <div className="mx-5 rounded-xl overflow-hidden h-[110px] mb-5 relative">
                  <img src={HERO_PROPERTY} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-black/60 text-white text-[9px] font-mono uppercase tracking-wider">Live Preview</div>
                </div>
                {/* Record button */}
                <div className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-8 px-6">
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/70 text-[10px] font-mono">Aa</div>
                  <div className="w-14 h-14 rounded-full bg-red-500 ring-4 ring-white/30 shadow-lg" />
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/70"><Camera size={14} /></div>
                </div>
              </div>

              {/* Floating chip — top right */}
              <div className="absolute -top-2 right-4 px-3 py-1.5 rounded-full bg-white shadow-lg flex items-center gap-2 z-10" data-testid="hero-chip-4k">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#0F1A2E]">4K · Cinematic</span>
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
              <div className="aspect-[5/4] relative overflow-hidden bg-[#0F1A2E]">
                <img src={MIA_PORTRAIT} alt="Mia" className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-700" />
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
              <div className="aspect-[5/4] relative overflow-hidden bg-[#0F1A2E]">
                <img src={OLIVER_PORTRAIT} alt="Oliver" className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-700" />
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
              See all 4 presenters · Aria · Marcus too <ArrowUpRight size={14} />
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
            <h2 className="font-serif text-4xl lg:text-6xl tracking-tighter mb-5 leading-[0.95]">From $23.90 / month. <br/><span className="italic text-[#C99A2E]">20% under any competitor.</span></h2>
            <p className="text-[#0F1A2E]/60 text-lg max-w-2xl mx-auto mb-10">Four tiers — Standard, Professional, Elite Partner and Concierge. Cancel anytime.</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10 max-w-3xl mx-auto">
              {[
                { name: "Standard", price: "$23.90", note: "/ month", testid: "tier-standard" },
                { name: "Professional", price: "$59.90", note: "/ month", featured: true, testid: "tier-professional" },
                { name: "Elite Partner", price: "$1,199", note: "/ month", testid: "tier-elite" },
                { name: "Concierge", price: "$1,790", note: "/ listing", testid: "tier-concierge" },
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
