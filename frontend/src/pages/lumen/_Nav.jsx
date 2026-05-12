import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useLumenAuth } from "../../context/LumenAuthContext";

export default function LumenNav() {
  const { user } = useLumenAuth();
  const loc = useLocation();
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-black/[0.04]" data-testid="lumen-nav">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/lumen" className="flex items-center gap-2" data-testid="lumen-logo">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#FF6B6B] to-[#FFD166] flex items-center justify-center text-white text-lg font-bold shadow-md">L</div>
          <span className="lumen-display text-2xl">Lumen</span>
        </Link>
        <div className="hidden md:flex items-center gap-7 text-sm">
          <Link to="/lumen/pricing" className={loc.pathname === "/lumen/pricing" ? "text-[#FF6B6B] font-semibold" : "text-[#1A1A2E]/70 hover:text-[#1A1A2E]"} data-testid="lumen-nav-pricing">Pricing</Link>
          <a href="/lumen#how" className="text-[#1A1A2E]/70 hover:text-[#1A1A2E]">How it works</a>
          <a href="/lumen#occasions" className="text-[#1A1A2E]/70 hover:text-[#1A1A2E]">Occasions</a>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <Link to="/lumen/app/home" data-testid="lumen-nav-app" className="lumen-btn-primary text-sm px-5 py-2.5">Open</Link>
          ) : (
            <>
              <Link to="/lumen/login" className="hidden sm:inline-block text-sm text-[#1A1A2E]/70 hover:text-[#1A1A2E] px-4 py-2" data-testid="lumen-nav-login">Sign in</Link>
              <Link to="/lumen/register" data-testid="lumen-nav-register" className="lumen-btn-primary text-sm px-5 py-2.5">Try free</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
