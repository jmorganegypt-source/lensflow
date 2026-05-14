import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import MarketingNav from "../components/MarketingNav";
import Footer from "../components/Footer";
import { Check, Sparkles, Crown, Gem, Phone, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api, { formatApiErrorDetail } from "../lib/api";
import { toast } from "sonner";

const tiers = [
  {
    id: "standard",
    name: "Standard",
    price: "$23.90",
    cadence: "AUD / month",
    blurb: "The essential kit for everyday listings.",
    cta: "Start 7-day trial",
    icon: Sparkles,
    highlight: false,
    package_id: "starter_monthly",
    perks: [
      "HD teleprompter",
      "AI script writer",
      "Captions auto-generated",
      "Basic branding overlays",
      "Mia & Oliver presenters",
      "1080p export",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: "$59.90",
    cadence: "AUD / month",
    blurb: "The agent's standard kit. Unlimited drafts.",
    cta: "Start 7-day trial",
    icon: Crown,
    highlight: true,
    package_id: "professional_monthly",
    perks: [
      "Everything in Standard",
      "4K recording",
      "Luxury scene switching",
      "Premium exports (REA · Domain · Rightmove)",
      "All 4 presenters · all accents",
      "No watermark · Priority TTS",
    ],
  },
  {
    id: "elite",
    name: "Elite Partner",
    price: "$1,199",
    cadence: "AUD / month",
    blurb: "White-glove agency tier. Built around your brand.",
    cta: "Start 7-day trial",
    icon: Gem,
    highlight: false,
    package_id: "elite_monthly",
    perks: [
      "Private AI presenter (yours only)",
      "Face upload avatar engine",
      "Voice clone / voice polish",
      "Priority rendering queue",
      "Dedicated account strategist",
      "Custom brand templates",
    ],
  },
  {
    id: "concierge",
    name: "Concierge",
    price: "$1,790",
    cadence: "AUD / per listing",
    blurb: "Done for you. Broadcast-grade, 24-hour turnaround.",
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
  { q: "Can I switch plans later?", a: "Yes — upgrade or downgrade any time. Charges prorate to the day in Settings." },
  { q: "Can I use my own ElevenLabs key?", a: "Yes on Professional and above. Bring your own keys or use ours — costs are bundled either way." },
  { q: "Does Mia's voice work outside Australia?", a: "Mia is bilingual-accent capable (AU/UK). Oliver, Aria and Marcus cover RP, American and Continental respectively." },
  { q: "How are videos delivered?", a: "Direct download in 9:16, 16:9 and 1:1 with captions, plus REA-compatible XML & Domain JSON exports." },
  { q: "What's included in Concierge?", a: "A dedicated editor, strategist, drone/dusk b-roll, scriptwriting and a 24-hour final cut. Per-listing pricing, no commitment." },
];

export default function Pricing() {
  const [open, setOpen] = useState(null);
  const [loadingTier, setLoadingTier] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleTierClick = async (t) => {
    // Payment Link path (no auth required) — direct redirect to hosted Stripe checkout
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
            <div key={t.id} data-testid={`pricing-tier-${t.id}`} className={`relative rounded-3xl p-8 transition-all flex flex-col ${t.highlight ? "bg-[#0E0E0E] border-2 border-[#C99A2E] gold-glow lg:scale-[1.03]" : "glass hover:border-white/15"}`}>
              {t.highlight && (
                <div className="absolute -top-3 left-8 px-3 py-1 rounded-full bg-[#C99A2E] text-black text-[10px] font-mono uppercase tracking-widest">Most popular</div>
              )}
              <t.icon className="text-[#C99A2E] mb-5" size={26} />
              <h3 className="font-serif text-2xl mb-1">{t.name}</h3>
              <p className="text-white/55 text-sm mb-5 min-h-[40px]">{t.blurb}</p>
              <div className="mb-6">
                <span className="font-serif text-5xl tracking-tighter">{t.price}</span>
                <span className="text-white/45 ml-2 text-xs block mt-1">{t.cadence}</span>
                {t.id !== "concierge" && <span className="block mt-2 text-[10px] font-mono uppercase tracking-[0.18em] text-[#C99A2E]">7-day free trial</span>}
              </div>
              <button
                onClick={() => handleTierClick(t)}
                disabled={loadingTier === t.id || (!t.payment_link && user === null)}
                data-testid={`pricing-cta-${t.id}`}
                className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-full font-medium mb-7 transition-colors ${t.highlight ? "bg-[#C99A2E] text-black hover:bg-[#DBC075]" : "glass-strong hover:bg-white/10"} disabled:opacity-60`}
              >
                {loadingTier === t.id || (!t.payment_link && user === null) ? <Loader2 className="animate-spin" size={16} /> : t.cta}
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
              { tool: "BombBomb", price: "$59 USD", ours: "$59.90 AUD" },
              { tool: "Synthesia", price: "$89 USD", ours: "$59.90 AUD" },
              { tool: "HeyGen", price: "$89 USD", ours: "$59.90 AUD" },
              { tool: "Pictory", price: "$59 USD", ours: "$59.90 AUD" },
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
    </div>
  );
}
