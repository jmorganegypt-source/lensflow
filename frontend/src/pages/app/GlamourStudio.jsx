import React, { useState, useEffect, useRef } from "react";
import { Wand2, Upload, Loader2, Download, RefreshCw, Sparkles, X, CheckCircle2, AlertTriangle } from "lucide-react";
import api, { formatApiErrorDetail } from "../../lib/api";
import { toast } from "sonner";

const MAX_PHOTOS = 5;

const PRESET_THUMBS = {
  magazine_hdr:    { name: "Magazine HDR",    desc: "Balanced exposure · architectural finish",     tint: "from-amber-500/20 to-orange-600/10" },
  golden_hour:     { name: "Golden Hour",     desc: "Warm sunset · long shadows · cinematic",       tint: "from-yellow-500/30 to-amber-700/10" },
  dusk_twilight:   { name: "Dusk · Twilight", desc: "Blue hour · interior lights glowing",          tint: "from-indigo-500/25 to-purple-700/10" },
  lifestyle_lush:  { name: "Lifestyle · Lush",desc: "Lawn greenup · declutter · brochure",          tint: "from-emerald-500/25 to-green-700/10" },
  interior_polish: { name: "Interior Polish", desc: "Bright · sharp · magazine interior",           tint: "from-rose-500/20 to-pink-700/10" },
};

// status: 'queued' | 'processing' | 'done' | 'error'
export default function GlamourStudio() {
  const [presets, setPresets] = useState([]);
  const [preset, setPreset] = useState("magazine_hdr");
  const [photos, setPhotos] = useState([]); // { id, original, enhanced, status, error, notes }
  const [running, setRunning] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    api.get("/studio-plus/glamour/presets").then(r => setPresets(r.data.presets || []));
  }, []);

  const handleFiles = (fileList) => {
    if (!fileList) return;
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) { toast.error(`Maximum ${MAX_PHOTOS} photos per batch`); return; }
    const files = Array.from(fileList).slice(0, remaining);
    let added = 0;
    files.forEach((f) => {
      if (!f.type.startsWith("image/")) { toast.error(`${f.name} is not an image`); return; }
      if (f.size > 10 * 1024 * 1024)    { toast.error(`${f.name} is over 10 MB`);   return; }
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotos(prev => [
          ...prev,
          { id: `${Date.now()}-${Math.random()}`, original: e.target.result, enhanced: null, status: "queued", error: null, notes: "" }
        ]);
      };
      reader.readAsDataURL(f);
      added++;
    });
    if (added > 0 && fileList.length > remaining) {
      toast.info(`Added ${added} of ${fileList.length} (${MAX_PHOTOS} max)`);
    }
  };

  const onDrop = (e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); };

  const removePhoto = (id) => setPhotos(prev => prev.filter(p => p.id !== id));

  const enhanceOne = async (photo) => {
    setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, status: "processing", error: null } : p));
    try {
      const { data } = await api.post("/studio-plus/glamour/enhance", { image: photo.original, preset });
      setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, enhanced: data.enhanced_image, notes: data.notes || "", status: "done" } : p));
    } catch (err) {
      const msg = formatApiErrorDetail(err.response?.data?.detail) || "Failed";
      setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, status: "error", error: msg } : p));
    }
  };

  const enhanceAll = async () => {
    const queue = photos.filter(p => p.status !== "done" && p.status !== "processing");
    if (queue.length === 0) { toast.error("Nothing to enhance"); return; }
    setRunning(true);
    try {
      // Run with concurrency cap 2 so we don't smash the API
      const work = [...queue];
      const inFlight = new Set();
      while (work.length || inFlight.size) {
        while (work.length && inFlight.size < 2) {
          const next = work.shift();
          const p = enhanceOne(next).finally(() => inFlight.delete(p));
          inFlight.add(p);
        }
        if (inFlight.size) await Promise.race(inFlight);
      }
      toast.success("Batch complete");
    } finally {
      setRunning(false);
    }
  };

  const downloadOne = (photo) => {
    if (!photo.enhanced) return;
    const a = document.createElement("a");
    a.href = photo.enhanced;
    a.download = `lensflow-${preset}-${photo.id.slice(-6)}.jpg`;
    a.click();
  };

  const downloadAll = () => {
    const done = photos.filter(p => p.status === "done");
    if (done.length === 0) return;
    done.forEach((p, i) => setTimeout(() => downloadOne(p), i * 250));
    toast.success(`Downloading ${done.length} photo${done.length > 1 ? "s" : ""}`);
  };

  const clearAll = () => setPhotos([]);

  const doneCount = photos.filter(p => p.status === "done").length;
  const queuedCount = photos.filter(p => p.status === "queued" || p.status === "error").length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12" data-testid="glamour-studio">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C99A2E]/10 border border-[#C99A2E]/30 mb-4">
          <Sparkles size={12} className="text-[#C99A2E]" />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C99A2E]">Powered by Gemini Nano Banana · Up to {MAX_PHOTOS} photos at once</span>
        </div>
        <h1 className="font-serif text-5xl tracking-tighter mb-3" data-testid="glamour-heading">
          Glamour <span className="italic text-[#C99A2E]">Photo Studio</span>
        </h1>
        <p className="text-white/55 text-base max-w-2xl">Drop up to {MAX_PHOTOS} listing photos. We process them in parallel and return magazine-grade architectural shots for every single one. The world's first AI listing photo enhancer built for real estate.</p>
      </div>

      {/* Preset selector */}
      <div className="mb-6">
        <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/45 mb-3">1. Choose a look (applies to every photo)</div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {presets.map((p) => {
            const thumb = PRESET_THUMBS[p.id] || { name: p.label, desc: "", tint: "from-white/10 to-white/5" };
            const active = preset === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPreset(p.id)}
                data-testid={`preset-${p.id}`}
                className={`group text-left p-4 rounded-2xl border transition-all ${active ? "border-[#C99A2E] bg-[#C99A2E]/10" : "border-white/10 hover:border-white/25 bg-white/[0.02]"}`}
              >
                <div className={`h-14 rounded-lg bg-gradient-to-br ${thumb.tint} mb-3 flex items-center justify-center`}>
                  <Wand2 size={18} className={active ? "text-[#C99A2E]" : "text-white/40"} />
                </div>
                <div className={`font-medium text-sm ${active ? "text-[#C99A2E]" : "text-white"}`}>{thumb.name}</div>
                <div className="text-white/45 text-[11px] mt-1 line-clamp-2">{thumb.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dropzone */}
      {photos.length < MAX_PHOTOS && (
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          data-testid="glamour-dropzone"
          className="border-2 border-dashed border-white/15 rounded-3xl p-12 text-center hover:border-[#C99A2E]/40 hover:bg-[#C99A2E]/[0.02] transition-colors cursor-pointer mb-8"
        >
          <div className="w-14 h-14 rounded-full bg-[#C99A2E]/10 border border-[#C99A2E]/30 flex items-center justify-center mx-auto mb-4">
            <Upload size={22} className="text-[#C99A2E]" />
          </div>
          <div className="font-serif text-2xl mb-1">{photos.length === 0 ? "Drop up to 5 property photos here" : `Add ${MAX_PHOTOS - photos.length} more photo${MAX_PHOTOS - photos.length === 1 ? "" : "s"}`}</div>
          <p className="text-white/45 text-sm">click to browse · JPG, PNG, WebP · up to 10 MB each</p>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} data-testid="glamour-file-input" />
        </div>
      )}

      {/* Toolbar */}
      {photos.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-4 rounded-2xl bg-white/[0.03] border border-white/10" data-testid="glamour-toolbar">
          <div className="text-sm text-white/65">
            <span className="font-mono text-white">{photos.length}</span> photo{photos.length !== 1 ? "s" : ""} loaded
            {doneCount > 0 && <span className="ml-3 text-[#C99A2E]"><CheckCircle2 size={12} className="inline -mt-0.5 mr-1" />{doneCount} enhanced</span>}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={clearAll} disabled={running} data-testid="glamour-clear-all" className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-strong hover:bg-white/10 text-sm disabled:opacity-50">
              <RefreshCw size={14} /> Clear all
            </button>
            {doneCount > 0 && (
              <button onClick={downloadAll} data-testid="glamour-download-all" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-sm">
                <Download size={14} /> Download all ({doneCount})
              </button>
            )}
            <button
              onClick={enhanceAll}
              disabled={running || queuedCount === 0}
              data-testid="glamour-enhance-all"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C99A2E] text-black hover:bg-[#DBC075] disabled:opacity-50 text-sm font-medium"
            >
              {running ? <><Loader2 size={14} className="animate-spin" /> Mia is enhancing…</> : <><Wand2 size={14} /> Mia — enhance {queuedCount > 0 ? `${queuedCount} photo${queuedCount > 1 ? "s" : ""}` : "all"}</>}
            </button>
          </div>
        </div>
      )}

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="glamour-grid">
          {photos.map((p) => (
            <PhotoCard key={p.id} photo={p} onRemove={() => removePhoto(p.id)} onRetry={() => enhanceOne(p)} onDownload={() => downloadOne(p)} />
          ))}
        </div>
      )}
    </div>
  );
}

