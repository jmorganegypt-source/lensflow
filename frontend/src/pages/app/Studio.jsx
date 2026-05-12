import React, { useEffect, useState, useRef } from "react";
import api, { formatApiErrorDetail } from "../../lib/api";
import { toast } from "sonner";
import { Sparkles, Loader2, Copy, Play, Pause, Save, Mic } from "lucide-react";
import { Link } from "react-router-dom";

const TONES = [
  { v: "luxury", l: "Luxury" },
  { v: "professional", l: "Professional" },
  { v: "warm", l: "Warm" },
  { v: "modern", l: "Modern" },
];

const PROPERTY_TYPES = ["Penthouse", "Estate", "Beachfront Villa", "Heritage Manor", "Apartment", "Townhouse", "Commercial Tower", "Off-the-plan"];

export default function Studio() {
  const [form, setForm] = useState({
    property_type: "Penthouse", address: "", bedrooms: 3, bathrooms: 2,
    price_range: "", key_features: "", tone: "luxury", duration_seconds: 60, presenter: "mia",
  });
  const [script, setScript] = useState(null);
  const [editedScript, setEditedScript] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [presenters, setPresenters] = useState([]);
  const audioRef = useRef(null);

  useEffect(() => {
    api.get("/presenters").then(r => setPresenters(r.data.presenters || []));
  }, []);

  const generate = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/studio/scripts", form);
      setScript(data);
      setEditedScript(data.script);
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Generation failed");
    } finally { setLoading(false); }
  };

  const playVoice = async () => {
    if (playing) { audioRef.current?.pause(); setPlaying(false); return; }
    if (!editedScript) return;
    const presenter = presenters.find(p => p.id === form.presenter);
    if (!presenter) return;
    setVoiceLoading(true);
    try {
      const { data } = await api.post("/tts/preview", { text: editedScript, voice_id: presenter.voice_id });
      if (audioRef.current) {
        audioRef.current.src = data.audio_url;
        audioRef.current.play();
        setPlaying(true);
        audioRef.current.onended = () => setPlaying(false);
      }
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Voice failed");
    } finally { setVoiceLoading(false); }
  };

  const saveAsProject = async () => {
    if (!editedScript) return;
    try {
      const { data } = await api.post("/projects", {
        title: script?.title || `${form.property_type} · ${form.address || "Untitled"}`,
        script: editedScript,
        presenter: form.presenter,
        property_address: form.address,
        status: "draft",
      });
      toast.success("Saved to projects");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Save failed");
    }
  };

  const copyScript = () => {
    navigator.clipboard.writeText(editedScript);
    toast.success("Copied");
  };

  return (
    <div className="px-6 lg:px-12 py-10 max-w-7xl" data-testid="studio-page">
      <audio ref={audioRef} className="hidden" />
      <div className="mb-10">
        <div className="text-xs uppercase tracking-[0.25em] font-mono text-[#C99A2E] mb-2">AI Studio</div>
        <h1 className="font-serif text-5xl tracking-tighter">Write the script.</h1>
        <p className="text-white/55 mt-2">Tell us the listing — GPT-5.2 returns a broadcast script in seconds.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <form onSubmit={generate} className="glass rounded-3xl p-7 space-y-5" data-testid="studio-form">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] font-mono text-white/50 mb-2">Property type</label>
              <select data-testid="studio-property-type" value={form.property_type} onChange={(e) => setForm({...form, property_type: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#C99A2E] focus:outline-none">
                {PROPERTY_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] font-mono text-white/50 mb-2">Tone</label>
              <select data-testid="studio-tone" value={form.tone} onChange={(e) => setForm({...form, tone: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#C99A2E] focus:outline-none">
                {TONES.map(t => <option key={t.v} value={t.v}>{t.l}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] font-mono text-white/50 mb-2">Address</label>
            <input required data-testid="studio-address" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} placeholder="12 Wentworth Rd, Vaucluse NSW" className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#C99A2E] focus:outline-none" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] font-mono text-white/50 mb-2">Beds</label>
              <input type="number" min={0} data-testid="studio-beds" value={form.bedrooms} onChange={(e) => setForm({...form, bedrooms: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#C99A2E] focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] font-mono text-white/50 mb-2">Baths</label>
              <input type="number" min={0} data-testid="studio-baths" value={form.bathrooms} onChange={(e) => setForm({...form, bathrooms: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#C99A2E] focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] font-mono text-white/50 mb-2">Duration</label>
              <select data-testid="studio-duration" value={form.duration_seconds} onChange={(e) => setForm({...form, duration_seconds: parseInt(e.target.value)})} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#C99A2E] focus:outline-none">
                <option value={30}>30s</option><option value={45}>45s</option><option value={60}>60s</option><option value={90}>90s</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] font-mono text-white/50 mb-2">Price (optional)</label>
            <input data-testid="studio-price" value={form.price_range} onChange={(e) => setForm({...form, price_range: e.target.value})} placeholder="Guide: $8.5M" className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#C99A2E] focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] font-mono text-white/50 mb-2">Key features</label>
            <textarea rows={3} data-testid="studio-features" value={form.key_features} onChange={(e) => setForm({...form, key_features: e.target.value})} placeholder="Harbour views, infinity pool, 5-car garage, wine cellar..." className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#C99A2E] focus:outline-none resize-none" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] font-mono text-white/50 mb-2">Presenter</label>
            <div className="grid grid-cols-2 gap-2">
              {presenters.slice(0, 4).map(p => (
                <button type="button" key={p.id} onClick={() => setForm({...form, presenter: p.id})} data-testid={`studio-presenter-${p.id}`}
                  className={`px-4 py-3 rounded-xl border text-sm text-left transition-all ${form.presenter === p.id ? "border-[#C99A2E] bg-[#C99A2E]/10 text-[#C99A2E]" : "border-white/10 hover:border-white/20"}`}>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-white/45 truncate">{p.accent}</div>
                </button>
              ))}
            </div>
          </div>
          <button data-testid="studio-generate" disabled={loading} className="w-full px-6 py-4 rounded-full bg-[#C99A2E] text-black font-medium hover:bg-[#DBC075] disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="animate-spin" size={18} /> Writing the script...</> : <><Sparkles size={18} /> Generate with GPT-5.2</>}
          </button>
        </form>

        {/* Output */}
        <div className="glass rounded-3xl p-7 flex flex-col" data-testid="studio-output">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">Script</div>
              {script && <div className="font-serif text-xl mt-1">{script.title}</div>}
            </div>
            {script && (
              <div className="text-xs font-mono text-white/45">
                {script.word_count} words · ~{script.estimated_duration}s
              </div>
            )}
          </div>
          {script ? (
            <>
              <textarea
                data-testid="studio-script-text"
                value={editedScript}
                onChange={(e) => setEditedScript(e.target.value)}
                rows={14}
                className="flex-1 w-full p-5 rounded-2xl bg-black/40 border border-white/10 focus:border-[#C99A2E] focus:outline-none resize-none font-serif text-lg leading-relaxed text-white/85 scrollbar-thin"
              />
              <div className="flex flex-wrap gap-2 mt-5">
                <button onClick={playVoice} disabled={voiceLoading} data-testid="studio-play-voice" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C99A2E] text-black font-medium hover:bg-[#DBC075] disabled:opacity-60 text-sm">
                  {voiceLoading ? <Loader2 className="animate-spin" size={14} /> : playing ? <Pause size={14}/> : <Play size={14} />}
                  {playing ? "Pause" : "Hear it"}
                </button>
                <button onClick={copyScript} data-testid="studio-copy" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-strong hover:bg-white/10 text-sm">
                  <Copy size={14} /> Copy
                </button>
                <button onClick={saveAsProject} data-testid="studio-save" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-strong hover:bg-white/10 text-sm">
                  <Save size={14} /> Save to projects
                </button>
                <Link to="/app/recorder" state={{ script: editedScript }} data-testid="studio-record" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-strong hover:bg-white/10 text-sm">
                  <Mic size={14} /> Record now
                </Link>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center text-white/35 py-20">
              <div>
                <Sparkles className="mx-auto mb-4 text-white/20" size={32} />
                <p className="font-serif text-2xl text-white/40">Your script appears here.</p>
                <p className="text-sm mt-2 text-white/35">Fill the brief and press Generate.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
