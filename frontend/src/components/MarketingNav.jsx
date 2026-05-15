import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X } from "lucide-react";

const links = [
  { to: "/presenters", label: "Presenters" },
  { to: "/pricing", label: "Pricing" },
  { to: "/compare", label: "Compare" },
  { to: "/concierge", label: "Concierge" },
];

export default function MarketingNav() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  // Light variant on the landing page only; dark elsewhere
  const isLight = loc.pathname === "/";

  const baseBg = isLight
    ? "bg-[#FAF7F2]/85 border-[#0F1A2E]/8"
    : "bg-black/50 border-white/5";
  const brandColor = isLight ? "text-[#0F1A2E]" : "text-white";
  const linkColor = isLight ? "text-[#0F1A2E]/70 hover:text-[#0F1A2E]" : "text-white/70 hover:text-white";
  const linkActive = "text-[#C99A2E]";
  const signinColor = isLight ? "text-[#0F1A2E]/70 hover:text-[#0F1A2E]" : "text-white/70 hover:text-white";
  const ctaClass = isLight
    ? "bg-[#0F1A2E] text-white hover:bg-[#1A2944]"
    : "bg-[#C99A2E] text-black hover:bg-[#DBC075]";
  const mobileBg = isLight ? "bg-[#FAF7F2]/98 border-[#0F1A2E]/8" : "bg-black/95 border-white/5";
  const mobileLink = isLight ? "text-[#0F1A2E]/80" : "text-white/80";
  const burgerColor = isLight ? "text-[#0F1A2E]" : "text-white";

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 backdrop-blur-xl border-b ${baseBg}`} data-testid="marketing-nav">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        <Link to="/" className={`flex items-center gap-2.5 ${brandColor}`} data-testid="nav-logo">
          <img
            src="/assets/brand/logo-horizontal.png"
            alt="LensFlow · AI Real Estate Marketing Engine"
            className="h-12 w-auto"
            style={isLight
              ? { mixBlendMode: "multiply" }
              : { filter: "brightness(0) invert(1)" }}
          />
        </Link>

        <div className="hidden md:flex items-center gap-9">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              data-testid={`nav-${l.label.toLowerCase()}`}
              className={`text-sm tracking-wide transition-colors ${loc.pathname === l.to ? linkActive : linkColor}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Link to="/app/dashboard" className={`px-6 py-2.5 rounded-full font-medium text-sm transition-colors ${ctaClass}`} data-testid="nav-dashboard-btn">
              Open Studio →
            </Link>
          ) : (
            <>
              <Link to="/login" className={`text-sm ${signinColor}`} data-testid="nav-login">Sign In</Link>
              <Link to="/register" className={`px-6 py-2.5 rounded-full font-medium text-sm transition-colors ${ctaClass}`} data-testid="nav-cta">
                Start Recording
              </Link>
            </>
          )}
        </div>

        <button className={`md:hidden ${burgerColor}`} onClick={() => setOpen(!open)} data-testid="nav-mobile-toggle">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className={`md:hidden border-t backdrop-blur-xl ${mobileBg}`}>
          <div className="px-6 py-6 flex flex-col gap-5">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className={`text-base ${mobileLink}`} data-testid={`nav-mobile-${l.label.toLowerCase()}`}>{l.label}</Link>
            ))}
            {user ? (
              <Link to="/app/dashboard" className={`px-6 py-3 rounded-full font-medium text-center ${ctaClass}`}>Open Studio</Link>
            ) : (
              <>
                <Link to="/login" className={mobileLink}>Sign In</Link>
                <Link to="/register" className={`px-6 py-3 rounded-full font-medium text-center ${ctaClass}`}>Start Recording</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
