import React, { useState } from "react";
import { Link } from "react-router-dom";
import MarketingNav from "../components/MarketingNav";
import Footer from "../components/Footer";
import useDocTitle from "../hooks/useDocTitle";
import api, { formatApiErrorDetail } from "../lib/api";
import { toast } from "sonner";
import { ArrowRight, Loader2, Lock, Sparkles, Eye, Layers } from "lucide-react";

export default function SpatialFlow() {
  useDocTitle("SpatialFlow™ · 2027 Vision — LensFlow");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Need a valid email to hold your seat.");
      return;
    }
    setLoading(true);
    try {
      // Reuse the existing concierge intake endpoint as a generic lead capture
      await api.post("/concierge", {
        name: company || "SpatialFlow Waitlist",
        email,
        phone: "",
        company,
        property_address: "",
        message: "SpatialFlow waitlist — phase 2 vision early access request.",
        package: "SpatialFlow Waitlist",
      });
      setSubmitted(true);
      toast.success("You're on the list.");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Submit failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white" data-testid="spatialflow-page">
      <MarketingNav />

      {/* ============== HERO ============== */}
      <section className="pt-40 pb-24 px-6 lg:px-10 relative overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1100px] h-[600px] rounded-full bg-[#C99A2E]/8 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C99A2E]/12 border border-[#C99A2E]/35 mb-7" data-testid="spatial-phase-badge">
            <Lock size={11} className="text-[#C99A2E]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#C99A2E]">Phase 2 · 2027 vision · Limited reservations</span>
          </div>

          <h1 className="font-serif text-6xl lg:text-8xl tracking-tighter leading-[0.92] mb-7">
            Present like a <br /><span className="italic text-[#C99A2E]">prime-time host.</span>
          </h1>
          <p className="text-lg lg:text-xl text-white/55 max-w-2xl mx-auto leading-relaxed">
            No reading. No awkward eyes. Just natural delivery — script anchored in space, eye-contact locked on lens.
          </p>
          <p className="text-sm text-white/35 max-w-xl mx-auto mt-4 italic">
            A future LensFlow product. We're claiming the brand and the playbook. Reserve your spot at the front of the line.
          </p>

          <a href="#waitlist" className="mt-9 inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#C99A2E] text-black font-medium hover:bg-[#DBC075] transition-colors" data-testid="spatial-hero-cta">
            Reserve early access <ArrowRight size={15} />
          </a>
        </div>
      </section>

      {/* ============== THE VISION (3 concept blocks) ============== */}
      <section className="px-6 lg:px-10 py-20 border-y border-white/5 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#C99A2E] mb-3">The Concept</div>
            <h2 className="font-serif text-4xl lg:text-5xl tracking-tighter">What we're <span className="italic text-[#C99A2E]">building toward.</span></h2>
            <p className="text-white/45 text-sm mt-4 max-w-xl mx-auto">Three pillars of the SpatialFlow vision. Each one is a research direction — not a shipped product.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {[
              {
                icon: Eye,
                title: "Look at the lens, always",
                body: "A neural pass that holds the speaker's gaze on-camera even while they read. Today this exists in research; we want it on every agent's phone.",
              },
              {
                icon: Layers,
                title: "Script anchored in space",
                body: "Imagine the next sentence floating just to the left of the camera, exactly where your peripheral vision goes. AR-native teleprompter, no glance-away tells.",
              },
              {
                icon: Sparkles,
                title: "Spec-grade output",
                body: "Cinema-grade output rendered automatically — colour, lighting and pacing tuned to luxury-property reels. The hard parts done before you press export.",
              },
            ].map((b, i) => (
              <div key={b.title} data-testid={`spatial-pillar-${i}`} className="glass rounded-3xl p-7 border border-white/10 hover:border-[#C99A2E]/30 transition-colors">
                <b.icon size={22} className="text-[#C99A2E] mb-4" />
                <h3 className="font-serif text-2xl mb-2 tracking-tight">{b.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== HONEST TIMELINE ============== */}
      <section className="px-6 lg:px-10 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#C99A2E] mb-3">Roadmap</div>
            <h2 className="font-serif text-4xl lg:text-5xl tracking-tighter">The path <span className="italic text-[#C99A2E]">to spatial.</span></h2>
            <p className="text-white/45 text-sm mt-3">We're not pretending it ships tomorrow. Here's the honest timeline.</p>
          </div>

          <div className="space-y-4">
            {[
              { year: "2026 · NOW", status: "Live", label: "LensFlow Studio", body: "Mia & Oliver AI presenters. Glamour Studio. Confidence Mode. Live on lensflow.com.au today.", live: true },
              { year: "Late 2026", status: "Research", label: "Phone-Native Gaze Correction", body: "Software-only gaze-lock during teleprompter reading on iPhone & Android. Internal alpha planned Q4 2026." },
              { year: "2027", status: "Vision", label: "SpatialFlow™ AR Anchors", body: "Script-as-3D-anchor in iOS/visionOS apps. Targeted at agents recording on Vision Pro & next-gen AR glasses." },
              { year: "2028+", status: "Horizon", label: "Spatial Listing Tours", body: "Buyer walks the listing in AR with Mia narrating room-by-room. The endgame." },
            ].map((row, i) => (
              <div key={i} data-testid={`spatial-timeline-${i}`} className={`grid lg:grid-cols-[160px_auto_1fr] gap-5 items-start rounded-2xl border p-5 ${row.live ? "border-[#C99A2E]/40 bg-[#C99A2E]/[0.04]" : "border-white/10 bg-white/[0.02]"}`}>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/45 mb-1">Stage</div>
                  <div className={`font-serif text-lg ${row.live ? "text-[#C99A2E]" : "text-white"}`}>{row.year}</div>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-[0.18em] ${row.live ? "bg-[#C99A2E] text-black" : "bg-white/5 text-white/55 border border-white/10"}`}>
                  {row.status}
                </div>
                <div>
                  <h4 className="font-serif text-xl mb-1">{row.label}</h4>
                  <p className="text-white/55 text-sm leading-relaxed">{row.body}</p>
                  {row.live && (
                    <Link to="/" className="inline-flex items-center gap-1.5 mt-3 text-[#C99A2E] hover:underline text-xs font-mono uppercase tracking-wider" data-testid="spatial-timeline-livenow">
                      Try what's live now →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== WAITLIST ============== */}
      <section id="waitlist" className="px-6 lg:px-10 py-24 border-t border-white/5 bg-gradient-to-b from-[#0a0a0a] to-[#050505]">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C99A2E]/12 border border-[#C99A2E]/35 mb-6">
            <Lock size={11} className="text-[#C99A2E]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#C99A2E]">Reservation list · Founder-led briefing</span>
          </div>
          <h2 className="font-serif text-4xl lg:text-5xl tracking-tighter mb-4">
            Be the first <span className="italic text-[#C99A2E]">to see it.</span>
          </h2>
          <p className="text-white/55 text-base mb-9">
            Reserve a seat for the first SpatialFlow briefing. We'll show working prototypes and the agency partnership programme before anyone else.
          </p>

          {submitted ? (
            <div className="rounded-3xl glass border border-[#C99A2E]/30 p-10" data-testid="spatial-waitlist-success">
              <div className="font-serif text-3xl text-[#C99A2E] mb-2">You're on the list.</div>
              <p className="text-white/55 text-sm">When SpatialFlow opens its first briefing, you'll be the first to hear from us at hello@lensflow.com.au.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="glass rounded-3xl p-6 lg:p-8 space-y-4 text-left border border-white/10" data-testid="spatial-waitlist-form">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.22em] text-white/45 mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@agency.com.au"
                  className="w-full bg-black/40 border border-white/15 rounded-2xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#C99A2E] transition-colors"
                  data-testid="spatial-waitlist-email"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.22em] text-white/45 mb-2">Agency / brokerage (optional)</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Your agency name"
                  className="w-full bg-black/40 border border-white/15 rounded-2xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#C99A2E] transition-colors"
                  data-testid="spatial-waitlist-company"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                data-testid="spatial-waitlist-submit"
                className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-full bg-[#C99A2E] text-black font-medium hover:bg-[#DBC075] disabled:opacity-60 transition-colors"
              >
                {loading ? <><Loader2 size={15} className="animate-spin" /> Reserving…</> : <>Reserve early access <ArrowRight size={15} /></>}
              </button>
              <p className="text-[11px] text-white/35 text-center">We won't spam. One email when SpatialFlow opens, and that's it.</p>
            </form>
          )}
        </div>
      </section>

      {/* ============== HONESTY DISCLOSURE FOOTER ============== */}
      <section className="px-6 lg:px-10 py-10 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-white/30 text-[11px] leading-relaxed">
            SpatialFlow™ is a future product currently under research and brand development by LensFlow. <strong className="text-white/55">No SpatialFlow features ship yet.</strong> The roadmap above represents our planned direction and is subject to change. To use what's available today — Mia & Oliver AI presenters, Glamour Studio, Confidence Mode and Done-for-You production — visit <Link to="/pricing" className="text-[#C99A2E] hover:underline">our pricing page</Link>.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
