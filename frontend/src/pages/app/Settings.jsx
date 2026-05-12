import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { Crown, Mail, ArrowUpRight, Mic, Upload, Loader2, Trash2, Volume2, Lock } from "lucide-react";
import api, { formatApiErrorDetail } from "../../lib/api";
import { toast } from "sonner";

const ELITE_PLANS = new Set(["elite", "concierge", "enterprise", "admin"]);

export default function Settings() {
  const { user } = useAuth();
  const isElite = user && ELITE_PLANS.has((user.plan || "").toLowerCase());

  // Voice clone state
  const [voices, setVoices] = useState([]);
  const [name, setName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordedFile, setRecordedFile] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recTimerRef = useRef(null);
  const [recSeconds, setRecSeconds] = useState(0);
  const fileRef = useRef(null);

  const loadVoices = async () => {
    try {
      const { data } = await api.get("/studio-plus/voice-clone/mine");
      setVoices(data.voices || []);
    } catch { /* unauthenticated edge case */ }
  };

  useEffect(() => {
    if (user) loadVoices();
  }, [user]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setRecordedBlob(blob);
        setRecordedFile(null);
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
      setRecSeconds(0);
      recTimerRef.current = setInterval(() => setRecSeconds((s) => s + 1), 1000);
    } catch (e) {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    clearInterval(recTimerRef.current);
    setRecording(false);
  };

  const handleFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith("audio/")) { toast.error("Audio file only"); return; }
    if (f.size > 25 * 1024 * 1024) { toast.error("Max 25 MB"); return; }
    setRecordedFile(f);
    setRecordedBlob(null);
  };

  const createVoice = async () => {
    if (!name.trim()) { toast.error("Name your voice (e.g., \"My Voice\")"); return; }
    const audioPayload = recordedFile || (recordedBlob ? new File([recordedBlob], "recording.webm", { type: "audio/webm" }) : null);
    if (!audioPayload) { toast.error("Record or upload an audio sample first"); return; }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("audio", audioPayload);
      const { data } = await api.post("/studio-plus/voice-clone/create", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success(`Voice "${data.name}" cloned successfully`);
      setName("");
      setRecordedBlob(null);
      setRecordedFile(null);
      setRecSeconds(0);
      loadVoices();
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Voice clone failed");
    } finally { setUploading(false); }
  };

  const deleteVoice = async (vid) => {
    if (!confirm("Remove this voice from your library?")) return;
    try {
      await api.delete(`/studio-plus/voice-clone/${vid}`);
      toast.success("Voice removed");
      loadVoices();
    } catch (err) {
      toast.error("Could not remove");
    }
  };

  return (
    <div className="px-6 lg:px-12 py-10 max-w-4xl" data-testid="settings-page">
      <div className="mb-10">
        <div className="text-xs uppercase tracking-[0.25em] font-mono text-[#C99A2E] mb-2">Settings</div>
        <h1 className="font-serif text-5xl tracking-tighter">Account</h1>
      </div>

      <div className="space-y-4">
        <div className="glass rounded-2xl p-7">
          <h2 className="font-serif text-2xl mb-5">Profile</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="text-xs font-mono uppercase tracking-wider text-white/40 mb-1">Name</dt>
              <dd data-testid="settings-name">{user?.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-mono uppercase tracking-wider text-white/40 mb-1">Email</dt>
              <dd data-testid="settings-email">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-mono uppercase tracking-wider text-white/40 mb-1">Role</dt>
              <dd data-testid="settings-role" className="capitalize">{user?.role}</dd>
            </div>
          </dl>
        </div>

        <div className="glass rounded-2xl p-7 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-white/40 mb-2"><Crown size={14} className="text-[#C99A2E]" /> Plan</div>
            <div className="font-serif text-3xl capitalize" data-testid="settings-plan">{user?.plan || "free"}</div>
          </div>
          <Link to="/pricing" data-testid="settings-upgrade" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#C99A2E] text-black font-medium hover:bg-[#DBC075]">
            Upgrade <ArrowUpRight size={14} />
          </Link>
        </div>

        {/* Voice Clone — Elite tier */}
        <div className="glass rounded-2xl p-7" data-testid="voice-clone-section">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Mic size={18} className="text-[#C99A2E]" />
              <h2 className="font-serif text-2xl">Voice Clone Studio</h2>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#C99A2E]/15 text-[#C99A2E] text-[10px] font-mono uppercase tracking-widest border border-[#C99A2E]/30">
              <Crown size={10} /> Elite
            </span>
          </div>
          <p className="text-white/55 text-sm mb-5">Record 60 seconds of your voice — every future listing will be narrated <em className="text-[#C99A2E]">in your own voice</em>, on autopilot.</p>

          {!isElite ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center" data-testid="voice-clone-locked">
              <Lock size={22} className="text-[#C99A2E] mx-auto mb-3" />
              <div className="font-serif text-lg mb-2">Available on Elite Partner</div>
              <p className="text-white/55 text-sm mb-4">Upgrade to clone your voice and run listings in your own accent.</p>
              <Link to="/pricing" data-testid="voice-clone-upgrade-cta" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C99A2E] text-black font-medium text-sm">
                See Elite plan <ArrowUpRight size={12} />
              </Link>
            </div>
          ) : (
            <>
              {/* Existing voices */}
              {voices.length > 0 && (
                <div className="mb-6">
                  <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/45 mb-3">Your cloned voices</div>
                  <div className="space-y-2">
                    {voices.map((v) => (
                      <div key={v.voice_id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10" data-testid={`voice-${v.voice_id}`}>
                        <div className="flex items-center gap-3">
                          <Volume2 size={14} className="text-[#C99A2E]" />
                          <div>
                            <div className="text-sm font-medium">{v.name}</div>
                            <div className="text-[10px] font-mono text-white/40">{v.voice_id.slice(0, 12)}…</div>
                          </div>
                        </div>
                        <button onClick={() => deleteVoice(v.voice_id)} className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recorder / uploader */}
              <div className="space-y-4">
                <input
                  type="text"
                  data-testid="voice-clone-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Voice name (e.g., Marcus Pro)"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#C99A2E] focus:outline-none text-sm"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                    <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/45 mb-3">Option A · Record now</div>
                    {!recording ? (
                      <button
                        onClick={startRecording}
                        disabled={uploading}
                        data-testid="voice-clone-record"
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#C99A2E]/15 border border-[#C99A2E]/30 hover:bg-[#C99A2E]/25 text-[#C99A2E] text-sm font-medium"
                      >
                        <Mic size={14} /> Start recording
                      </button>
                    ) : (
                      <button
                        onClick={stopRecording}
                        data-testid="voice-clone-stop"
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/40 hover:bg-red-500/30 text-red-300 text-sm font-medium"
                      >
                        <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" /> Recording · {recSeconds}s — Stop
                      </button>
                    )}
                    {(recordedBlob && !recordedFile) && <div className="text-xs text-white/50 mt-2">✓ Recorded ({recSeconds}s) — ready</div>}
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                    <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/45 mb-3">Option B · Upload mp3 / wav</div>
                    <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
                    <button
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      data-testid="voice-clone-upload"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-white/85 text-sm"
                    >
                      <Upload size={14} /> Choose audio file
                    </button>
                    {recordedFile && <div className="text-xs text-white/50 mt-2">✓ {recordedFile.name}</div>}
                  </div>
                </div>

                <button
                  onClick={createVoice}
                  disabled={uploading || (!recordedBlob && !recordedFile) || !name.trim()}
                  data-testid="voice-clone-submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#C99A2E] text-black hover:bg-[#DBC075] disabled:opacity-50 font-medium"
                >
                  {uploading ? <><Loader2 className="animate-spin" size={16} /> Cloning voice…</> : "Clone my voice"}
                </button>
                <p className="text-[11px] text-white/40 font-mono">Tip: clear speech, no background noise, 30-60 seconds is plenty. Read a paragraph from a book in your natural tone.</p>
              </div>
            </>
          )}
        </div>

        <div className="glass rounded-2xl p-7">
          <h2 className="font-serif text-2xl mb-2">Need a hand?</h2>
          <p className="text-white/55 text-sm mb-5">Reach concierge or support directly.</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/concierge" data-testid="settings-concierge" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-strong hover:bg-white/10 text-sm">
              <Mail size={14} /> Concierge
            </Link>
            <a href="mailto:support@lensflow.ai" data-testid="settings-support" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-strong hover:bg-white/10 text-sm">
              <Mail size={14} /> support@lensflow.ai
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
