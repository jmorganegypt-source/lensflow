import React, { useState, useEffect, useRef } from "react";
import { Camera, Upload, Loader2, Mic, Sparkles, Download, Play, X, ArrowRight } from "lucide-react";
import api, { formatApiErrorDetail } from "../../lib/api";
import { toast } from "sonner";

export default function ConfidenceMode() {
  const [step, setStep] = useState(1); // 1=script, 2=photos, 3=voice, 4=render
  const [script, setScript] = useState("");
  const [photos, setPhotos] = useState([]);  // [{name, dataUrl}]
  const [presenters, setPresenters] = useState([]);
  const [voiceId, setVoiceId] = useState("");
  const [presenterName, setPresenterName] = useState("");
  const [rendering, setRendering] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    api.get("/presenters").then(r => {
      const list = r.data.presenters || [];
      setPresenters(list);
      if (list.length) { setVoiceId(list[0].voice_id); setPresenterName(list[0].name); }
    });
  }, []);

  const handleFiles = (fileList) => {
    const files = Array.from(fileList || []).slice(0, 8 - photos.length);
    files.forEach((f) => {
      if (!f.type.startsWith("image/")) return;
      if (f.size > 8 * 1024 * 1024) { toast.error(`${f.name} > 8MB — skipped`); return; }
      const reader = new FileReader();
      reader.onload = (e) => setPhotos((prev) => [...prev, { name: f.name, dataUrl: e.target.result }]);
      reader.readAsDataURL(f);
    });
  };

  const removePhoto = (i) => setPhotos((prev) => prev.filter((_, idx) => idx !== i));

  const render = async () => {
    if (script.length < 20) { toast.error("Script too short"); setStep(1); return; }
    if (!photos.length) { toast.error("Add at least one photo"); setStep(2); return; }
    if (!voiceId) { toast.error("Pick a presenter"); setStep(3); return; }
    setRendering(true);
    setVideoUrl(null);
    try {
      const { data } = await api.post("/studio-plus/confidence-video", {
        script,
        voice_id: voiceId,
        photo_urls: photos.map((p) => p.dataUrl),
        duration_per_photo: 4.5,
      });
      const baseUrl = process.env.REACT_APP_BACKEND_URL || "";
      setVideoUrl(baseUrl + data.video_url);
      toast.success("Video composed — eye-line never wavered.");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Render failed.");
    } finally { setRendering(false); }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12" data-testid="confidence-mode">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C99A2E]/10 border border-[#C99A2E]/30 mb-4">
          <Camera size={12} className="text-[#C99A2E]" />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C99A2E]">Camera-shy mode · No filming required</span>
        </div>
        <h1 className="font-serif text-5xl tracking-tighter mb-3" data-testid="confidence-heading">
          Confidence <span className="italic text-[#C99A2E]">Mode</span>
        </h1>
        <p className="text-white/55 text-base max-w-2xl">For agents who'd rather not be on camera. Drop your script, your property photos and a presenter — LensFlow composes a finished listing video in under a minute. No filming, no setup, no second takes.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-10" data-testid="confidence-steps">
        {[
          { n: 1, l: "Script" },
          { n: 2, l: "Photos" },
          { n: 3, l: "Presenter" },
          { n: 4, l: "Render" },
        ].map((s, i) => (
          <React.Fragment key={s.n}>
            <button
              onClick={() => s.n <= step && setStep(s.n)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-colors ${
                step === s.n ? "bg-[#C99A2E] text-black" : s.n < step ? "bg-[#C99A2E]/20 text-[#C99A2E]" : "bg-white/[0.04] text-white/40"
              }`}
            >
              <span className="font-serif text-sm">{s.n}</span> {s.l}
            </button>
            {i < 3 && <div className={`h-px flex-1 max-w-[40px] ${s.n < step ? "bg-[#C99A2E]" : "bg-white/10"}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1 — Script */}
      {step === 1 && (
        <div className="glass rounded-3xl p-8" data-testid="step-script">
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#C99A2E] mb-3">Step 1 — Your script</div>
          <h2 className="font-serif text-3xl mb-4">What should the presenter say?</h2>
          <p className="text-white/55 text-sm mb-4">Paste a script you've written, or <a href="/app/studio" className="text-[#C99A2E] underline">generate one in AI Studio</a> first.</p>
          <textarea
            data-testid="confidence-script"
            value={script}
            onChange={(e) => setScript(e.target.value)}
            rows={9}
            placeholder="Welcome to this stunning beachfront residence at..."
            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#C99A2E] focus:outline-none text-sm leading-relaxed"
          />
          <div className="flex justify-between items-center mt-3 text-xs text-white/45 font-mono">
            <span>{script.length} chars · ~{Math.round(script.split(/\s+/).filter(Boolean).length / 2.4)}s spoken</span>
            <button
              onClick={() => setStep(2)}
              disabled={script.length < 20}
              data-testid="confidence-next-1"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#C99A2E] text-black hover:bg-[#DBC075] disabled:opacity-50 font-medium"
            >
              Next · Photos <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — Photos */}
      {step === 2 && (
        <div className="glass rounded-3xl p-8" data-testid="step-photos">
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#C99A2E] mb-3">Step 2 — Property photos</div>
          <h2 className="font-serif text-3xl mb-4">Add 1–8 listing photos</h2>
          <p className="text-white/55 text-sm mb-5">They'll cycle as a Ken-Burns slideshow under the narration. Tip: run them through <a href="/app/glamour" className="text-[#C99A2E] underline">Glamour Studio</a> first for magazine quality.</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {photos.map((p, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group" data-testid={`confidence-photo-${i}`}>
                <img src={p.dataUrl} alt={p.name} className="w-full h-full object-cover" />
                <button onClick={() => removePhoto(i)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={12} />
                </button>
              </div>
            ))}
            {photos.length < 8 && (
              <button
                onClick={() => fileRef.current?.click()}
                data-testid="confidence-add-photo"
                className="aspect-square rounded-xl border-2 border-dashed border-white/15 flex flex-col items-center justify-center hover:border-[#C99A2E]/40 hover:bg-[#C99A2E]/[0.02] transition-colors"
              >
                <Upload size={20} className="text-[#C99A2E] mb-2" />
                <span className="text-xs text-white/55">Add photo</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={(e) => handleFiles(e.target.files)} className="hidden" />
          </div>

          <div className="flex justify-between items-center text-xs text-white/45 font-mono">
            <span>{photos.length} / 8 photos</span>
            <button
              onClick={() => setStep(3)}
              disabled={photos.length === 0}
              data-testid="confidence-next-2"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#C99A2E] text-black hover:bg-[#DBC075] disabled:opacity-50 font-medium"
            >
              Next · Presenter <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Presenter */}
      {step === 3 && (
        <div className="glass rounded-3xl p-8" data-testid="step-presenter">
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#C99A2E] mb-3">Step 3 — Pick your voice</div>
          <h2 className="font-serif text-3xl mb-5">Who narrates?</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {presenters.map((p) => {
              const active = voiceId === p.voice_id;
              return (
                <button
                  key={p.id}
                  onClick={() => { setVoiceId(p.voice_id); setPresenterName(p.name); }}
                  data-testid={`presenter-${p.id}`}
                  className={`p-4 rounded-2xl border text-left transition-colors ${active ? "border-[#C99A2E] bg-[#C99A2E]/10" : "border-white/10 hover:border-white/25 bg-white/[0.02]"}`}
                >
                  {p.avatar && <div className="aspect-square rounded-xl overflow-hidden mb-3"><img src={p.avatar} alt={p.name} className="w-full h-full object-cover" /></div>}
                  <div className={`font-medium text-sm ${active ? "text-[#C99A2E]" : "text-white"}`}>{p.name}</div>
                  <div className="text-white/45 text-[11px] mt-1">{p.accent}</div>
                </button>
              );
            })}
          </div>
          <div className="flex justify-end">
            <button onClick={() => setStep(4)} data-testid="confidence-next-3" disabled={!voiceId} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#C99A2E] text-black hover:bg-[#DBC075] disabled:opacity-50 font-medium">
              Next · Render <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 4 — Render */}
      {step === 4 && (
        <div className="glass rounded-3xl p-8" data-testid="step-render">
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#C99A2E] mb-3">Step 4 — Compose</div>
          <h2 className="font-serif text-3xl mb-3">Ready to render</h2>
          <div className="grid sm:grid-cols-3 gap-4 mb-6 text-sm">
            <div className="glass-strong rounded-xl p-4">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/45 mb-1">Script</div>
              <div className="text-white/85">{script.split(/\s+/).filter(Boolean).length} words</div>
            </div>
            <div className="glass-strong rounded-xl p-4">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/45 mb-1">Photos</div>
              <div className="text-white/85">{photos.length} scenes</div>
            </div>
            <div className="glass-strong rounded-xl p-4">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/45 mb-1">Voice</div>
              <div className="text-white/85">{presenterName || "—"}</div>
            </div>
          </div>

          {!videoUrl ? (
            <button
              onClick={render}
              disabled={rendering}
              data-testid="confidence-render-btn"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-[#C99A2E] text-black hover:bg-[#DBC075] disabled:opacity-60 font-medium gold-glow"
            >
              {rendering ? <><Loader2 className="animate-spin" size={18} /> Composing your listing video…</> : <><Sparkles size={18} /> Render listing video</>}
            </button>
          ) : (
            <div className="space-y-4" data-testid="confidence-video-result">
              <div className="rounded-2xl overflow-hidden bg-black border border-[#C99A2E]/30">
                <video src={videoUrl} controls className="w-full aspect-video" data-testid="confidence-video-player" />
              </div>
              <div className="flex gap-3 justify-center">
                <a href={videoUrl} download="lensflow-listing.mp4" data-testid="confidence-download" className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#C99A2E] text-black hover:bg-[#DBC075] font-medium">
                  <Download size={14} /> Download MP4
                </a>
                <button onClick={() => { setVideoUrl(null); setStep(1); setScript(""); setPhotos([]); }} className="inline-flex items-center gap-2 px-5 py-3 rounded-full glass-strong hover:bg-white/10">
                  Make another
                </button>
              </div>
            </div>
          )}

          {rendering && (
            <p className="text-center text-white/45 text-xs font-mono mt-4 animate-pulse">~30–90s · TTS + slideshow composition + H.264 encode</p>
          )}
        </div>
      )}
    </div>
  );
}
