import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { formatApiErrorDetail } from "../../lib/api";
import { toast } from "sonner";
import { FolderOpen, Trash2, Sparkles, FileText } from "lucide-react";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/projects");
      setProjects(data.projects || []);
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Load failed");
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const del = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter(p => p.id !== id));
      toast.success("Deleted");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Delete failed");
    }
  };

  const filtered = filter === "all" ? projects : projects.filter(p => p.status === filter);

  return (
    <div className="px-6 lg:px-12 py-10 max-w-7xl" data-testid="projects-page">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] font-mono text-[#C99A2E] mb-2">Library</div>
          <h1 className="font-serif text-5xl tracking-tighter">Projects</h1>
        </div>
        <Link to="/app/studio" data-testid="projects-new" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#C99A2E] text-black font-medium hover:bg-[#DBC075]">
          <Sparkles size={16} /> New project
        </Link>
      </div>

      <div className="flex gap-2 mb-6">
        {[{v:"all",l:"All"},{v:"draft",l:"Drafts"},{v:"recorded",l:"Recorded"},{v:"published",l:"Published"}].map(f => (
          <button key={f.v} onClick={() => setFilter(f.v)} data-testid={`filter-${f.v}`}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${filter === f.v ? "bg-[#C99A2E] text-black" : "glass hover:bg-white/5"}`}>
            {f.l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-white/45 py-20 text-center">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-3xl p-16 text-center" data-testid="projects-empty">
          <FolderOpen className="mx-auto text-white/25 mb-4" size={32} />
          <p className="font-serif text-2xl text-white/45 mb-2">No projects yet</p>
          <p className="text-white/40 text-sm mb-6">Generate your first script to populate the library.</p>
          <Link to="/app/studio" className="inline-block px-6 py-3 rounded-full bg-[#C99A2E] text-black font-medium hover:bg-[#DBC075]">Open Studio</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div key={p.id} data-testid={`project-${p.id}`} className="glass rounded-2xl p-6 hover:border-white/15 transition-colors flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest ${
                  p.status === "published" ? "bg-[#C99A2E]/20 text-[#C99A2E]" :
                  p.status === "recorded" ? "bg-blue-500/20 text-blue-300" :
                  "bg-white/10 text-white/60"
                }`}>{p.status}</span>
                <button onClick={() => del(p.id)} className="text-white/30 hover:text-red-400" data-testid={`delete-${p.id}`}><Trash2 size={14} /></button>
              </div>
              <h3 className="font-serif text-xl mb-2 leading-tight">{p.title}</h3>
              {p.property_address && <p className="text-xs text-white/45 mb-3 font-mono">{p.property_address}</p>}
              <p className="text-white/65 text-sm line-clamp-3 mb-4 flex-1">{p.script || <span className="italic text-white/30">No script</span>}</p>
              <div className="flex items-center justify-between text-xs text-white/40 font-mono">
                <span>{p.presenter}</span>
                <span>{new Date(p.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
