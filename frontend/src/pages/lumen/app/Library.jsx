import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import lumenApi, { lumenErr } from "../../../lib/lumenApi";
import { toast } from "sonner";
import { Trash2, Send, Copy, FolderHeart, PlusCircle, Check } from "lucide-react";

export default function LumenLibrary() {
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  const load = async () => {
    setLoading(true);
    try { const { data } = await lumenApi.get("/moments"); setMoments(data.moments || []); }
    catch (e) { toast.error(lumenErr(e.response?.data?.detail)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const del = async (id) => {
    if (!window.confirm("Delete this moment?")) return;
    try { await lumenApi.delete(`/moments/${id}`); setMoments(m => m.filter(x => x.id !== id)); toast.success("Deleted"); }
    catch (e) { toast.error(lumenErr(e.response?.data?.detail)); }
  };

  const copy = (m) => {
    const url = `${window.location.origin}/lumen/share/${m.share_token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(m.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="px-5 lg:px-10 py-10 max-w-5xl" data-testid="lumen-library">
      <div className="flex items-center justify-between mb-8 gap-3">
        <div>
          <div className="lumen-hand text-3xl text-[#FF6B6B]">your moments</div>
          <h1 className="lumen-display text-4xl">Library</h1>
        </div>
        <Link to="/lumen/app/create" data-testid="lib-new" className="lumen-btn-primary text-sm inline-flex items-center gap-2"><PlusCircle size={14} /> New</Link>
      </div>

      {loading ? (
        <div className="text-center text-[#9999B0] py-20">Loading…</div>
      ) : moments.length === 0 ? (
        <div className="lumen-card p-12 text-center" data-testid="lib-empty">
          <FolderHeart className="mx-auto text-[#FFD166] mb-4" size={32} />
          <h3 className="lumen-display text-2xl mb-2">No moments yet</h3>
          <p className="text-[#5C5C7A] mb-6">Your library will fill up fast.</p>
          <Link to="/lumen/app/create" className="lumen-btn-primary inline-block">Make your first →</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {moments.map(m => (
            <div key={m.id} data-testid={`lib-moment-${m.id}`} className="lumen-card p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${m.sent ? "bg-[#B8F2D8] text-[#1A1A2E]" : "bg-[#FFD166] text-[#1A1A2E]"}`}>
                  {m.sent ? "Sent" : "Draft"}
                </span>
                <button onClick={() => del(m.id)} data-testid={`del-${m.id}`} className="text-[#9999B0] hover:text-[#FF6B6B]"><Trash2 size={14} /></button>
              </div>
              <h3 className="lumen-display text-xl mb-1">For {m.recipient_name}</h3>
              <p className="text-xs text-[#FF6B6B] font-semibold uppercase tracking-widest mb-3">{m.occasion?.replace("_"," ")}</p>
              <p className="text-sm text-[#5C5C7A] line-clamp-3 mb-4 flex-1">{m.script}</p>
              <div className="flex gap-2">
                <button onClick={() => copy(m)} data-testid={`copy-${m.id}`} className="lumen-btn-ghost text-xs flex-1 inline-flex items-center justify-center gap-1.5 py-2">
                  {copiedId === m.id ? <><Check size={12}/> Copied</> : <><Copy size={12}/> Copy link</>}
                </button>
              </div>
              <div className="mt-3 text-xs text-[#9999B0] flex items-center justify-between">
                <span>{new Date(m.updated_at).toLocaleDateString()}</span>
                <span>{m.views || 0} views</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
