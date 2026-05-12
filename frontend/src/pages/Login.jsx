import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { ArrowUpRight, Loader2 } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setErr("");
    const res = await login(email, password);
    setLoading(false);
    if (res.ok) {
      toast.success("Welcome back");
      nav("/app/dashboard");
    } else {
      setErr(res.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex bg-[#050505]" data-testid="login-page">
      <div className="hidden lg:block w-1/2 relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1757524492552-d47a66a2b63e?crop=entropy&cs=srgb&fm=jpg&w=1400&q=85" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/90 via-black/40 to-transparent" />
        <Link to="/" className="absolute top-10 left-10 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#C99A2E] flex items-center justify-center">
            <span className="font-serif text-black text-xl leading-none pt-0.5">L</span>
          </div>
          <span className="font-serif text-2xl">LensFlow</span>
        </Link>
        <div className="absolute bottom-12 left-12 right-12">
          <p className="font-serif text-3xl lg:text-4xl leading-snug">"The hook was so cinematic I had two offers before open inspection."</p>
          <p className="mt-4 text-white/50 text-sm font-mono uppercase tracking-widest">Jasmine Reid · Sotheby's Mosman</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-full bg-[#C99A2E] flex items-center justify-center">
              <span className="font-serif text-black text-xl leading-none pt-0.5">L</span>
            </div>
            <span className="font-serif text-2xl">LensFlow</span>
          </Link>

          <h1 className="font-serif text-5xl tracking-tighter mb-3">Welcome back.</h1>
          <p className="text-white/55 mb-10">Open the studio. Pick up where you left off.</p>

          <form onSubmit={submit} className="space-y-5" data-testid="login-form">
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] font-mono text-white/50 mb-2">Email</label>
              <input data-testid="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#C99A2E] focus:outline-none transition-colors" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs uppercase tracking-[0.2em] font-mono text-white/50">Password</label>
                <Link to="/forgot-password" className="text-xs text-[#C99A2E] hover:underline" data-testid="login-forgot">Forgot?</Link>
              </div>
              <input data-testid="login-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#C99A2E] focus:outline-none transition-colors" />
            </div>
            {err && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3" data-testid="login-error">{err}</div>}
            <button data-testid="login-submit" disabled={loading} className="w-full px-6 py-4 rounded-full bg-[#C99A2E] text-black font-medium hover:bg-[#DBC075] disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Sign In <ArrowUpRight size={18} /></>}
            </button>
          </form>

          <p className="mt-8 text-sm text-white/55">
            No account yet?{" "}
            <Link to="/register" className="text-[#C99A2E] hover:underline" data-testid="login-register-link">Create one — it's free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
