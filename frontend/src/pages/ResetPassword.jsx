import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import api, { formatApiErrorDetail } from "../lib/api";
import { toast } from "sonner";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, new_password: password });
      toast.success("Password reset — please sign in");
      nav("/login");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Error");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-6" data-testid="reset-page">
      <div className="w-full max-w-md glass rounded-3xl p-10">
        <h1 className="font-serif text-4xl mb-3">Set a new password.</h1>
        <p className="text-white/55 mb-8 text-sm">Pick something memorable — 6 characters minimum.</p>
        <form onSubmit={submit} className="space-y-5">
          <input data-testid="reset-password-input" type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#C99A2E] focus:outline-none" />
          <button data-testid="reset-submit" disabled={loading || !token} className="w-full px-6 py-4 rounded-full bg-[#C99A2E] text-black font-medium hover:bg-[#DBC075] disabled:opacity-60">
            {loading ? "Saving..." : "Reset password"}
          </button>
        </form>
        <Link to="/login" className="block mt-6 text-sm text-white/50">← Back to sign in</Link>
      </div>
    </div>
  );
}
