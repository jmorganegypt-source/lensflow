import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Sparkles, Mic, FolderOpen, ArrowUpRight, Clock, FilePlus2 } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ projects: 0, drafts: 0, published: 0, scripts: 0, minutes_saved: 0 });
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    api.get("/dashboard/stats").then(r => setStats(r.data)).catch(() => {});
    api.get("/projects").then(r => setProjects(r.data.projects || [])).catch(() => {});
  }, []);

  const quickActions = [
    { to: "/app/studio", icon: Sparkles, t: "Generate a script", d: "GPT-5.2 · 60 seconds", id: "qa-studio" },
    { to: "/app/recorder", icon: Mic, t: "Open teleprompter", d: "Camera-ready in one click", id: "qa-recorder" },
    { to: "/presenters", icon: FolderOpen, t: "Browse presenters", d: "Hear Mia, Oliver & more", id: "qa-presenters" },
  ];

  return (
    <div className="px-6 lg:px-12 py-10 max-w-7xl" data-testid="dashboard-page">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] font-mono text-[#C99A2E] mb-2">Studio</div>
          <h1 className="font-serif text-5xl tracking-tighter">Welcome back, <span className="italic">{user?.name?.split(" ")[0] || "there"}</span>.</h1>
          <p className="text-white/55 mt-2">Your media engine is warm and ready.</p>
        </div>
        <Link to="/app/studio" data-testid="dashboard-new-btn" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#C99A2E] text-black font-medium hover:bg-[#DBC075]">
          <FilePlus2 size={16} /> New script
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {[
          { l: "Projects", v: stats.projects, id: "stat-projects" },
          { l: "Scripts generated", v: stats.scripts, id: "stat-scripts" },
          { l: "Published", v: stats.published, id: "stat-published" },
          { l: "Minutes saved", v: stats.minutes_saved, id: "stat-minutes" },
        ].map((s) => (
          <div key={s.id} data-testid={s.id} className="glass rounded-2xl p-6">
            <div className="text-xs uppercase tracking-[0.2em] font-mono text-white/40 mb-3">{s.l}</div>
            <div className="font-serif text-4xl text-[#C99A2E]">{s.v}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-12">
        {quickActions.map((q) => (
          <Link key={q.to} to={q.to} data-testid={q.id} className="group glass tracing-border rounded-2xl p-7 hover:border-white/15 transition-all">
            <q.icon className="text-[#C99A2E] mb-5" size={26} />
            <div className="font-serif text-2xl mb-1">{q.t}</div>
            <div className="text-sm text-white/55">{q.d}</div>
            <div className="mt-6 flex items-center gap-2 text-[#C99A2E] text-sm font-medium">
              Open <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      <div className="glass rounded-2xl p-7">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl">Recent projects</h2>
          <Link to="/app/projects" className="text-sm text-[#C99A2E] hover:underline" data-testid="dashboard-view-all">View all →</Link>
        </div>
        {projects.length === 0 ? (
          <div className="py-12 text-center text-white/45">
            <Clock className="mx-auto mb-3 text-white/30" size={24} />
            <p className="text-sm">No projects yet. Start in the AI Studio.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {projects.slice(0, 6).map((p) => (
              <div key={p.id} className="flex items-center justify-between py-4" data-testid={`recent-${p.id}`}>
                <div>
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs text-white/40 font-mono uppercase tracking-wider mt-0.5">{p.status} · {p.presenter}</div>
                </div>
                <span className="text-xs text-white/40 font-mono">{new Date(p.updated_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
