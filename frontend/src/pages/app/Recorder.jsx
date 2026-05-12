import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Mic, Square, Play, Pause, Camera, Settings2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiErrorDetail } from "../../lib/api";

const DEFAULT_SCRIPT = "Behind these gates, a Federation manor reborn. Soaring ceilings. Harbour views that reach the horizon. This is more than an address — this is the next chapter. Inquire today, before the catalogue closes.";

export default function Recorder() {
  const location = useLocation();
  const [script, setScript] = useState(location.state?.script || DEFAULT_SCRIPT);
  const [scrolling, setScrolling] = useState(false);
  const [speed, setSpeed] = useState(40); // px/sec
  const [fontSize, setFontSize] = useState(36);
  const [recording, setRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [duration, setDuration] = useState(0);

  const videoRef = useRef(null);
  const teleprompterRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  // Auto-scroll teleprompter
  useEffect(() => {
    let id;
    if (scrolling && teleprompterRef.current) {
      const tick = () => {
        if (teleprompterRef.current) teleprompterRef.current.scrollTop += speed / 30;
        id = requestAnimationFrame(tick);
      };
      id = requestAnimationFrame(tick);
    }
    return () => id && cancelAnimationFrame(id);
  }, [scrolling, speed]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      toast.success("Camera ready");
    } catch (e) {
      toast.error("Camera permission denied or unavailable");
    }
  };

  const startRecording = () => {
    if (!streamRef.current) {
      toast.error("Start the camera first");
      return;
    }
    recordedChunksRef.current = [];
    const mr = new MediaRecorder(streamRef.current, { mimeType: "video/webm" });
    mr.ondataavailable = (e) => { if (e.data.size > 0) recordedChunksRef.current.push(e.data); };
    mr.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setRecordedUrl(url);
    };
    mr.start();
    mediaRecorderRef.current = mr;
    setRecording(true);
    setScrolling(true);
    setDuration(0);
    timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    setScrolling(false);
    clearInterval(timerRef.current);
  };

  const reset = () => {
    setRecordedUrl(null);
    setDuration(0);
    if (teleprompterRef.current) teleprompterRef.current.scrollTop = 0;
  };

  const saveTake = async () => {
    if (!recordedUrl) return;
    try {
      await api.post("/projects", {
        title: `Recording · ${new Date().toLocaleString()}`,
        script,
        status: "recorded",
      });
      toast.success("Recording saved to projects");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Save failed");
    }
  };

  useEffect(() => () => {
    streamRef.current?.getTracks()?.forEach(t => t.stop());
    clearInterval(timerRef.current);
  }, []);

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  return (
    <div className="px-6 lg:px-12 py-10 max-w-7xl" data-testid="recorder-page">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-[0.25em] font-mono text-[#C99A2E] mb-2">Teleprompter</div>
        <h1 className="font-serif text-5xl tracking-tighter">Record your take.</h1>
        <p className="text-white/55 mt-2">Auto-scrolling script over your camera. Eye-line stays on lens.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Camera + Teleprompter */}
        <div className="lg:col-span-2 relative">
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-black border border-white/10">
            {recordedUrl ? (
              <video src={recordedUrl} controls className="w-full h-full object-cover" data-testid="recorder-playback" />
            ) : (
              <>
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" data-testid="recorder-video" />
                <div ref={teleprompterRef} className="absolute inset-x-0 bottom-0 top-1/3 overflow-y-scroll px-10 py-8 bg-gradient-to-t from-black/70 to-transparent scrollbar-thin" style={{ scrollbarWidth: "none" }}>
                  <p style={{ fontSize: `${fontSize}px`, lineHeight: 1.4 }} className="font-serif text-white text-center" data-testid="teleprompter-text">{script}</p>
                  <div className="h-[60vh]" />
                </div>
                {/* Eye-line marker */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-12 bg-[#C99A2E]/40 pointer-events-none" />
                {recording && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/90 text-white font-mono text-xs" data-testid="recording-indicator">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    REC · {fmt(duration)}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Controls */}
          <div className="mt-5 flex flex-wrap gap-3 justify-center">
            {!streamRef.current && !recordedUrl && (
              <button onClick={startCamera} data-testid="recorder-start-camera" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 text-sm">
                <Camera size={16} /> Start camera
              </button>
            )}
            {!recording && !recordedUrl && (
              <button onClick={startRecording} data-testid="recorder-start" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-red-500 hover:bg-red-600 font-medium">
                <Mic size={16} /> Record
              </button>
            )}
            {recording && (
              <button onClick={stopRecording} data-testid="recorder-stop" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#C99A2E] text-black font-medium">
                <Square size={16} /> Stop
              </button>
            )}
            {!recording && !recordedUrl && (
              <button onClick={() => setScrolling(!scrolling)} data-testid="recorder-scroll-toggle" className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-strong hover:bg-white/10 text-sm">
                {scrolling ? <Pause size={14} /> : <Play size={14} />} {scrolling ? "Pause script" : "Play script"}
              </button>
            )}
            {recordedUrl && (
              <>
                <button onClick={reset} data-testid="recorder-retake" className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-strong hover:bg-white/10 text-sm">
                  <RefreshCw size={14} /> Retake
                </button>
                <button onClick={saveTake} data-testid="recorder-save" className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#C99A2E] text-black font-medium text-sm">
                  Save take
                </button>
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-mono text-white/45 mb-4">
              <Settings2 size={14} /> Teleprompter
            </div>
            <label className="block text-xs text-white/55 mb-2">Scroll speed · {speed}px/s</label>
            <input type="range" min={10} max={120} value={speed} onChange={(e) => setSpeed(parseInt(e.target.value))} className="w-full accent-[#C99A2E] mb-4" data-testid="recorder-speed" />
            <label className="block text-xs text-white/55 mb-2">Font size · {fontSize}px</label>
            <input type="range" min={20} max={72} value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="w-full accent-[#C99A2E]" data-testid="recorder-fontsize" />
          </div>
          <div className="glass rounded-2xl p-6">
            <div className="text-xs uppercase tracking-[0.2em] font-mono text-white/45 mb-3">Script</div>
            <textarea data-testid="recorder-script" value={script} onChange={(e) => setScript(e.target.value)} rows={10} className="w-full p-3 rounded-xl bg-black/40 border border-white/10 focus:border-[#C99A2E] focus:outline-none text-sm leading-relaxed text-white/85 resize-none scrollbar-thin" />
          </div>
        </div>
      </div>
    </div>
  );
}
