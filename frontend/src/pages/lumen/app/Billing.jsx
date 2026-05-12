import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import lumenApi, { lumenErr } from "../../../lib/lumenApi";
import { useLumenAuth } from "../../../context/LumenAuthContext";
import { toast } from "sonner";
import { Loader2, Sparkles, Clock, Crown } from "lucide-react";

const packs = [
  { id: "lumen_1h", title: "1 hour", price: "$9.90", minutes: 60, color: "#FFD166", emoji: "⚡" },
  { id: "lumen_2h", title: "2 hours", price: "$17.90", minutes: 120, color: "#FF6B6B", emoji: "💞", highlight: true },
  { id: "lumen_3h", title: "3 hours", price: "$24.95", minutes: 180, color: "#B8F2D8", emoji: "🌈" },
];

export default function LumenBilling() {
  const { user, refresh } = useLumenAuth();
  const [loading, setLoading] = useState(null);

  const buy = async (id) => {
    setLoading(id);
    try {
      const { data } = await lumenApi.post("/payments/checkout", { package_id: id, origin_url: window.location.origin });
      window.location.href = data.url;
    } catch (e) {
      toast.error(lumenErr(e.response?.data?.detail) || "Checkout failed");
    } finally { setLoading(null); }
  };

  return (
    <div className="px-5 lg:px-10 py-10 max-w-5xl" data-testid="lumen-billing">
      <div className="mb-8">
        <div className="lumen-hand text-3xl text-[#FF6B6B]">top up</div>
        <h1 className="lumen-display text-4xl">Minutes</h1>
      </div>

      <div className="lumen-card p-7 mb-8">
        <div className="grid sm:grid-cols-3 gap-5">
          <div data-testid="bal-trial">
            <div className="text-xs uppercase tracking-widest font-bold text-[#9999B0] mb-1">Trial</div>
            <div className="lumen-display text-3xl">{user?.in_trial ? "Active" : "Ended"}</div>
            {user?.in_trial && <div className="text-xs text-[#5C5C7A] mt-1">Until {new Date(user.trial_until).toLocaleDateString()}</div>}
          </div>
          <div data-testid="bal-credit">
            <div className="text-xs uppercase tracking-widest font-bold text-[#9999B0] mb-1">Top-up minutes</div>
            <div className="lumen-display text-3xl">{user?.minutes_credit || 0}</div>
            <div className="text-xs text-[#5C5C7A] mt-1">Never expire</div>
          </div>
          <div data-testid="bal-free">
            <div className="text-xs uppercase tracking-widest font-bold text-[#9999B0] mb-1">Free this month</div>
            <div className="lumen-display text-3xl">{Math.max(0, 10 - (user?.minutes_used_period || 0))} <span className="text-base text-[#9999B0]">/ 10</span></div>
            <div className="text-xs text-[#5C5C7A] mt-1">Resets monthly</div>
          </div>
        </div>
      </div>

      <h2 className="lumen-display text-2xl mb-4">Top up minutes</h2>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {packs.map(p => (
          <div key={p.id} data-testid={`pack-${p.id}`} className={`lumen-card p-6 ${p.highlight ? "ring-4 ring-[#FF6B6B] scale-[1.03]" : ""}`}>
            {p.highlight && <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#FF6B6B]">Best value</div>}
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-3" style={{ background: p.color }}>{p.emoji}</div>
            <h3 className="lumen-display text-2xl">{p.title}</h3>
            <p className="text-xs text-[#9999B0] mb-3">{p.minutes} minutes · never expires</p>
            <div className="lumen-display text-4xl mb-4">{p.price}</div>
            <button onClick={() => buy(p.id)} disabled={loading === p.id} data-testid={`buy-${p.id}`} className={`w-full ${p.highlight ? "lumen-btn-primary" : "lumen-btn-ghost"} text-sm`}>
              {loading === p.id ? <Loader2 size={14} className="animate-spin inline" /> : "Top up"}
            </button>
          </div>
        ))}
      </div>

      <div className="lumen-card p-6 flex items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest font-bold text-[#FF6B6B] mb-1">$5 / month</div>
          <h3 className="lumen-display text-2xl flex items-center gap-2"><Crown size={20} className="text-[#FFD166]" /> Remove watermark</h3>
          <p className="text-sm text-[#5C5C7A] mt-1">Send clean, unbranded videos. Cancel anytime.</p>
        </div>
        <button onClick={() => buy("lumen_nowm")} disabled={loading === "lumen_nowm" || user?.watermark_subscription} data-testid="buy-nowm" className="lumen-btn-primary text-sm shrink-0">
          {user?.watermark_subscription ? "Active" : loading === "lumen_nowm" ? <Loader2 size={14} className="animate-spin" /> : "Subscribe"}
        </button>
      </div>
    </div>
  );
}