function PhotoCard({ photo, onRemove, onRetry, onDownload }) {
  const display = photo.enhanced || photo.original;
  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40 group" data-testid={`photo-card-${photo.id.slice(-6)}`}>
      <div className="relative aspect-video bg-black">
        <img src={display} alt="" className="w-full h-full object-cover" />
        {/* Status overlays */}
        {photo.status === "processing" && (
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-[#C99A2E] mb-2" size={28} />
            <div className="text-xs font-mono text-white/75 uppercase tracking-widest">Enhancing…</div>
          </div>
        )}
        {photo.status === "error" && (
          <div className="absolute inset-0 bg-red-950/70 backdrop-blur-sm flex flex-col items-center justify-center px-4 text-center">
            <AlertTriangle className="text-red-400 mb-2" size={26} />
            <div className="text-xs text-red-200 line-clamp-3">{photo.error || "Failed"}</div>
            <button onClick={onRetry} className="mt-3 text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white">Retry</button>
          </div>
        )}
        {/* Status pill */}
        {photo.status === "queued" && (
          <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur text-[9px] font-mono uppercase tracking-widest text-white/65">Queued</div>
        )}
        {photo.status === "done" && (
          <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-[#C99A2E] text-black text-[9px] font-mono uppercase tracking-widest font-medium">Enhanced</div>
        )}
        {/* Remove */}
        <button onClick={onRemove} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/65 hover:bg-red-600 backdrop-blur flex items-center justify-center transition-colors" data-testid={`remove-${photo.id.slice(-6)}`}>
          <X size={13} className="text-white" />
        </button>
      </div>
      {photo.status === "done" && (
        <div className="p-3 flex items-center gap-2">
          <button onClick={onDownload} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-[#C99A2E] text-black text-xs font-medium hover:bg-[#DBC075]">
            <Download size={12} /> Download
          </button>
        </div>
      )}
    </div>
  );
}
