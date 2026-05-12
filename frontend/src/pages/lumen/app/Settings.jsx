import React from "react";
import { Link } from "react-router-dom";
import { useLumenAuth } from "../../../context/LumenAuthContext";
import { Mail, ArrowRight } from "lucide-react";

export default function LumenSettings() {
  const { user } = useLumenAuth();
  return (
    <div className="px-5 lg:px-10 py-10 max-w-3xl" data-testid="lumen-settings">
      <div className="mb-8">
        <div className="lumen-hand text-3xl text-[#FF6B6B]">your account</div>
        <h1 className="lumen-display text-4xl">Settings</h1>
      </div>
      <div className="space-y-4">
        <div className="lumen-card p-6">
          <h2 className="lumen-display text-2xl mb-4">Profile</h2>
          <dl className="grid sm:grid-cols-2 gap-4 text-sm">
            <div><dt className="text-xs uppercase tracking-widest font-bold text-[#9999B0]">Name</dt><dd className="mt-0.5" data-testid="settings-name">{user?.name}</dd></div>
            <div><dt className="text-xs uppercase tracking-widest font-bold text-[#9999B0]">Email</dt><dd className="mt-0.5" data-testid="settings-email">{user?.email}</dd></div>
            <div><dt className="text-xs uppercase tracking-widest font-bold text-[#9999B0]">Watermark</dt><dd className="mt-0.5" data-testid="settings-watermark">{user?.watermark_subscription ? "Removed (Pro)" : "Showing"}</dd></div>
            <div><dt className="text-xs uppercase tracking-widest font-bold text-[#9999B0]">Trial</dt><dd className="mt-0.5" data-testid="settings-trial">{user?.in_trial ? "Active" : "Ended"}</dd></div>
          </dl>
        </div>
        <div className="lumen-card p-6 flex items-center justify-between">
          <div>
            <h2 className="lumen-display text-2xl">Need help?</h2>
            <p className="text-sm text-[#5C5C7A]">Reach us anytime.</p>
          </div>
          <a href="mailto:hello@lumen.app" data-testid="settings-support" className="lumen-btn-ghost text-sm inline-flex items-center gap-2"><Mail size={14}/> hello@lumen.app</a>
        </div>
        <div className="lumen-card p-6 flex items-center justify-between">
          <div>
            <h2 className="lumen-display text-2xl">Out of minutes?</h2>
            <p className="text-sm text-[#5C5C7A]">Top up — never expires.</p>
          </div>
          <Link to="/lumen/app/billing" data-testid="settings-billing" className="lumen-btn-primary text-sm inline-flex items-center gap-2">Top up <ArrowRight size={14}/></Link>
        </div>
      </div>
    </div>
  );
}
