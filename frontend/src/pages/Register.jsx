import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { ArrowUpRight, Loader2, Check } from "lucide-react";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setErr("");
    const res = await register(form.email, form.password, form.name);
    setLoading(false);
    if (res.ok) {
      toast.success("Welcome to LensFlow");
      nav("/onboarding");
    } else setErr(res.error || "Registration failed");
  };

  return (
    <div className="min-h-screen flex bg-[#050505]" data-testid="register-page">
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <img src="/assets/property/sunset-pool.jpg" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/90 via-black/40 to-transparent" />
        <Link to="/" className="absolute top-10 left-10 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#C99A2E] flex items-center justify-center">
            <span className="font-serif text-black text-xl leading-none pt-0.5">L</span>
          </div>
          <span className="font-serif text-2xl">LensFlow</span>
        </Link>
        <div className="absolute bottom-12 left-12 right-12 space-y-3">
          <h2 className="font-serif text-4xl leading-snug">Your studio, before your coffee.</h2>
          {["Unlimited drafts","AI script writer · GPT-5.2","Mia, Oliver, Aria, Marcus presenters","REA · Domain · Rightmove ready"].map((b,i) => (
            <div key={i} className="flex items-center gap-2 text-white/75 text-sm">
              <Check size={16} className="text-[#C99A2E]" /> {b}
            </div>
          ))}
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
          <h1 className="font-serif text-5xl tracking-tighter mb-3">Create your studio.</h1>
          <p className="text-white/55 mb-10">From $23.90/mo · Cancel anytime · 20% under any competitor.</p>

          <form onSubmit={submit} className="space-y-5" data-testid="register-form">
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] font-mono text-white/50 mb-2">Full name</label>
              <input data-testid="register-name" required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#C99A2E] focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] font-mono text-white/50 mb-2">Email</label>
              <input data-testid="register-email" type="email" required value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#C99A2E] focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] font-mono text-white/50 mb-2">Password</label>
              <input data-testid="register-password" type="password" minLength={6} required value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#C99A2E] focus:outline-none" />
              <p className="mt-2 text-xs text-white/40">Minimum 6 characters.</p>
            </div>
            {err && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3" data-testid="register-error">{err}</div>}
            <button data-testid="register-submit" disabled={loading} className="w-full px-6 py-4 rounded-full bg-[#C99A2E] text-black font-medium hover:bg-[#DBC075] disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Create studio <ArrowUpRight size={18} /></>}
            </button>
          </form>

          <p className="mt-8 text-sm text-white/55">
            Already a member?{" "}
            <Link to="/login" className="text-[#C99A2E] hover:underline" data-testid="register-login-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
