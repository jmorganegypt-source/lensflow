import React, { useState } from "react";
import { Link } from "react-router-dom";
import MarketingNav from "../components/MarketingNav";
import Footer from "../components/Footer";
import { Check, Sparkles, Crown, Phone } from "lucide-react";

const tiers = [
  {
    id: "starter",
    name: "Starter",
    price: "$0",
    cadence: "Free forever",
    blurb: "Test the engine on your next listing.",
    cta: "Start free",
    href: "/register",
    icon: Sparkles,
    highlight: false,
    perks: [
      "3 AI scripts / month",
      "1 AI presenter (Mia)",
      "Teleprompter recorder",
      "720p export",
      "Watermarked",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$149",
    cadence: "per month",
    blurb: "The agent's standard kit. Unlimited drafts.",
    cta: "Choose Pro",
    href: "/register",
    icon: Crown,
    highlight: true,
    perks: [
      "Unlimited AI scripts",
      "All 4 presenters · all accents",
      "1080p · 4K export",
      "REA · Domain · Rightmove formatting",
      "No watermark",
      "Priority TTS rendering",
    ],
  },
  {
    id: "enterprise",
    name: "Concierge",
    price: "From $1,490",
    cadence: "per listing",
    blurb: "We produce. You publish. White-glove team.",
    cta: "Book a call",
    href: "/concierge",
    icon: Phone,
    highlight: false,
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
  { q: "What's the catch on the free plan?", a: "Genuinely none. 3 scripts/month, watermarked output. We make money when you publish more than that — so we let the work speak first." },
  { q: "Can I use my own ElevenLabs key?", a: "Yes on Pro and above. Bring your own keys or use ours — costs are bundled either way." },
  { q: "Does Mia's voice work outside Australia?", a: "Mia is bilingual-accent capable (AU/UK). Oliver, Aria and Marcus cover RP, American and Continental respectively." },
  { q: "How are videos delivered?", a: "Direct download in 9:16, 16:9 and 1:1 with captions, plus REA-compatible XML & Domain JSON exports." },
  { q: "Can I cancel anytime?", a: "Yes. One click in Settings, prorated to the day." },
];

export default function Pricing() {
  const [open, setOpen] = useState(null);
  return (
    <div className="min-h-screen bg-[#050505] text-white" data-testid="pricing-page">
      <MarketingNav />
      <section className="pt-40 pb-24 px-6 lg:px-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="text-xs uppercase tracking-[0.25em] font-mono text-[#C99A2E] mb-5">Pricing</div>
          <h1 className="font-serif text-6xl lg:text-8xl tracking-tighter leading-[0.95] mb-6">
            Free to start.<br /><span className="italic text-[#C99A2E]">Cinematic by month two.</span>
          </h1>
          <p className="text-lg text-white/55 max-w-2xl mx-auto">Pick a plan that matches your listing volume. Upgrade or downgrade at any time.</p>
        </div>
      </section>

      <section className="px-6 lg:px-10 pb-24">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
          {tiers.map((t) => (
            <div key={t.id} data-testid={`pricing-tier-${t.id}`} className={`relative rounded-3xl p-10 transition-all ${t.highlight ? "bg-[#0E0E0E] border-2 border-[#C99A2E] gold-glow scale-[1.02]" : "glass hover:border-white/15"}`}>
              {t.highlight && (
                <div className="absolute -top-3 left-10 px-3 py-1 rounded-full bg-[#C99A2E] text-black text-[10px] font-mono uppercase tracking-widest">Most popular</div>
              )}
              <t.icon className="text-[#C99A2E] mb-5" size={28} />
              <h3 className="font-serif text-3xl mb-1">{t.name}</h3>
              <p className="text-white/55 text-sm mb-6">{t.blurb}</p>
              <div className="mb-6">
                <span className="font-serif text-6xl tracking-tighter">{t.price}</span>
                <span className="text-white/45 ml-2 text-sm">{t.cadence}</span>
              </div>
              <Link to={t.href} data-testid={`pricing-cta-${t.id}`} className={`block text-center w-full py-3.5 rounded-full font-medium mb-8 transition-colors ${t.highlight ? "bg-[#C99A2E] text-black hover:bg-[#DBC075]" : "glass-strong hover:bg-white/10"}`}>
                {t.cta}
              </Link>
              <ul className="space-y-3">
                {t.perks.map((p, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/75">
                    <Check size={16} className="text-[#C99A2E] shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
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
