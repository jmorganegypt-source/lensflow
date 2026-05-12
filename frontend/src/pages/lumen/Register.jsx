import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLumenAuth } from "../../context/LumenAuthContext";
import { toast } from "sonner";
import { ArrowRight, Loader2, Check } from "lucide-react";
import LumenNav from "./_Nav";

export default function LumenRegister() {
  const { register } = useLumenAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setErr("");
    const r = await register(form.email, form.password, form.name);
    setLoading(false);
    if (r.ok) { toast.success("You're in. 7-day free trial started 🎉"); nav("/lumen/app/home"); }
    else setErr(r.error || "Registration failed");
  };

  return (
    <div className="lumen-root min-h-screen" data-testid="lumen-register">
      <LumenNav />
      <div className="max-w-md mx-auto px-5 py-12">
        <div className="lumen-card p-10">
          <div className="lumen-hand text-3xl text-[#FF6B6B] mb-1">say hello</div>
          <h1 className="lumen-display text-4xl mb-2">Start free.</h1>
          <p className="text-[#5C5C7A] mb-6">7 days, all features unlocked. No card now.</p>

          <ul className="space-y-2 mb-6 text-sm">
            {["Unlimited moments for 7 days","All looks, music & backgrounds","AI scripts + AI voice","Cancel anytime"].map(b => (
              <li key={b} className="flex items-center gap-2 text-[#5C5C7A]"><Check size={16} className="text-[#FF6B6B]"/>{b}</li>
            ))}
          </ul>

          <form onSubmit={submit} className="space-y-4" data-testid="lumen-register-form">
            <input data-testid="lumen-register-name" required placeholder="Your name" className="lumen-input" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
            <input data-testid="lumen-register-email" required type="email" placeholder="you@email.com" className="lumen-input" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
            <input data-testid="lumen-register-password" required type="password" minLength={6} placeholder="Password (6+ chars)" className="lumen-input" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} />
            {err && <div className="text-sm bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3" data-testid="lumen-register-error">{err}</div>}
            <button data-testid="lumen-register-submit" disabled={loading} className="lumen-btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <>Start free week <ArrowRight size={16} /></>}
            </button>
          </form>
          <p className="mt-6 text-sm text-[#5C5C7A] text-center">
            Already a member? <Link to="/lumen/login" className="text-[#FF6B6B] font-semibold" data-testid="lumen-register-login-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
