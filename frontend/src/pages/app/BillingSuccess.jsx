import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import api, { formatApiErrorDetail } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Loader2, CheckCircle2, XCircle, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

const MAX_ATTEMPTS = 8;
const POLL_INTERVAL = 2500;

export default function BillingSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const navigate = useNavigate();
  const { fetchMe } = useAuth();
  const [state, setState] = useState({ phase: "polling", attempts: 0, info: null, error: "" });
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (!sessionId) {
      setState({ phase: "error", error: "No session id provided" });
      return;
    }

    let cancelled = false;
    const poll = async () => {
      if (cancelled) return;
      attemptsRef.current += 1;
      try {
        const { data } = await api.get(`/payments/status/${sessionId}`);
        if (cancelled) return;
        if (data.payment_status === "paid") {
          setState({ phase: "success", info: data });
          await fetchMe();
          return;
        }
        if (data.status === "expired") {
          setState({ phase: "expired" });
          return;
        }
        if (attemptsRef.current >= MAX_ATTEMPTS) {
          setState({ phase: "pending", info: data });
          return;
        }
        setState({ phase: "polling", attempts: attemptsRef.current, info: data });
        setTimeout(poll, POLL_INTERVAL);
      } catch (err) {
        if (cancelled) return;
        setState({ phase: "error", error: formatApiErrorDetail(err.response?.data?.detail) || err.message });
      }
    };

    poll();
    return () => { cancelled = true; };
  }, [sessionId, fetchMe]);

  return (
    <div className="px-6 lg:px-12 py-20 max-w-2xl mx-auto" data-testid="billing-success-page">
      <div className="glass rounded-3xl p-12 text-center">
        {state.phase === "polling" && (
          <>
            <Loader2 className="mx-auto mb-6 text-[#C99A2E] animate-spin" size={40} />
            <h1 className="font-serif text-4xl tracking-tight mb-2">Confirming your payment…</h1>
            <p className="text-white/55 text-sm font-mono uppercase tracking-widest">Attempt {state.attempts || 1} / {MAX_ATTEMPTS}</p>
          </>
        )}
        {state.phase === "success" && (
          <>
            <CheckCircle2 className="mx-auto mb-6 text-[#C99A2E]" size={48} />
            <h1 className="font-serif text-5xl tracking-tighter mb-3">You're upgraded.</h1>
            <p className="text-white/65 mb-8">Your plan is active. The full studio is now unlocked — all four presenters, unlimited scripts, broadcast exports.</p>
            <Link to="/app/dashboard" data-testid="billing-success-cta" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#C99A2E] text-black font-medium hover:bg-[#DBC075]">
              Open studio <ArrowUpRight size={16} />
            </Link>
          </>
        )}
        {state.phase === "pending" && (
          <>
            <Loader2 className="mx-auto mb-6 text-white/50" size={40} />
            <h1 className="font-serif text-4xl tracking-tight mb-3">Still processing</h1>
            <p className="text-white/55 mb-6">Your bank is taking a moment. We'll email a confirmation as soon as it clears.</p>
            <Link to="/app/dashboard" className="inline-block px-6 py-3 rounded-full glass-strong hover:bg-white/10">Back to dashboard</Link>
          </>
        )}
        {state.phase === "expired" && (
          <>
            <XCircle className="mx-auto mb-6 text-red-400" size={48} />
            <h1 className="font-serif text-4xl tracking-tight mb-3">Session expired</h1>
            <p className="text-white/55 mb-6">No charge was made. Want to try again?</p>
            <Link to="/pricing" className="inline-block px-6 py-3 rounded-full bg-[#C99A2E] text-black font-medium hover:bg-[#DBC075]">Back to pricing</Link>
          </>
        )}
        {state.phase === "error" && (
          <>
            <XCircle className="mx-auto mb-6 text-red-400" size={48} />
            <h1 className="font-serif text-4xl tracking-tight mb-3">Couldn't verify payment</h1>
            <p className="text-white/55 mb-2">{state.error}</p>
            <p className="text-white/35 text-xs font-mono mb-6">Session: {sessionId}</p>
            <Link to="/pricing" className="inline-block px-6 py-3 rounded-full glass-strong hover:bg-white/10">Back to pricing</Link>
          </>
        )}
      </div>
    </div>
  );
}
