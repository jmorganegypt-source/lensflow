import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import MarketingNav from "../components/MarketingNav";
import Footer from "../components/Footer";
import { Check, X, Sparkles, ArrowUpRight, Crown, Trophy, Zap } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: "easeOut" },
};

// Competitor entry-tier comparisons (2026 verified pricing)
const entryComparison = [
  { tool: "LensFlow",  price: "$23.90", currency: "AUD/mo", us: true,  highlight: "20% under everyone" },
  { tool: "BIGVU",     price: "$24.99", currency: "USD/mo", us: false, highlight: "" },
  { tool: "Pictory",   price: "$25.00", currency: "USD/mo", us: false, highlight: "" },
  { tool: "Synthesia", price: "$29.00", currency: "USD/mo", us: false, highlight: "" },
  { tool: "HeyGen",    price: "$29.00", currency: "USD/mo", us: false, highlight: "" },
];

// Pro/Mid-tier comparison
const midComparison = [
  { tool: "LensFlow",  price: "$59.90",  currency: "AUD/mo", us: true,  highlight: "33% under HeyGen" },
  { tool: "BIGVU AI Pro", price: "$39.00", currency: "USD/mo", us: false, highlight: "" },
  { tool: "BIGVU AI Max", price: "$79.90", currency: "USD/mo", us: false, highlight: "" },
  { tool: "Synthesia Creator", price: "$89.00", currency: "USD/mo", us: false, highlight: "" },
  { tool: "HeyGen Pro", price: "$99.00", currency: "USD/mo", us: false, highlight: "" },
];

// Feature matrix
const featureMatrix = [
  { feature: "AI Teleprompter (perfect eye contact)",  lensflow: true,  bigvu: true,  synthesia: false, heygen: true,  pictory: false },
  { feature: "4 photoreal AI presenters",              lensflow: true,  bigvu: false, synthesia: true,  heygen: true,  pictory: false },
  { feature: "Property Photo Glamour Enhancement",     lensflow: true,  bigvu: false, synthesia: false, heygen: false, pictory: false, edge: true },
  { feature: "Confidence Mode (auto-record for you)",  lensflow: true,  bigvu: false, synthesia: false, heygen: false, pictory: false, edge: true },
  { feature: "Personal Voice Clone (your voice)",      lensflow: true,  bigvu: false, synthesia: false, heygen: true,  pictory: false },
  { feature: "REA · Domain · Rightmove auto-exports",  lensflow: true,  bigvu: false, synthesia: false, heygen: false, pictory: false, edge: true },
  { feature: "Auto-overlay price / address / agent",   lensflow: true,  bigvu: false, synthesia: false, heygen: false, pictory: false, edge: true },
  { feature: "9:16 · 16:9 · 1:1 exports",              lensflow: true,  bigvu: true,  synthesia: true,  heygen: true,  pictory: true  },
  { feature: "Australian / British / American voices", lensflow: true,  bigvu: true,  synthesia: true,  heygen: true,  pictory: true  },
  { feature: "Built specifically for real estate",     lensflow: true,  bigvu: false, synthesia: false, heygen: false, pictory: false, edge: true },
  { feature: "PWA — install as mobile app",            lensflow: true,  bigvu: false, synthesia: false, heygen: false, pictory: false, edge: true },
  { feature: "7-day free trial · card required",       lensflow: true,  bigvu: true,  synthesia: false, heygen: false, pictory: false },
  { feature: "AUD pricing · GST inclusive",            lensflow: true,  bigvu: false, synthesia: false, heygen: false, pictory: false, edge: true },
  { feature: "No video minute / credit caps",          lensflow: true,  bigvu: false, synthesia: false, heygen: false, pictory: false },
];

const Cell = ({ on, edge }) => on ? (
  <Check size={18} className={`mx-auto ${edge ? "text-[#C99A2E]" : "text-emerald-400"}`} />
) : (
  <X size={16} className="mx-auto text-white/25" />
);

