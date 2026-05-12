import React from "react";
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LayoutDashboard, Sparkles, Mic, FolderOpen, Settings as SettingsIcon, LogOut, ArrowUpRight } from "lucide-react";

const navItems = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
  { to: "/app/studio", label: "AI Studio", icon: Sparkles, id: "studio" },
  { to: "/app/recorder", label: "Recorder", icon: Mic, id: "recorder" },
  { to: "/app/projects", label: "Projects", icon: FolderOpen, id: "projects" },
  { to: "/app/settings", label: "Settings", icon: SettingsIcon, id: "settings" },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const handleLogout = async () => {
    await logout();
    nav("/");
  };

  return (
    <div className="min-h-screen flex bg-[#050505] text-white" data-testid="app-shell">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-white/5 bg-[#070707]" data-testid="app-sidebar">
        <Link to="/" className="flex items-center gap-2.5 px-6 h-20 border-b border-white/5">
          <div className="w-9 h-9 rounded-full bg-[#C99A2E] flex items-center justify-center">
            <span className="font-serif text-black text-xl leading-none pt-0.5">L</span>
          </div>
          <span className="font-serif text-2xl">LensFlow</span>
        </Link>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              data-testid={`sidebar-${n.id}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
                  isActive ? "bg-[#C99A2E]/15 text-[#C99A2E] border border-[#C99A2E]/30" : "text-white/65 hover:text-white hover:bg-white/[0.04]"
                }`
              }
            >
              <n.icon size={16} />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <div className="px-4 py-3 rounded-xl glass mb-3">
            <div className="text-xs font-mono uppercase tracking-widest text-white/40 mb-1">Plan</div>
            <div className="font-medium capitalize">{user?.plan || "free"}</div>
            <Link to="/pricing" className="text-xs text-[#C99A2E] hover:underline mt-1 inline-flex items-center gap-1">Upgrade <ArrowUpRight size={11} /></Link>
          </div>
          <button onClick={handleLogout} data-testid="sidebar-logout" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/55 hover:text-white hover:bg-white/[0.04] text-sm">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 h-16 border-b border-white/5 bg-black/80 backdrop-blur-xl flex items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#C99A2E] flex items-center justify-center">
            <span className="font-serif text-black text-lg leading-none pt-0.5">L</span>
          </div>
          <span className="font-serif text-xl">LensFlow</span>
        </Link>
        <button onClick={handleLogout} className="text-white/60" data-testid="mobile-logout"><LogOut size={18} /></button>
      </div>
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/5 bg-black/90 backdrop-blur-xl">
        <div className="flex justify-around py-2">
          {navItems.map((n) => (
            <NavLink key={n.to} to={n.to} data-testid={`mobile-nav-${n.id}`} className={({isActive}) => `flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-[10px] ${isActive ? "text-[#C99A2E]" : "text-white/55"}`}>
              <n.icon size={18} />
              <span>{n.label.split(" ")[0]}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto pt-16 md:pt-0 pb-20 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}
