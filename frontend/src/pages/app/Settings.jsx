import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { Crown, Mail, ArrowUpRight } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  return (
    <div className="px-6 lg:px-12 py-10 max-w-4xl" data-testid="settings-page">
      <div className="mb-10">
        <div className="text-xs uppercase tracking-[0.25em] font-mono text-[#C99A2E] mb-2">Settings</div>
        <h1 className="font-serif text-5xl tracking-tighter">Account</h1>
      </div>

      <div className="space-y-4">
        <div className="glass rounded-2xl p-7">
          <h2 className="font-serif text-2xl mb-5">Profile</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="text-xs font-mono uppercase tracking-wider text-white/40 mb-1">Name</dt>
              <dd data-testid="settings-name">{user?.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-mono uppercase tracking-wider text-white/40 mb-1">Email</dt>
              <dd data-testid="settings-email">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-mono uppercase tracking-wider text-white/40 mb-1">Role</dt>
              <dd data-testid="settings-role" className="capitalize">{user?.role}</dd>
            </div>
          </dl>
        </div>

        <div className="glass rounded-2xl p-7 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-white/40 mb-2"><Crown size={14} className="text-[#C99A2E]" /> Plan</div>
            <div className="font-serif text-3xl capitalize" data-testid="settings-plan">{user?.plan || "free"}</div>
          </div>
          <Link to="/pricing" data-testid="settings-upgrade" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#C99A2E] text-black font-medium hover:bg-[#DBC075]">
            Upgrade <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="glass rounded-2xl p-7">
          <h2 className="font-serif text-2xl mb-2">Need a hand?</h2>
          <p className="text-white/55 text-sm mb-5">Reach concierge or support directly.</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/concierge" data-testid="settings-concierge" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-strong hover:bg-white/10 text-sm">
              <Mail size={14} /> Concierge
            </Link>
            <a href="mailto:support@lensflow.ai" data-testid="settings-support" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-strong hover:bg-white/10 text-sm">
              <Mail size={14} /> support@lensflow.ai
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
