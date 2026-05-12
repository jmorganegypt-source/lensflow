import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLumenAuth } from "../../context/LumenAuthContext";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";
import LumenNav from "./_Nav";

export default function LumenLogin() {
  const { login } = useLumenAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setErr("");
    const r = await login(email, password);
    setLoading(false);
    if (r.ok) { toast.success("Welcome back!"); nav("/lumen/app/home"); }
    else setErr(r.error || "Login failed");
  };

  return (
    <div className="lumen-root min-h-screen" data-testid="lumen-login">
      <LumenNav />
      <div className="max-w-md mx-auto px-5 py-16">
        <div className="lumen-card p-10">
          <div className="lumen-hand text-3xl text-[#FF6B6B] mb-1">welcome back</div>
          <h1 className="lumen-display text-4xl mb-2">Sign in.</h1>
          <p className="text-[#5C5C7A] mb-7">Pick up where you left off.</p>
          <form onSubmit={submit} className="space-y-4" data-testid="lumen-login-form">
            <input data-testid="lumen-login-email" required type="email" placeholder="you@email.com" className="lumen-input" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input data-testid="lumen-login-password" required type="password" placeholder="Password" className="lumen-input" value={password} onChange={(e) => setPassword(e.target.value)} />
            {err && <div className="text-sm bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3" data-testid="lumen-login-error">{err}</div>}
            <button data-testid="lumen-login-submit" disabled={loading} className="lumen-btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Sign in <ArrowRight size={16} /></>}
            </button>
          </form>
          <p className="mt-6 text-sm text-[#5C5C7A] text-center">
            New here?{" "}
            <Link to="/lumen/register" className="text-[#FF6B6B] font-semibold" data-testid="lumen-login-register-link">Start your free week →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
