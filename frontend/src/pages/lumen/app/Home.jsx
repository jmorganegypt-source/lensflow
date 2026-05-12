import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import lumenApi from "../../../lib/lumenApi";
import { useLumenAuth } from "../../../context/LumenAuthContext";
import { PlusCircle, Sparkles, Send, Heart, Clock } from "lucide-react";

export default function LumenHome() {
  const { user } = useLumenAuth();
  const [moments, setMoments] = useState([]);

  useEffect(() => {
    lumenApi.get("/moments").then(r => setMoments(r.data.moments || []));
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  };

  return (
    <div className="px-5 lg:px-10 py-10 max-w-5xl" data-testid="lumen-home">
      <div className="mb-8">
        <div className="lumen-hand text-3xl text-[#FF6B6B]">{greeting()},</div>
        <h1 className="lumen-display text-4xl lg:text-5xl">{user?.name?.split(" ")[0] || "friend"} 💛</h1>
        <p className="text-[#5C5C7A] mt-1">Got someone on your mind? Let's send them a Lumen.</p>
      </div>

      <Link to="/lumen/app/create" data-testid="home-new-cta" className="lumen-card p-8 flex items-center gap-5 mb-8 hover:-translate-y-0.5 transition-transform">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B6B] to-[#FFD166] flex items-center justify-center shrink-0">
          <PlusCircle size={28} className="text-white" />
        </div>
        <div className="flex-1">
          <div className="lumen-display text-2xl">Make a new moment</div>
          <p className="text-[#5C5C7A] text-sm">Pick an occasion, AI does the rest. Takes 90 seconds.</p>
        </div>
      </Link>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {[
          { Icon: Sparkles, label: "AI scripts", val: "GPT-5.2 · poetic", color: "#FFD166" },
          { Icon: Heart, label: "Looks & music", val: "8 looks · 8 tunes", color: "#FF6B6B" },
          { Icon: Send, label: "Sent via link", val: "Shareable instantly", color: "#D5C6F8" },
        ].map((s,i) => (
          <div key={i} className="lumen-card p-5" data-testid={`home-feature-${i}`}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: s.color }}>
              <s.Icon size={18} />
            </div>
            <div className="text-xs uppercase tracking-widest text-[#9999B0] mb-1">{s.label}</div>
            <div className="font-semibold">{s.val}</div>
          </div>
        ))}
      </div>

      <div className="lumen-card p-7">
        <div className="flex items-center justify-between mb-5">
          <h2 className="lumen-display text-2xl">Recent moments</h2>
          <Link to="/lumen/app/library" className="text-sm text-[#FF6B6B] font-semibold" data-testid="home-view-all">View all →</Link>
        </div>
        {moments.length === 0 ? (
          <div className="py-12 text-center">
            <Clock className="mx-auto text-[#FFD166] mb-3" size={28} />
            <p className="lumen-display text-xl text-[#9999B0] mb-3">No moments yet</p>
            <Link to="/lumen/app/create" className="lumen-btn-primary inline-block text-sm">Make your first →</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {moments.slice(0, 5).map(m => (
              <div key={m.id} data-testid={`home-moment-${m.id}`} className="flex items-center justify-between py-3 border-b border-black/[0.04] last:border-0">
                <div>
                  <div className="font-semibold">{m.recipient_name}</div>
                  <div className="text-xs text-[#9999B0]">{m.occasion?.replace("_"," ")} · {m.sent ? `Sent to ${m.sent_to_email}` : "Draft"}</div>
                </div>
                <span className="text-xs text-[#9999B0]">{new Date(m.updated_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