export default function Compare() {
  return (
    <div className="min-h-screen bg-[#050505] text-white" data-testid="compare-page">
      <MarketingNav />

      {/* HERO */}
      <section className="pt-40 pb-16 px-6 lg:px-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C99A2E]/10 border border-[#C99A2E]/30 mb-6" data-testid="compare-badge">
            <Trophy size={12} className="text-[#C99A2E]" />
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#C99A2E]">Lowest price guarantee · 20% under any competitor</span>
          </div>
          <div className="text-xs uppercase tracking-[0.25em] font-mono text-[#C99A2E] mb-5">Why agents switch</div>
          <h1 className="font-serif text-5xl lg:text-7xl tracking-tighter leading-[0.95] mb-6">
            LensFlow vs <span className="italic text-[#C99A2E]">everyone else.</span>
          </h1>
          <p className="text-lg text-white/55 max-w-2xl mx-auto">Honest, side-by-side comparison with BIGVU, Synthesia, HeyGen and Pictory — pulled from each company's public 2026 pricing pages.</p>
        </div>
      </section>

      {/* ENTRY-TIER PRICING */}
      <section className="pb-12 px-6 lg:px-10" data-testid="compare-entry">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-3xl lg:text-5xl tracking-tighter mb-2 text-center">Entry-tier pricing</h2>
          <p className="text-white/45 text-center mb-10 text-sm">Cheapest paid plan from each platform. Real prices from their public pricing pages, May 2026.</p>
          <div className="space-y-2">
            {entryComparison.map((c) => (
              <motion.div
                {...fadeUp}
                key={c.tool}
                data-testid={`entry-${c.tool.toLowerCase().replace(/\s/g,'-')}`}
                className={`flex items-center justify-between p-5 rounded-2xl border ${c.us ? "bg-[#C99A2E]/10 border-[#C99A2E]" : "bg-white/[0.03] border-white/10"}`}
              >
                <div className="flex items-center gap-3 flex-1">
                  {c.us && <Crown size={18} className="text-[#C99A2E]" />}
                  <span className={`font-serif text-xl ${c.us ? "text-[#C99A2E]" : "text-white"}`}>{c.tool}</span>
                  {c.highlight && <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded bg-[#C99A2E] text-black">{c.highlight}</span>}
                </div>
                <div className="text-right">
                  <div className={`font-serif text-2xl ${c.us ? "text-[#C99A2E]" : "text-white"}`}>{c.price}</div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-white/45">{c.currency}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRO-TIER PRICING */}
      <section className="pb-16 px-6 lg:px-10" data-testid="compare-mid">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-3xl lg:text-5xl tracking-tighter mb-2 text-center">Pro / Creator tier</h2>
          <p className="text-white/45 text-center mb-10 text-sm">The plan most agents actually buy — and where LensFlow wins biggest.</p>
          <div className="space-y-2">
            {midComparison.map((c) => (
              <motion.div
                {...fadeUp}
                key={c.tool}
                data-testid={`mid-${c.tool.toLowerCase().replace(/\s/g,'-')}`}
                className={`flex items-center justify-between p-5 rounded-2xl border ${c.us ? "bg-[#C99A2E]/10 border-[#C99A2E]" : "bg-white/[0.03] border-white/10"}`}
              >
                <div className="flex items-center gap-3 flex-1">
                  {c.us && <Crown size={18} className="text-[#C99A2E]" />}
                  <span className={`font-serif text-xl ${c.us ? "text-[#C99A2E]" : "text-white"}`}>{c.tool}</span>
                  {c.highlight && <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded bg-[#C99A2E] text-black">{c.highlight}</span>}
                </div>
                <div className="text-right">
                  <div className={`font-serif text-2xl ${c.us ? "text-[#C99A2E]" : "text-white"}`}>{c.price}</div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-white/45">{c.currency}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURE MATRIX */}
      <section className="pb-16 px-6 lg:px-10" data-testid="compare-features">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-3xl lg:text-5xl tracking-tighter mb-2 text-center">Feature matrix</h2>
          <p className="text-white/45 text-center mb-3 text-sm">Gold checkmarks = features no one else has.</p>
          <p className="text-[#C99A2E] text-center mb-10 text-xs font-mono uppercase tracking-[0.2em]">Generic AI tools weren't built for real estate. LensFlow was.</p>

          <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/[0.02]">
            <table className="w-full text-sm" data-testid="feature-matrix-table">
              <thead className="bg-white/[0.04] border-b border-white/10">
                <tr>
                  <th className="text-left p-5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">Feature</th>
                  <th className="p-5 font-serif text-[#C99A2E] text-base">LensFlow</th>
                  <th className="p-5 font-serif text-white/65 text-base">BIGVU</th>
                  <th className="p-5 font-serif text-white/65 text-base">Synthesia</th>
                  <th className="p-5 font-serif text-white/65 text-base">HeyGen</th>
                  <th className="p-5 font-serif text-white/65 text-base">Pictory</th>
                </tr>
              </thead>
              <tbody>
                {featureMatrix.map((row, i) => (
                  <tr key={i} className={`border-b border-white/5 ${row.edge ? "bg-[#C99A2E]/[0.04]" : ""}`}>
                    <td className="p-4 text-white/85">
                      {row.feature}
                      {row.edge && <span className="ml-2 text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#C99A2E]/20 text-[#C99A2E] align-middle">Exclusive</span>}
                    </td>
                    <td className="p-4 text-center"><Cell on={row.lensflow} edge={row.edge} /></td>
                    <td className="p-4 text-center"><Cell on={row.bigvu} /></td>
                    <td className="p-4 text-center"><Cell on={row.synthesia} /></td>
                    <td className="p-4 text-center"><Cell on={row.heygen} /></td>
                    <td className="p-4 text-center"><Cell on={row.pictory} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* COST SAVINGS CALLOUT */}
      <section className="pb-16 px-6 lg:px-10" data-testid="compare-savings">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-4">
          {[
            { Icon: Zap,     value: "$66 / yr", label: "Saved vs HeyGen Pro", note: "(annual subscription saving)" },
            { Icon: Trophy,  value: "$348 / yr", label: "Saved vs Synthesia Creator", note: "(LensFlow Pro vs Synthesia Creator)" },
            { Icon: Sparkles,value: "+4 features", label: "No one else has", note: "Glamour · Confidence · REA · AUD" },
          ].map((s, i) => (
            <motion.div {...fadeUp} key={i} data-testid={`saving-${i}`} className="rounded-2xl p-7 bg-white/[0.03] border border-white/10 text-center">
              <s.Icon size={22} className="text-[#C99A2E] mx-auto mb-3" />
              <div className="font-serif text-3xl mb-1 text-[#C99A2E]">{s.value}</div>
              <div className="text-white/85 text-sm font-medium">{s.label}</div>
              <div className="text-white/45 text-[11px] mt-2">{s.note}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* THE GUARANTEE */}
      <section className="py-20 px-6 lg:px-10 bg-gradient-to-b from-[#0F1A2E] to-black border-y border-[#C99A2E]/20" data-testid="compare-guarantee">
        <div className="max-w-3xl mx-auto text-center">
          <Crown className="text-[#C99A2E] mx-auto mb-4" size={32} />
          <h2 className="font-serif text-4xl lg:text-5xl tracking-tighter mb-5">Our 20% guarantee.</h2>
          <p className="text-white/65 text-lg leading-relaxed mb-8">Show us a comparable quote from <em className="text-[#C99A2E]">any</em> AI video tool — BIGVU, Synthesia, HeyGen, Pictory, anyone — and we'll beat it by 20%, <strong className="text-white">locked in for 12 months</strong>.</p>
          <Link to="/register" data-testid="compare-cta" className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#C99A2E] text-black font-medium text-lg hover:bg-[#DBC075] transition-colors">
            Start your 7-day free trial
            <ArrowUpRight size={20} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
