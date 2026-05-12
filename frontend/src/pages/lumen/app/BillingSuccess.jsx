import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import lumenApi, { lumenErr } from "../../../lib/lumenApi";
import { useLumenAuth } from "../../../context/LumenAuthContext";
import { Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

const MAX = 6;

export default function LumenBillingSuccess() {
  const [params] = useSearchParams();
  const sid = params.get("session_id");
  const { refresh } = useLumenAuth();
  const [phase, setPhase] = useState("polling");
  const attempts = useRef(0);

  useEffect(() => {
    if (!sid) { setPhase("error"); return; }
    let cancel = false;
    const tick = async () => {
      if (cancel) return;
      attempts.current += 1;
      try {
        const { data } = await lumenApi.get(`/payments/status/${sid}`);
        if (data.payment_status === "paid") { setPhase("ok"); await refresh(); return; }
        if (data.status === "expired") { setPhase("expired"); return; }
        if (attempts.current >= MAX) { setPhase("pending"); return; }
        setTimeout(tick, 2500);
      } catch { if (!cancel) setPhase("error"); }
    };
    tick();
    return () => { cancel = true; };
  }, [sid, refresh]);

  return (
    <div className="px-5 py-16 max-w-md mx-auto" data-testid="lumen-billing-success">
      <div className="lumen-card p-10 text-center">
        {phase === "polling" && (<><Loader2 className="mx-auto text-[#FF6B6B] animate-spin mb-5" size={36} /><h1 className="lumen-display text-3xl mb-2">Confirming payment…</h1><p className="text-[#5C5C7A] text-sm">Attempt {attempts.current}/{MAX}</p></>)}
        {phase === "ok" && (<><CheckCircle2 className="mx-auto text-[#FF6B6B] mb-5" size={48} /><h1 className="lumen-display text-4xl mb-3">You're all set 💛</h1><p className="text-[#5C5C7A] mb-6">Minutes are added. Go make someone smile.</p><Link to="/lumen/app/create" data-testid="success-cta" className="lumen-btn-primary inline-flex items-center gap-2">Make a moment <ArrowRight size={16}/></Link></>)}
        {phase === "pending" && (<><Loader2 className="mx-auto text-[#9999B0] mb-5" size={36} /><h1 className="lumen-display text-3xl mb-3">Still processing</h1><p className="text-[#5C5C7A] mb-5">Your bank is just taking a sec. We'll email you when it's done.</p><Link to="/lumen/app/home" className="lumen-btn-ghost inline-block">Back home</Link></>)}
        {phase === "expired" && (<><XCircle className="mx-auto text-red-400 mb-5" size={48} /><h1 className="lumen-display text-3xl mb-3">Session expired</h1><p className="text-[#5C5C7A] mb-5">No charge was made.</p><Link to="/lumen/app/billing" className="lumen-btn-primary inline-block">Try again</Link></>)}
        {phase === "error" && (<><XCircle className="mx-auto text-red-400 mb-5" size={48} /><h1 className="lumen-display text-3xl mb-3">Couldn't verify</h1><Link to="/lumen/app/billing" className="lumen-btn-ghost inline-block">Back to billing</Link></>)}
      </div>
    </div>
  );
}
