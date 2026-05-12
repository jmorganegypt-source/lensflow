import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X } from "lucide-react";

const links = [
  { to: "/presenters", label: "Presenters" },
  { to: "/pricing", label: "Pricing" },
  { to: "/concierge", label: "Concierge" },
];

export default function MarketingNav() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  return (
    <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-black/50 border-b border-white/5" data-testid="marketing-nav">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5" data-testid="nav-logo">
          <div className="w-9 h-9 rounded-full bg-[#C99A2E] flex items-center justify-center">
            <span className="font-serif text-black text-xl leading-none pt-0.5">L</span>
          </div>
          <span className="font-serif text-2xl tracking-tight">LensFlow</span>
        </Link>

        <div className="hidden md:flex items-center gap-9">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              data-testid={`nav-${l.label.toLowerCase()}`}
              className={`text-sm tracking-wide transition-colors ${loc.pathname === l.to ? "text-[#C99A2E]" : "text-white/70 hover:text-white"}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Link to="/app/dashboard" className="px-6 py-2.5 rounded-full bg-[#C99A2E] text-black font-medium text-sm hover:bg-[#DBC075] transition-colors" data-testid="nav-dashboard-btn">
              Open Studio →
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm text-white/70 hover:text-white" data-testid="nav-login">Sign In</Link>
              <Link to="/register" className="px-6 py-2.5 rounded-full bg-[#C99A2E] text-black font-medium text-sm hover:bg-[#DBC075] transition-colors" data-testid="nav-cta">
                Start Free
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden text-white" onClick={() => setOpen(!open)} data-testid="nav-mobile-toggle">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/5 bg-black/95 backdrop-blur-xl">
          <div className="px-6 py-6 flex flex-col gap-5">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-white/80 text-base" data-testid={`nav-mobile-${l.label.toLowerCase()}`}>{l.label}</Link>
            ))}
            {user ? (
              <Link to="/app/dashboard" className="px-6 py-3 rounded-full bg-[#C99A2E] text-black font-medium text-center">Open Studio</Link>
            ) : (
              <>
                <Link to="/login" className="text-white/80">Sign In</Link>
                <Link to="/register" className="px-6 py-3 rounded-full bg-[#C99A2E] text-black font-medium text-center">Start Free</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
