import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LumenNav from "./_Nav";
import { useLumenAuth } from "../../context/LumenAuthContext";
import lumenApi, { lumenErr } from "../../lib/lumenApi";
import { toast } from "sonner";
import { Check, Sparkles, Loader2, Clock } from "lucide-react";

const tiers = [
  { id: "trial",        title: "Free Trial",   price: "$0",     unit: "7 days · then 10 min/mo free", desc: "Try everything. No card.", color: "#D5C6F8", emoji: "✨", package_id: null,        perks: ["7 days fully unlocked","10 min/month after trial","AI scripts + 4 voices","All looks, music, backgrounds"] },
  { id: "lumen_1h",     title: "1 hour",       price: "$9.90",  unit: "one-time top-up",              desc: "About 60 quick moments.",  color: "#FFD166", emoji: "⚡", package_id: "lumen_1h",   perks: ["60 minutes of recording","Never expires","All features"] },
  { id: "lumen_2h",     title: "2 hours",      price: "$17.90", unit: "one-time · save 10%",          desc: "Most people pick this.",   color: "#FF6B6B", emoji: "💞", package_id: "lumen_2h",   perks: ["120 minutes of recording","Never expires","All features","Best value for regulars"], highlight: true },
  { id: "lumen_3h",     title: "3 hours",      price: "$24.95", unit: "one-time · save 16%",          desc: "Family chat marathon.",    color: "#B8F2D8", emoji: "🌈", package_id: "lumen_3h",   perks: ["180 minutes of recording","Never expires","All features"] },
  { id: "lumen_nowm",   title: "No Watermark", price: "$5",     unit: "per month",                    desc: "Send clean videos.",       color: "#FFD166", emoji: "🪄", package_id: "lumen_nowm", perks: ["Remove 'Made with Lumen' badge","Cancel anytime"], subscription: true },
];

export default function LumenPricing() {
  const { user } = useLumenAuth();
  const nav = useNavigate();
  const [loadingId, setLoadingId] = useState(null);

  const buy = async (t) => {
    if (!t.package_id) { nav("/lumen/register"); return; }
    if (!user) { nav("/lumen/register"); return; }
    setLoadingId(t.id);
    try {
      const { data } = await lumenApi.post("/payments/checkout", { package_id: t.package_id, origin_url: window.location.origin });
      window.location.href = data.url;
    } catch (err) {
      toast.error(lumenErr(err.response?.data?.detail) || "Checkout failed");
    } finally { setLoadingId(null); }
  };

  return (
    <div className="lumen-root" data-testid="lumen-pricing">
      <LumenNav />
      <section className="max-w-6xl mx-auto px-5 lg:px-8 pt-16 pb-12 text-center">
        <div className="lumen-hand text-3xl text-[#FF6B6B] mb-2">simple & friendly</div>
        <h1 className="lumen-display text-5xl lg:text-6xl mb-4">Pay only when you fall in love.</h1>
        <p className="text-lg text-[#5C5C7A] max-w-2xl mx-auto">Free for a week. Free 10 minutes every month after. Top up only if you need more.</p>
      </section>

      <section className="max-w-6xl mx-auto px-5 lg:px-8 pb-20 grid md:grid-cols-2 lg:grid-cols-5 gap-4">
        {tiers.map((t) => (
          <div key={t.id} data-testid={`tier-${t.id}`} className={`lumen-card p-6 relative flex flex-col ${t.highlight ? "ring-4 ring-[#FF6B6B] scale-[1.03]" : ""}`}>
            {t.highlight && <div className="absolute -top-3 left-6 bg-[#FF6B6B] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Best value</div>}
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4" style={{ background: t.color }}>{t.emoji}</div>
            <h3 className="lumen-display text-2xl mb-1">{t.title}</h3>
            <p className="text-xs text-[#9999B0] mb-3">{t.desc}</p>
            <div className="mb-1">
              <span className="lumen-display text-4xl">{t.price}</span>
            </div>
            <p className="text-xs text-[#9999B0] mb-5">{t.unit}</p>
            <button onClick={() => buy(t)} disabled={loadingId === t.id} data-testid={`tier-cta-${t.id}`} className={`${t.highlight ? "lumen-btn-primary" : "lumen-btn-ghost"} w-full mb-5 flex items-center justify-center gap-2 text-sm`}>
              {loadingId === t.id ? <Loader2 size={14} className="animate-spin" /> : t.package_id ? (t.subscription ? "Subscribe" : "Top up") : "Start free"}
            </button>
            <ul className="space-y-2 text-sm text-[#5C5C7A]">
              {t.perks.map(p => (
                <li key={p} className="flex items-start gap-2"><Check size={15} className="text-[#FF6B6B] shrink-0 mt-0.5" />{p}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="max-w-3xl mx-auto px-5 lg:px-8 pb-24 text-center">
        <div className="lumen-card p-8">
          <Clock className="mx-auto text-[#FF6B6B] mb-3" size={28} />
          <h3 className="lumen-display text-2xl mb-2">Minutes never expire</h3>
          <p className="text-[#5C5C7A]">Top up once, use them whenever. Good for tonight's apology or next year's anniversary.</p>
        </div>
      </section>
    </div>
  );
}
