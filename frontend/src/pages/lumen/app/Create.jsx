import React, { useEffect, useRef, useState } from "react";
import lumenApi, { lumenErr } from "../../../lib/lumenApi";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Sparkles, Loader2, Camera, Mic, Square, Play, Pause, RefreshCw, Send, Copy, Check } from "lucide-react";

const STEPS = ["Occasion", "Script", "Style", "Record", "Send"];

export default function LumenCreate() {
  const [step, setStep] = useState(0);
  const [catalogs, setCatalogs] = useState({ occasions: [], looks: [], music: [], backgrounds: [], voices: [] });

  // Step state
  const [occasion, setOccasion] = useState(null);
  const [recipient, setRecipient] = useState("");
  const [yourName, setYourName] = useState("");
  const [notes, setNotes] = useState("");
  const [length, setLength] = useState("medium");
  const [script, setScript] = useState("");
  const [generating, setGenerating] = useState(false);

  const [lookId, setLookId] = useState("natural");
  const [musicId, setMusicId] = useState("none");
  const [backgroundId, setBackgroundId] = useState("none");
  const [voice, setVoice] = useState(null); // {id, voice_id, name}
  const [previewingVoice, setPreviewingVoice] = useState(false);

  // Recording state
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const teleRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [duration, setDuration] = useState(0);
  const [teleScrollSpeed, setTeleScrollSpeed] = useState(40);
  const [teleFontSize, setTeleFontSize] = useState(28);
  const [teleScrolling, setTeleScrolling] = useState(false);

  const [recipientEmail, setRecipientEmail] = useState("");
  const [senderNote, setSenderNote] = useState("");
  const [sending, setSending] = useState(false);
  const [sentResult, setSentResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Load catalogs
  useEffect(() => {
    lumenApi.get("/catalogs").then(r => {
      setCatalogs(r.data);
      if (r.data.voices?.length) setVoice(r.data.voices[0]);
    });
  }, []);

  // Teleprompter auto-scroll
  useEffect(() => {
    let id;
    if (teleScrolling && teleRef.current) {
      const tick = () => { if (teleRef.current) teleRef.current.scrollTop += teleScrollSpeed / 30; id = requestAnimationFrame(tick); };
      id = requestAnimationFrame(tick);
    }
    return () => id && cancelAnimationFrame(id);
  }, [teleScrolling, teleScrollSpeed]);

  // Cleanup
  useEffect(() => () => {
    streamRef.current?.getTracks()?.forEach(t => t.stop());
  }, []);

  const generateScript = async () => {
    if (!occasion) return;
    setGenerating(true);
    try {
      const { data } = await lumenApi.post("/scripts", {
        occasion: occasion.id, recipient_name: recipient || "you", your_name: yourName, notes, length,
      });
      setScript(data.script);
    } catch (err) {
      toast.error(lumenErr(err.response?.data?.detail) || "Script gen failed");
    } finally { setGenerating(false); }
  };

  const previewVoice = async () => {
    if (!script || !voice) return;
    if (previewingVoice) { audioRef.current?.pause(); setPreviewingVoice(false); return; }
    try {
      const { data } = await lumenApi.post("/tts/preview", { text: script, voice_id: voice.voice_id });
      if (audioRef.current) {
        audioRef.current.src = data.audio_url;
        audioRef.current.play();
        setPreviewingVoice(true);
        audioRef.current.onended = () => setPreviewingVoice(false);
      }
    } catch (err) {
      toast.error(lumenErr(err.response?.data?.detail) || "Voice failed");
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1080 }, height: { ideal: 1920 } }, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setHasCamera(true);
      toast.success("Camera ready 📸");
    } catch {
      toast.error("Camera permission needed");
    }
  };

  const startRec = () => {
    if (!streamRef.current) { startCamera(); return; }
    chunksRef.current = [];
    const mr = new MediaRecorder(streamRef.current, { mimeType: "video/webm" });
    mr.ondataavailable = e => e.data.size > 0 && chunksRef.current.push(e.data);
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setRecordedBlob(blob);
      setRecordedUrl(URL.createObjectURL(blob));
    };
    mr.start();
    mediaRecorderRef.current = mr;
    setRecording(true); setDuration(0); setTeleScrolling(true);
    const tick = () => { setDuration(d => d + 1); };
    const id = setInterval(tick, 1000);
    mr.addEventListener("stop", () => clearInterval(id));
  };

  const stopRec = () => { mediaRecorderRef.current?.stop(); setRecording(false); setTeleScrolling(false); };

  const retake = () => {
    setRecordedBlob(null);
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedUrl(null);
    setDuration(0);
    if (teleRef.current) teleRef.current.scrollTop = 0;
  };

  const sendMoment = async () => {
    if (!script) return;
    setSending(true);
    try {
      // Create moment (recording_url is base64 blob URL — for MVP we store local; real prod would upload to S3)
      const recordingUrl = recordedUrl || null;
      const { data: m } = await lumenApi.post("/moments", {
        occasion: occasion.id,
        recipient_name: recipient || "you",
        script,
        look_id: lookId,
        music_id: musicId,
        background_id: backgroundId,
        voice_id: voice?.voice_id,
        recording_url: recordingUrl,
        duration_seconds: duration,
      });
      const { data: r } = await lumenApi.post(`/moments/${m.id}/send`, { recipient_email: recipientEmail, sender_note: senderNote });
      setSentResult({ url: r.share_url, recipient: recipientEmail });
      toast.success("Sent! 💌");
    } catch (err) {
      toast.error(lumenErr(err.response?.data?.detail) || "Send failed");
    } finally { setSending(false); }
  };

  const copyLink = () => {
    if (!sentResult?.url) return;
    navigator.clipboard.writeText(sentResult.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ---- Step gating
  const canNext = () => {
    if (step === 0) return !!occasion && !!recipient.trim();
    if (step === 1) return !!script.trim();
    if (step === 2) return true;
    if (step === 3) return true;
    return false;
  };

  const next = () => setStep(s => Math.min(STEPS.length - 1, s + 1));
  const prev = () => setStep(s => Math.max(0, s - 1));

  const currentLook = catalogs.looks.find(l => l.id === lookId);
  const currentBg = catalogs.backgrounds.find(b => b.id === backgroundId);
  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  return (
    <div className="px-5 lg:px-10 py-8 max-w-5xl" data-testid="lumen-create">
      <audio ref={audioRef} className="hidden" />

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div onClick={() => i < step && setStep(i)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 ${i === step ? "bg-[#FF6B6B] text-white" : i < step ? "bg-[#FFD166] text-[#1A1A2E] cursor-pointer" : "bg-white text-[#9999B0]"}`} data-testid={`step-pill-${i}`}>
              <span className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-[10px]">{i + 1}</span>{s}
            </div>
            {i < STEPS.length - 1 && <div className="text-[#FFD166]">·</div>}
          </React.Fragment>
        ))}
      </div>

      {/* STEP 0 — Occasion */}
      {step === 0 && (
        <div data-testid="step-occasion" className="space-y-6">
          <div>
            <div className="lumen-hand text-3xl text-[#FF6B6B]">first things first</div>
            <h2 className="lumen-display text-4xl">What's the moment?</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {catalogs.occasions.map(o => (
              <button key={o.id} onClick={() => setOccasion(o)} data-testid={`pick-${o.id}`} className={`lumen-card p-5 text-left transition-all ${occasion?.id === o.id ? "ring-4 ring-[#FF6B6B] scale-[1.03]" : "hover:scale-[1.02]"}`}>
                <div className="text-3xl mb-2">{o.emoji}</div>
                <div className="font-semibold">{o.label}</div>
              </button>
            ))}
          </div>
          <div className="lumen-card p-6 grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-widest font-bold text-[#9999B0] mb-1.5 block">Who's it for?</label>
              <input data-testid="input-recipient" required value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="Mum / Alex / Best friend" className="lumen-input" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest font-bold text-[#9999B0] mb-1.5 block">Your name (optional)</label>
              <input data-testid="input-yourname" value={yourName} onChange={e => setYourName(e.target.value)} placeholder="Maya" className="lumen-input" />
            </div>
          </div>
        </div>
      )}

      {/* STEP 1 — Script */}
      {step === 1 && (
        <div data-testid="step-script" className="space-y-5">
          <div>
            <div className="lumen-hand text-3xl text-[#FF6B6B]">we'll write it for you</div>
            <h2 className="lumen-display text-4xl">Your script</h2>
            <p className="text-[#5C5C7A]">Sound like you. Or hit Generate and Lumen drafts a starting point.</p>
          </div>
          <div className="lumen-card p-5 grid sm:grid-cols-3 gap-3">
            <textarea data-testid="input-notes" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anything specific to mention? (inside joke, memory, vibe)" className="lumen-input sm:col-span-2 resize-none" />
            <select data-testid="input-length" value={length} onChange={e => setLength(e.target.value)} className="lumen-input">
              <option value="short">Short · ~15s</option>
              <option value="medium">Medium · ~30s</option>
              <option value="long">Long · ~45s</option>
            </select>
          </div>
          <button onClick={generateScript} disabled={generating} data-testid="generate-script" className="lumen-btn-primary inline-flex items-center gap-2">
            {generating ? <><Loader2 size={16} className="animate-spin" /> Writing your message…</> : <><Sparkles size={16}/> Generate with AI</>}
          </button>
          <textarea data-testid="script-textarea" value={script} onChange={e => setScript(e.target.value)} rows={8} placeholder="Your script will appear here — edit freely." className="lumen-input lumen-display text-lg leading-relaxed resize-none" />
          <div className="text-xs text-[#9999B0] font-mono text-right">{script.split(/\s+/).filter(Boolean).length} words · est. {Math.round(script.split(/\s+/).filter(Boolean).length / 2.5)}s</div>
        </div>
      )}

      {/* STEP 2 — Style (look, music, bg, voice) */}
      {step === 2 && (
        <div data-testid="step-style" className="space-y-6">
          <div>
            <div className="lumen-hand text-3xl text-[#FF6B6B]">make it yours</div>
            <h2 className="lumen-display text-4xl">Pick your look</h2>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-widest font-bold text-[#9999B0] mb-3">Makeup / Filter</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {catalogs.looks.map(l => (
                <button key={l.id} onClick={() => setLookId(l.id)} data-testid={`look-${l.id}`} className={`lumen-card p-4 text-center transition-all ${lookId === l.id ? "ring-4 ring-[#FF6B6B]" : ""}`}>
                  <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-[#FFE3D8] to-[#FFD166]/60 mb-2" style={{ filter: l.css_filter }} />
                  <div className="text-sm font-semibold">{l.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-widest font-bold text-[#9999B0] mb-3">Background</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {catalogs.backgrounds.map(b => (
                <button key={b.id} onClick={() => setBackgroundId(b.id)} data-testid={`bg-${b.id}`} className={`relative aspect-video rounded-2xl overflow-hidden text-white text-xs font-semibold transition-all ${backgroundId === b.id ? "ring-4 ring-[#FF6B6B]" : ""}`}>
                  {b.url ? <img src={b.url} alt={b.label} className="absolute inset-0 w-full h-full object-cover" /> : <div className="absolute inset-0 bg-gradient-to-br from-[#FFE3D8] to-[#D5C6F8]" />}
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="relative h-full flex items-end p-2">{b.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-widest font-bold text-[#9999B0] mb-3">Music</h3>
            <div className="flex flex-wrap gap-2">
              {catalogs.music.map(m => (
                <button key={m.id} onClick={() => setMusicId(m.id)} data-testid={`music-${m.id}`} className={`lumen-chip ${musicId === m.id ? "active" : ""}`}>
                  🎵 {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-widest font-bold text-[#9999B0] mb-3">AI Voice (optional)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {catalogs.voices.map(v => (
                <button key={v.id} onClick={() => setVoice(v)} data-testid={`voice-${v.id}`} className={`lumen-card p-4 text-left transition-all ${voice?.id === v.id ? "ring-4 ring-[#FF6B6B]" : ""}`}>
                  <div className="font-semibold">{v.name}</div>
                  <div className="text-xs text-[#9999B0]">{v.vibe}</div>
                </button>
              ))}
            </div>
            <button onClick={previewVoice} disabled={!script} data-testid="preview-voice" className="lumen-btn-ghost mt-3 inline-flex items-center gap-2 text-sm disabled:opacity-50">
              {previewingVoice ? <Pause size={14}/> : <Play size={14} />} {previewingVoice ? "Stop" : "Preview voice with your script"}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 — Record */}
      {step === 3 && (
        <div data-testid="step-record" className="space-y-5">
          <div>
            <div className="lumen-hand text-3xl text-[#FF6B6B]">action time</div>
            <h2 className="lumen-display text-4xl">Read & record</h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 relative">
              <div className="relative aspect-[9/16] sm:aspect-video rounded-3xl overflow-hidden bg-black">
                {recordedUrl ? (
                  <video src={recordedUrl} controls className="w-full h-full object-cover" data-testid="record-playback" />
                ) : (
                  <>
                    {currentBg?.url && <img src={currentBg.url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />}
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ filter: currentLook?.css_filter || "none" }} data-testid="record-video" />
                    <div ref={teleRef} className="absolute inset-x-0 bottom-0 top-1/3 overflow-y-scroll px-6 py-6 bg-gradient-to-t from-black/70 to-transparent" style={{ scrollbarWidth: "none" }}>
                      <p style={{ fontSize: `${teleFontSize}px`, lineHeight: 1.4 }} className="lumen-display text-white text-center" data-testid="tele-text">{script}</p>
                      <div className="h-[60vh]" />
                    </div>
                    {recording && (
                      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/95 text-white text-xs font-mono" data-testid="record-indicator">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" /> REC {fmt(duration)}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {!hasCamera && !recordedUrl && (
                  <button onClick={startCamera} data-testid="cam-start" className="lumen-btn-ghost text-sm inline-flex items-center gap-2"><Camera size={14}/> Turn on camera</button>
                )}
                {hasCamera && !recording && !recordedUrl && (
                  <button onClick={startRec} data-testid="rec-start" className="lumen-btn-primary text-sm inline-flex items-center gap-2"><Mic size={14}/> Record</button>
                )}
                {recording && (
                  <button onClick={stopRec} data-testid="rec-stop" className="lumen-btn-primary text-sm inline-flex items-center gap-2" style={{ background: "#1A1A2E" }}><Square size={14}/> Stop</button>
                )}
                {recordedUrl && (
                  <button onClick={retake} data-testid="rec-retake" className="lumen-btn-ghost text-sm inline-flex items-center gap-2"><RefreshCw size={14}/> Retake</button>
                )}
                {hasCamera && !recording && !recordedUrl && (
                  <button onClick={() => setTeleScrolling(!teleScrolling)} data-testid="tele-toggle" className="lumen-btn-ghost text-sm inline-flex items-center gap-2">
                    {teleScrolling ? <Pause size={14}/> : <Play size={14}/>} {teleScrolling ? "Pause prompter" : "Play prompter"}
                  </button>
                )}
              </div>
            </div>
            <div className="lumen-card p-5 space-y-4">
              <div>
                <div className="text-xs uppercase tracking-widest font-bold text-[#9999B0] mb-1.5">Scroll speed · {teleScrollSpeed}px/s</div>
                <input type="range" min={10} max={120} value={teleScrollSpeed} onChange={e => setTeleScrollSpeed(parseInt(e.target.value))} className="w-full accent-[#FF6B6B]" data-testid="tele-speed" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest font-bold text-[#9999B0] mb-1.5">Font size · {teleFontSize}px</div>
                <input type="range" min={20} max={56} value={teleFontSize} onChange={e => setTeleFontSize(parseInt(e.target.value))} className="w-full accent-[#FF6B6B]" data-testid="tele-font" />
              </div>
              <div className="text-xs text-[#9999B0] leading-relaxed">
                Pro tip: Look just above your camera lens. Smile with your eyes. Talk to the person — not the screen.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4 — Send */}
      {step === 4 && (
        <div data-testid="step-send" className="space-y-5 max-w-2xl">
          <div>
            <div className="lumen-hand text-3xl text-[#FF6B6B]">last bit</div>
            <h2 className="lumen-display text-4xl">Send it</h2>
            <p className="text-[#5C5C7A]">We'll email a private link or you can copy it and share anywhere.</p>
          </div>

          {sentResult ? (
            <div className="lumen-card p-8 text-center" data-testid="send-success">
              <div className="text-5xl mb-3">💌</div>
              <h3 className="lumen-display text-3xl mb-2">Sent to {sentResult.recipient || recipient}.</h3>
              <p className="text-[#5C5C7A] mb-6">Your moment is live. Here's the share link:</p>
              <div className="bg-[#FFF1E6] rounded-xl p-3 text-sm text-[#5C5C7A] font-mono break-all mb-4 text-left">{sentResult.url}</div>
              <button onClick={copyLink} data-testid="copy-link" className="lumen-btn-primary inline-flex items-center gap-2 text-sm">
                {copied ? <><Check size={14}/> Copied</> : <><Copy size={14}/> Copy link</>}
              </button>
            </div>
          ) : (
            <div className="lumen-card p-6 space-y-4">
              <div>
                <label className="text-xs uppercase tracking-widest font-bold text-[#9999B0] mb-1.5 block">Recipient's email</label>
                <input data-testid="send-email" type="email" required value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} placeholder="them@email.com" className="lumen-input" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest font-bold text-[#9999B0] mb-1.5 block">Note (optional)</label>
                <textarea data-testid="send-note" rows={3} value={senderNote} onChange={e => setSenderNote(e.target.value)} placeholder="A short message above the video..." className="lumen-input resize-none" />
              </div>
              <button onClick={sendMoment} disabled={sending || !recipientEmail || !script} data-testid="send-cta" className="lumen-btn-primary w-full flex items-center justify-center gap-2">
                {sending ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : <><Send size={16}/> Send moment</>}
              </button>
              <p className="text-xs text-center text-[#9999B0]">You can also copy the share link after sending.</p>
            </div>
          )}
        </div>
      )}

      {/* Nav */}
      <div className="flex justify-between mt-10">
        <button onClick={prev} disabled={step === 0} data-testid="step-prev" className="lumen-btn-ghost inline-flex items-center gap-2 disabled:opacity-40">
          <ArrowLeft size={16} /> Back
        </button>
        {step < STEPS.length - 1 ? (
          <button onClick={next} disabled={!canNext()} data-testid="step-next" className="lumen-btn-primary inline-flex items-center gap-2">
            Next <ArrowRight size={16} />
          </button>
        ) : <div />}
      </div>
    </div>
  );
}
