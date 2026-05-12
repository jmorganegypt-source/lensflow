import React, { useState, useEffect, useRef } from "react";
import { Wand2, Upload, Loader2, Download, RefreshCw, Sparkles, Image as ImageIcon } from "lucide-react";
import api, { formatApiErrorDetail } from "../../lib/api";
import { toast } from "sonner";

const PRESET_THUMBS = {
  magazine_hdr: { name: "Magazine HDR", desc: "Balanced exposure · architectural finish", tint: "from-amber-500/20 to-orange-600/10" },
  golden_hour: { name: "Golden Hour", desc: "Warm sunset · long shadows · cinematic", tint: "from-yellow-500/30 to-amber-700/10" },
  dusk_twilight: { name: "Dusk · Twilight", desc: "Blue hour · interior lights glowing", tint: "from-indigo-500/25 to-purple-700/10" },
  lifestyle_lush: { name: "Lifestyle · Lush", desc: "Lawn greenup · declutter · brochure", tint: "from-emerald-500/25 to-green-700/10" },
  interior_polish: { name: "Interior Polish", desc: "Bright · sharp · magazine interior", tint: "from-rose-500/20 to-pink-700/10" },
};

export default function GlamourStudio() {
  const [presets, setPresets] = useState([]);
  const [preset, setPreset] = useState("magazine_hdr");
  const [original, setOriginal] = useState(null);     // data URL
  const [enhanced, setEnhanced] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [sliderPct, setSliderPct] = useState(50);
  const fileRef = useRef(null);

  useEffect(() => {
    api.get("/studio-plus/glamour/presets").then(r => setPresets(r.data.presets || []));
  }, []);

  const handleFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) { toast.error("Please upload an image (JPG/PNG/WebP)"); return; }
    if (f.size > 10 * 1024 * 1024) { toast.error("Image must be under 10 MB"); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginal(e.target.result);
      setEnhanced(null);
      setNotes("");
    };
    reader.readAsDataURL(f);
  };

  const onDrop = (e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); };

  const enhance = async () => {
    if (!original) { toast.error("Upload a photo first"); return; }
    setLoading(true);
    setEnhanced(null);
    try {
      const { data } = await api.post("/studio-plus/glamour/enhance", {
        image: original,
        preset,
      });
      setEnhanced(data.enhanced_image);
      setNotes(data.notes || "");
      toast.success("Photo enhanced — magazine grade.");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Enhancement failed. Try a different photo or preset.");
    } finally { setLoading(false); }
  };

  const download = () => {
    if (!enhanced) return;
    const a = document.createElement("a");
    a.href = enhanced;
    a.download = `lensflow-${preset}-${Date.now()}.jpg`;
    a.click();
  };

  const reset = () => { setOriginal(null); setEnhanced(null); setNotes(""); };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12" data-testid="glamour-studio">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C99A2E]/10 border border-[#C99A2E]/30 mb-4">
          <Sparkles size={12} className="text-[#C99A2E]" />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C99A2E]">Powered by Gemini Nano Banana</span>
        </div>
        <h1 className="font-serif text-5xl tracking-tighter mb-3" data-testid="glamour-heading">
          Glamour <span className="italic text-[#C99A2E]">Photo Studio</span>
        </h1>
        <p className="text-white/55 text-base max-w-2xl">Upload a regular property photo. Get a magazine-grade architectural shot back in seconds. The world's first AI listing photo enhancer built for real estate.</p>
      </div>

      {/* Preset selector */}
      <div className="mb-6">
        <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/45 mb-3">Choose a look</div>
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

      {/* Workspace */}
      {!original ? (
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          data-testid="glamour-dropzone"
          className="border-2 border-dashed border-white/15 rounded-3xl p-20 text-center hover:border-[#C99A2E]/40 hover:bg-[#C99A2E]/[0.02] transition-colors cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full bg-[#C99A2E]/10 border border-[#C99A2E]/30 flex items-center justify-center mx-auto mb-5">
            <Upload size={24} className="text-[#C99A2E]" />
          </div>
          <div className="font-serif text-2xl mb-2">Drop a property photo here</div>
          <p className="text-white/45 text-sm">or click to browse · JPG, PNG, WebP · up to 10 MB</p>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} data-testid="glamour-file-input" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 text-sm">
              <ImageIcon size={16} className="text-[#C99A2E]" />
              <span className="text-white/65">Photo loaded · drag the slider to compare</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={reset} data-testid="glamour-reset" className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-strong hover:bg-white/10 text-sm">
                <RefreshCw size={14} /> New photo
              </button>
              {enhanced && (
                <button onClick={download} data-testid="glamour-download" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C99A2E] text-black hover:bg-[#DBC075] text-sm font-medium">
                  <Download size={14} /> Download
                </button>
              )}
              <button
                onClick={enhance}
                disabled={loading}
                data-testid="glamour-enhance-btn"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C99A2E] text-black hover:bg-[#DBC075] disabled:opacity-60 text-sm font-medium"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                {enhanced ? "Re-enhance" : loading ? "Enhancing…" : "Enhance"}
              </button>
            </div>
          </div>

          {/* Side-by-side / slider */}
          <div className="relative rounded-3xl overflow-hidden bg-black border border-white/10" data-testid="glamour-canvas">
            <div className="relative aspect-video w-full">
              {/* Enhanced (always full image) */}
              {enhanced ? (
                <img src={enhanced} alt="Enhanced" className="absolute inset-0 w-full h-full object-contain" data-testid="glamour-enhanced-img" />
              ) : (
                <img src={original} alt="Original" className="absolute inset-0 w-full h-full object-contain" data-testid="glamour-original-img" />
              )}
              {/* Original overlay clipped to slider */}
              {enhanced && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - sliderPct}% 0 0)` }}
                >
                  <img src={original} alt="Original" className="absolute inset-0 w-full h-full object-contain" />
                </div>
              )}
              {/* Loading overlay */}
              {loading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
                  <Loader2 className="animate-spin text-[#C99A2E] mb-4" size={36} />
                  <div className="font-serif text-2xl mb-1">Composing magazine-grade frame…</div>
                  <div className="text-white/55 text-sm">Gemini Nano Banana · ~15-30s</div>
                </div>
              )}
              {/* Labels */}
              {enhanced && !loading && (
                <>
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur text-[10px] font-mono uppercase tracking-[0.2em]">Before</div>
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#C99A2E] text-black text-[10px] font-mono uppercase tracking-[0.2em] font-medium">After</div>
                </>
              )}
            </div>

            {/* Slider */}
            {enhanced && (
              <div className="px-6 py-4 border-t border-white/10">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPct}
                  onChange={(e) => setSliderPct(parseInt(e.target.value))}
                  data-testid="glamour-slider"
                  className="w-full accent-[#C99A2E]"
                />
                <div className="flex justify-between text-[11px] font-mono uppercase tracking-[0.2em] text-white/40 mt-2">
                  <span>Original</span>
                  <span>Enhanced</span>
                </div>
              </div>
            )}
          </div>

          {notes && (
            <div className="glass rounded-2xl p-5 text-sm text-white/65" data-testid="glamour-notes">
              <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#C99A2E] mb-2">AI notes</div>
              {notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
