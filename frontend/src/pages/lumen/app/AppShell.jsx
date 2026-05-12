import React from "react";
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { useLumenAuth } from "../../../context/LumenAuthContext";
import { Home, PlusCircle, FolderHeart, CreditCard, Settings as SettingsIcon, LogOut } from "lucide-react";

const items = [
  { to: "/lumen/app/home", label: "Home", Icon: Home, id: "home" },
  { to: "/lumen/app/create", label: "Create", Icon: PlusCircle, id: "create" },
  { to: "/lumen/app/library", label: "Library", Icon: FolderHeart, id: "library" },
  { to: "/lumen/app/billing", label: "Minutes", Icon: CreditCard, id: "billing" },
  { to: "/lumen/app/settings", label: "Settings", Icon: SettingsIcon, id: "settings" },
];

export default function LumenAppShell() {
  const { user, logout } = useLumenAuth();
  const nav = useNavigate();
  const onLogout = async () => { await logout(); nav("/lumen"); };

  return (
    <div className="lumen-root min-h-screen flex flex-col md:flex-row" data-testid="lumen-app-shell">
      <aside className="hidden md:flex w-60 shrink-0 flex-col bg-white/60 backdrop-blur-sm border-r border-black/[0.04]">
        <Link to="/lumen" className="flex items-center gap-2 px-6 h-16 border-b border-black/[0.04]">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#FF6B6B] to-[#FFD166] flex items-center justify-center text-white font-bold">L</div>
          <span className="lumen-display text-2xl">Lumen</span>
        </Link>
        <nav className="flex-1 p-3 space-y-1">
          {items.map(i => (
            <NavLink key={i.to} to={i.to} data-testid={`lumen-sidebar-${i.id}`} className={({isActive}) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-colors ${isActive ? "bg-[#FF6B6B] text-white font-semibold" : "text-[#5C5C7A] hover:bg-white"}`}>
              <i.Icon size={16} />
              {i.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-black/[0.04]">
          <div className="px-4 py-3 rounded-2xl bg-gradient-to-br from-[#FFE3D8] to-[#FFD166]/40 mb-2">
            <div className="text-[10px] uppercase tracking-widest font-bold text-[#FF6B6B] mb-0.5">{user?.in_trial ? "On free trial" : "Plan"}</div>
            <div className="text-sm font-semibold">{user?.in_trial ? "All unlocked" : `${user?.minutes_credit || 0} bonus min + ${Math.max(0, 10 - (user?.minutes_used_period || 0))} free`}</div>
          </div>
          <button onClick={onLogout} data-testid="lumen-sidebar-logout" className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm text-[#9999B0] hover:bg-white">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-black/[0.04]">
        <div className="grid grid-cols-5">
          {items.map(i => (
            <NavLink key={i.to} to={i.to} data-testid={`lumen-mobile-${i.id}`} className={({isActive}) => `flex flex-col items-center gap-1 py-2.5 text-[10px] ${isActive ? "text-[#FF6B6B] font-bold" : "text-[#9999B0]"}`}>
              <i.Icon size={20} />
              {i.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}
