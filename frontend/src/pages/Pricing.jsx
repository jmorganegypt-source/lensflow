import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import MarketingNav from "../components/MarketingNav";
import Footer from "../components/Footer";
import { Check, Sparkles, Crown, Gem, Phone, Loader2, Star, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api, { formatApiErrorDetail } from "../lib/api";
import { toast } from "sonner";

const tiers = [
  {
    id: "starter",
    name: "Starter",
    price: "$39",
    cadence: "AUD / month",
    blurb: "Solo agent essentials. Film yourself, beautifully.",
    cta: "Start 7-day trial",
    icon: Sparkles,
    highlight: false,
    package_id: "starter_monthly",
    perks: [
      "HD teleprompter · perfect eye-contact",
      "AI script writer · 1 version",
      "1-photo Glamour Studio",
      "Captions auto-generated",
      "Mia & Oliver presenters",
      "1080p export",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: "$89",
    cadence: "AUD / month",
    blurb: "The agent's complete kit. Film yourself, but bigger.",
    cta: "Start 7-day trial",
    icon: Crown,
    highlight: true,
    package_id: "professional_monthly",
    perks: [
      "Everything in Starter",
      "3 script variants per listing",
      "5-photo Glamour Studio",
      "Confidence Mode video composer",
      "Music library + your own track",
      "All 4 presenters · 4K export",
      "Email finished videos to clients",
      "REA · Domain · Rightmove exports",
    ],
  },
  {
    id: "elite_avatar",
    name: "Elite AI Presenter",
    price: "$249",
    cadence: "AUD / month · 12-month commit",
    blurb: "Mia is your personal AI presenter. You don't film a thing.",
    cta: "Reserve your spot",
    icon: Star,
    highlight: false,
    coming_soon: true,
    perks: [
      "Everything in Professional",
      "Real talking-head AI presenter",
      "Mia / Oliver / Aria / Marcus speak your scripts",
      "Up to 15 finished listing videos / month",
      "12-month commit · annual savings locked",
      "White-glove onboarding call",
      "Priority render queue",
      "Direct line for support",
    ],
  },
  {
    id: "concierge",
    name: "Concierge",
    price: "$1,790",
    cadence: "AUD / per listing",
    blurb: "Done-for-you broadcast production · 24-hour turnaround.",
    cta: "Book Concierge",
    icon: Phone,
    highlight: false,
    package_id: "concierge_listing",
    perks: [
      "Done-for-you production",
      "Dedicated editor & strategist",
      "24-hour turnaround",
      "Drone, dusk & lifestyle b-roll",
      "Localised voice library",
      "SLAs · DPA · invoicing",
    ],
  },
];

const faqs = [
  { q: "What's the Elite AI Presenter tier?", a: "It's our flagship 'AI does everything' option — a real talking-head presenter (Mia/Oliver/Aria/Marcus) actually speaks your script over your photos. No filming required. We're rolling out to a small waitlist first; reserve your spot and we'll contact you when your access opens." },
  { q: "Why a 12-month commit on Elite?", a: "Premium AI avatar engines are sold annually, so we pass that lock-in straight through. In return you get the lowest possible monthly price and locked-in pricing for 12 months." },
  { q: "Can I switch plans later?", a: "Yes — upgrade or downgrade any time. Charges prorate to the day in Settings. (Elite is the only tier with a 12-month commit.)" },
  { q: "Does Mia's voice work outside Australia?", a: "Mia is bilingual-accent capable (AU/UK). Oliver, Aria and Marcus cover RP, American and Continental respectively." },
  { q: "How are videos delivered?", a: "Direct download in 9:16, 16:9 and 1:1 with captions, plus REA-compatible XML & Domain JSON exports. You can also email a video link straight to a vendor or buyer from the app." },
  { q: "What's included in Concierge?", a: "A dedicated editor, strategist, drone/dusk b-roll, scriptwriting and a 24-hour final cut. Per-listing pricing, no commitment." },
];

export default function Pricing() {
  const [open, setOpen] = useState(null);
  const [loadingTier, setLoadingTier] = useState(null);
  const [eliteDialog, setEliteDialog] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleTierClick = async (t) => {
    if (t.coming_soon) {
      setEliteDialog(true);
      return;
    }
    if (t.payment_link) {
      window.location.href = t.payment_link;
      return;
    }
    if (user === null) {
      toast.message("Checking your session…");
      return;
    }
    if (!user) {
      navigate(`/register?next=/pricing&tier=${t.id}`);
      return;
    }
    setLoadingTier(t.id);
    try {
      const { data } = await api.post("/payments/checkout", {
        package_id: t.package_id,
        origin_url: window.location.origin,
      });
      window.location.href = data.url;
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Checkout failed");
    } finally { setLoadingTier(null); }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white" data-testid="pricing-page">
      <MarketingNav />
      <section className="pt-40 pb-12 px-6 lg:px-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C99A2E]/10 border border-[#C99A2E]/30 mb-4" data-testid="trial-badge">
            <span className="w-1.5 h-1.5 bg-[#C99A2E] rounded-full animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#C99A2E]">7-day free trial · Card required · Cancel anytime</span>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C99A2E]/10 border border-[#C99A2E]/30 mb-6" data-testid="price-guarantee-badge">
            <span className="w-1.5 h-1.5 bg-[#C99A2E] rounded-full animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#C99A2E]">Lowest price guarantee · 20% below any competitor</span>
          </div>
          <div className="text-xs uppercase tracking-[0.25em] font-mono text-[#C99A2E] mb-5">Pricing</div>
          <h1 className="font-serif text-6xl lg:text-8xl tracking-tighter leading-[0.95] mb-6">
            Built for the way <br /><span className="italic text-[#C99A2E]">agents really sell.</span>
          </h1>
          <p className="text-lg text-white/55 max-w-2xl mx-auto">Four tiers · Try every feature free for 7 days · Cancel anytime before day 8 and you're never charged.</p>
        </div>
      </section>

      <section className="px-6 lg:px-10 pb-24">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((t) => (
            <div key={t.id} data-testid={`pricing-tier-${t.id}`} className={`relative rounded-3xl p-8 transition-all flex flex-col ${t.highlight ? "bg-[#0E0E0E] border-2 border-[#C99A2E] gold-glow lg:scale-[1.03]" : t.coming_soon ? "bg-gradient-to-b from-[#1a1410] to-[#0E0E0E] border border-[#C99A2E]/40" : "glass hover:border-white/15"}`}>
              {t.highlight && (
                <div className="absolute -top-3 left-8 px-3 py-1 rounded-full bg-[#C99A2E] text-black text-[10px] font-mono uppercase tracking-widest">Most popular</div>
              )}
              {t.coming_soon && (
                <div className="absolute -top-3 left-8 px-3 py-1 rounded-full bg-gradient-to-r from-[#C99A2E] to-[#DBC075] text-black text-[10px] font-mono uppercase tracking-widest">Limited Beta</div>
              )}
              <t.icon className="text-[#C99A2E] mb-5" size={26} />
              <h3 className="font-serif text-2xl mb-1">{t.name}</h3>
              <p className="text-white/55 text-sm mb-5 min-h-[40px]">{t.blurb}</p>
              <div className="mb-6">
                <span className="font-serif text-5xl tracking-tighter">{t.price}</span>
                <span className="text-white/45 ml-2 text-xs block mt-1">{t.cadence}</span>
                {t.id === "starter" || t.id === "professional" ? <span className="block mt-2 text-[10px] font-mono uppercase tracking-[0.18em] text-[#C99A2E]">7-day free trial</span> : null}
                {t.coming_soon && <span className="block mt-2 text-[10px] font-mono uppercase tracking-[0.18em] text-[#C99A2E]">Reserve · No charge yet</span>}
              </div>
              <button
                onClick={() => handleTierClick(t)}
                disabled={loadingTier === t.id || (!t.payment_link && !t.coming_soon && user === null)}
                data-testid={`pricing-cta-${t.id}`}
                className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-full font-medium mb-7 transition-colors ${t.highlight ? "bg-[#C99A2E] text-black hover:bg-[#DBC075]" : t.coming_soon ? "bg-gradient-to-r from-[#C99A2E] to-[#DBC075] text-black hover:opacity-90" : "glass-strong hover:bg-white/10"} disabled:opacity-60`}
              >
                {loadingTier === t.id || (!t.payment_link && !t.coming_soon && user === null) ? <Loader2 className="animate-spin" size={16} /> : t.cta}
              </button>
              <ul className="space-y-3 mt-auto">
                {t.perks.map((p, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/75">
                    <Check size={14} className="text-[#C99A2E] shrink-0 mt-1" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-center text-white/40 text-xs mt-10 font-mono uppercase tracking-[0.2em]">All prices in AUD · GST inclusive · Cancel anytime</p>

        {/* Competitor comparison strip */}
        <div className="max-w-4xl mx-auto mt-14 glass rounded-3xl p-8 lg:p-10" data-testid="competitor-compare">
          <div className="text-center mb-6">
            <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#C99A2E] mb-2">Why LensFlow wins on price</div>
            <h3 className="font-serif text-3xl tracking-tighter">Same job. <span className="italic text-[#C99A2E]">Less money.</span></h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { tool: "BombBomb", price: "$59 USD", ours: "$89 AUD" },
              { tool: "Synthesia", price: "$89 USD", ours: "$89 AUD" },
              { tool: "HeyGen", price: "$89 USD", ours: "$89 AUD" },
              { tool: "BIGVU", price: "$59 USD", ours: "$89 AUD" },
            ].map((c, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/[0.03]" data-testid={`compare-${c.tool.toLowerCase()}`}>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40 mb-1">{c.tool}</div>
                <div className="font-serif text-lg line-through text-white/50">{c.price}</div>
                <div className="font-serif text-xl text-[#C99A2E] mt-1">{c.ours}</div>
                <div className="text-[10px] font-mono text-white/40 mt-1">LensFlow</div>
              </div>
            ))}
          </div>
          <p className="text-white/50 text-sm text-center mt-6 max-w-2xl mx-auto">Show us a comparable quote and we'll <span className="text-[#C99A2E] font-medium">beat it by 20%</span> — locked in for 12 months. <Link to="/compare" className="text-[#C99A2E] underline hover:text-[#DBC075]" data-testid="see-full-comparison">See full comparison →</Link></p>
        </div>
      </section>

      <section className="px-6 lg:px-10 pb-32">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-5xl tracking-tighter mb-10 text-center">Questions, answered.</h2>
          <div className="space-y-2">
            {faqs.map((f, i) => (
              <div key={i} className="glass rounded-2xl overflow-hidden">
                <button data-testid={`faq-${i}`} onClick={() => setOpen(open === i ? null : i)} className="w-full text-left px-6 py-5 flex justify-between items-center">
                  <span className="font-serif text-xl">{f.q}</span>
                  <span className={`text-[#C99A2E] transition-transform ${open === i ? "rotate-45" : ""}`}>+</span>
                </button>
                {open === i && <div className="px-6 pb-6 text-white/65 text-sm leading-relaxed">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      {eliteDialog && <EliteReservationDialog onClose={() => setEliteDialog(false)} />}
    </div>
  );
}

// ---------- Elite Reservation Dialog ----------
function EliteReservationDialog({ onClose }) {
  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e?.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/reservations/elite", form);
      setDone(true);
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Could not save reservation");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose} data-testid="elite-reservation-dialog">
      <div className="bg-gradient-to-b from-[#1a1410] to-[#0a0a0a] border border-[#C99A2E]/40 rounded-3xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        {!done ? (
          <>
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Star size={14} className="text-[#C99A2E]" />
                  <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C99A2E]">Elite AI Presenter · Limited Beta</div>
                </div>
                <h3 className="font-serif text-3xl tracking-tighter">Reserve your spot</h3>
                <p className="text-white/55 text-sm mt-2">A$249/mo · 12-month commit · No charge until your access opens.</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"><X size={14} /></button>
            </div>
            <form onSubmit={submit} className="space-y-3">
              <input type="text" required placeholder="Your name *" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} data-testid="elite-name" className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#C99A2E] focus:outline-none text-sm" />
              <input type="email" required placeholder="Email *" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} data-testid="elite-email" className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#C99A2E] focus:outline-none text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Agency / Company" value={form.company} onChange={(e) => setForm({...form, company: e.target.value})} data-testid="elite-company" className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#C99A2E] focus:outline-none text-sm" />
                <input type="tel" placeholder="Phone" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} data-testid="elite-phone" className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#C99A2E] focus:outline-none text-sm" />
              </div>
              <textarea rows={3} placeholder="What kind of listings? (helps us match the right presenter)" value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} data-testid="elite-notes" className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#C99A2E] focus:outline-none resize-none text-sm" />
              <button type="submit" disabled={submitting} data-testid="elite-submit" className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-gradient-to-r from-[#C99A2E] to-[#DBC075] text-black hover:opacity-90 disabled:opacity-50 font-medium text-sm">
                {submitting ? <><Loader2 className="animate-spin" size={14} /> Saving your spot…</> : <>Reserve my Elite spot</>}
              </button>
              <p className="text-white/45 text-[11px] text-center pt-2">No credit card required at reservation. We'll email you when your access opens with a one-click upgrade link.</p>
            </form>
          </>
        ) : (
          <div className="text-center py-6" data-testid="elite-success">
            <div className="w-14 h-14 rounded-full bg-[#C99A2E]/15 border border-[#C99A2E]/40 flex items-center justify-center mx-auto mb-4">
              <Check size={26} className="text-[#C99A2E]" />
            </div>
            <h3 className="font-serif text-2xl mb-2">You're on the list.</h3>
            <p className="text-white/65 text-sm mb-6">We'll email you within 24 hours with your private Elite onboarding link.</p>
            <button onClick={onClose} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#C99A2E] text-black hover:bg-[#DBC075] font-medium text-sm">Done</button>
          </div>
        )}
      </div>
    </div>
  );
}
