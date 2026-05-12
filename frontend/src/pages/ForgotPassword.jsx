import React, { useState } from "react";
import { Link } from "react-router-dom";
import api, { formatApiErrorDetail } from "../lib/api";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setDone(true);
      toast.success("If the email exists, a reset link was sent.");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Error");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-6" data-testid="forgot-page">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2.5 justify-center mb-10">
          <div className="w-9 h-9 rounded-full bg-[#C99A2E] flex items-center justify-center">
            <span className="font-serif text-black text-xl leading-none pt-0.5">L</span>
          </div>
          <span className="font-serif text-2xl">LensFlow</span>
        </Link>
        <div className="glass rounded-3xl p-10">
          <h1 className="font-serif text-4xl tracking-tight mb-3">Forgot your password?</h1>
          <p className="text-white/55 mb-8">We'll send a reset link to your inbox.</p>
          {done ? (
            <div className="text-white/70" data-testid="forgot-success">Check your email for the link. (Dev: also logged to backend console.)</div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <input data-testid="forgot-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@agency.com" className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#C99A2E] focus:outline-none" />
              <button data-testid="forgot-submit" disabled={loading} className="w-full px-6 py-4 rounded-full bg-[#C99A2E] text-black font-medium hover:bg-[#DBC075] disabled:opacity-60">
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
          )}
          <Link to="/login" className="block mt-6 text-sm text-white/50 hover:text-white">← Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}
