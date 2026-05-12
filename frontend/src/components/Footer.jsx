import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-[#050505]" data-testid="footer">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-full bg-[#C99A2E] flex items-center justify-center">
              <span className="font-serif text-black text-xl leading-none pt-0.5">L</span>
            </div>
            <span className="font-serif text-2xl">LensFlow</span>
          </div>
          <p className="text-white/50 text-sm leading-relaxed">
            The cinematic AI media engine for prestige real estate. Sydney · Melbourne · London · LA.
          </p>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-4 font-mono">Platform</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link to="/presenters" className="hover:text-[#C99A2E]">AI Presenters</Link></li>
            <li><Link to="/pricing" className="hover:text-[#C99A2E]">Pricing</Link></li>
            <li><Link to="/app/studio" className="hover:text-[#C99A2E]">AI Studio</Link></li>
            <li><Link to="/app/recorder" className="hover:text-[#C99A2E]">Teleprompter</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-4 font-mono">Company</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link to="/concierge" className="hover:text-[#C99A2E]">Concierge</Link></li>
            <li><a className="hover:text-[#C99A2E]" href="#about">About</a></li>
            <li><a className="hover:text-[#C99A2E]" href="#press">Press</a></li>
            <li><a className="hover:text-[#C99A2E]" href="#careers">Careers</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-white/40 mb-4 font-mono">Trusted by</h4>
          <p className="text-sm text-white/60">Compatible with REA, Domain, Rightmove, Zillow & Compass listing exports.</p>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 flex flex-col md:flex-row justify-between text-xs text-white/40 gap-2">
          <p>© 2026 LensFlow. Built for elite real estate worldwide.</p>
          <div className="flex gap-6 font-mono uppercase tracking-widest">
            <span>Australia</span><span>·</span><span>United Kingdom</span><span>·</span><span>United States</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
