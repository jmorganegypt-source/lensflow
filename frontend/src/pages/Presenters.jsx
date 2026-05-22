import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import MarketingNav from "../components/MarketingNav";
import Footer from "../components/Footer";
import api, { formatApiErrorDetail } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Play, Loader2, Pause, Mic, Crown, Sparkles, ArrowUpRight, Check } from "lucide-react";
import useDocTitle from "../hooks/useDocTitle";

export default function Presenters() {
  useDocTitle("Presenters · Mia & Oliver — LensFlow");
  const { user } = useAuth();
  const [presenters, setPresenters] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [playing, setPlaying] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    api.get("/presenters").then(r => setPresenters(r.data.presenters || []));
  }, []);

  const preview = async (p) => {
    if (!user) {
      toast.message("Sign in to hear a preview", { description: "Free account, no card required." });
      return;
    }
    if (playing === p.id) {
      audioRef.current?.pause();
      setPlaying(null);
      return;
    }
    setLoadingId(p.id);
    try {
      const sample = `Welcome to ${p.name === "Mia" ? "Cliffside Estate, a Federation manor reborn" : "this iconic landmark address"}. Designed for those who recognise true craftsmanship.`;
      const { data } = await api.post("/tts/preview", { text: sample, voice_id: p.voice_id });
      if (audioRef.current) {
        audioRef.current.src = data.audio_url;
        audioRef.current.play();
        setPlaying(p.id);
        audioRef.current.onended = () => setPlaying(null);
      }
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Preview failed");
    } finally { setLoadingId(null); }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white" data-testid="presenters-page">
      <MarketingNav />
      <audio ref={audioRef} className="hidden" />

      <section className="pt-40 pb-16 px-6 lg:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-xs uppercase tracking-[0.25em] font-mono text-[#C99A2E] mb-5">The Cast</div>
          <h1 className="font-serif text-6xl lg:text-8xl tracking-tighter leading-[0.95] mb-6">
            Voices that <span className="italic text-[#C99A2E]">close</span>.
          </h1>
          <p className="text-lg text-white/55 max-w-2xl">Five signature presenters, hand-tuned for prestige real estate across continents.</p>
          <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-white/45 font-mono">
            <span className="w-1.5 h-1.5 bg-[#C99A2E] rounded-full" /> Bring your own ElevenLabs voice IDs via backend env for instant cloning
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-10 pb-32">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6">
          {presenters.map((p) => {
            const VIDEO_MAP = {
              oliver: { src: "/assets/property/oliver-talking.mp4", poster: "/assets/property/oliver-talking-poster.jpg" },
            };
            const video = VIDEO_MAP[p.id];
            return (
            <div key={p.id} data-testid={`presenter-${p.id}`} className="group glass rounded-3xl overflow-hidden tracing-border">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="aspect-square md:aspect-auto relative bg-black">
                  {video ? (
                    <video
                      src={video.src}
                      poster={video.poster}
                      controls
                      preload="metadata"
                      playsInline
                      className="w-full h-full object-cover"
                      data-testid={`presenter-video-${p.id}`}
                    />
                  ) : (
                    <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                  )}
                  {!video && <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a0a]/40 md:to-[#0a0a0a]" />}
                </div>
                <div className="p-8 flex flex-col justify-between">
                  <div>
                    <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#C99A2E] mb-3">{p.accent}</div>
                    <h3 className="font-serif text-4xl tracking-tight mb-2">{p.name}</h3>
                    <p className="text-white/70 mb-2">{p.tagline}</p>
                    <p className="text-white/45 text-sm leading-relaxed mb-5">{p.description}</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {p.specialty.map((s, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs text-white/65">{s}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    data-testid={`preview-${p.id}`}
                    onClick={() => preview(p)}
                    disabled={loadingId === p.id}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#C99A2E] text-black font-medium hover:bg-[#DBC075] disabled:opacity-60 w-fit"
                  >
                    {loadingId === p.id ? <Loader2 className="animate-spin" size={16} /> : playing === p.id ? <Pause size={16}/> : <Play size={16} />}
                    {playing === p.id ? "Pause preview" : "Hear voice"}
                  </button>
                </div>
              </div>
            </div>
          );})}
        </div>

        {/* ============== YOUR VOICE · YOUR AI TWIN ============== */}
        <div className="mt-24" data-testid="voice-clone-section">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1a1410] via-[#0E0E0E] to-[#0F1A2E] border border-[#C99A2E]/30">
            <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-[#C99A2E]/12 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full bg-[#C99A2E]/8 blur-3xl pointer-events-none" />

            <div className="relative grid lg:grid-cols-2 gap-12 p-10 lg:p-16 items-center">
              {/* LEFT: copy + 3-presenter pick UI */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C99A2E]/15 border border-[#C99A2E]/40 mb-5">
                  <Crown size={11} className="text-[#C99A2E]" />
                  <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#C99A2E]">Concierge feature</span>
                </div>
                <h2 className="font-serif text-5xl lg:text-6xl tracking-tighter leading-[0.95] mb-5">
                  Your voice. <br /><span className="italic text-[#C99A2E]">Your AI twin.</span>
                </h2>
                <p className="text-white/65 text-lg leading-relaxed mb-8 max-w-xl">
                  Type the script once. Let an AI presenter — Mia, Oliver, <strong className="text-white">or a clone of your own voice</strong> — read it perfectly, every time. Sixty seconds of audio is all we need to train it.
                </p>

                <ul className="space-y-3 mb-9">
                  {[
                    "60-second voice training · upload from your phone",
                    "Pronounces street names & suburbs the way you say them",
                    "Use across Studio, Confidence Mode & Glamour videos",
                    "Voice stays yours — exported with every listing video",
                  ].map((perk, i) => (
                    <li key={i} className="flex items-start gap-3 text-white/75 text-sm">
                      <Check size={15} className="text-[#C99A2E] shrink-0 mt-0.5" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-3 items-center">
                  <Link
                    to={user ? "/app/studio" : "/done-for-you"}
                    data-testid="voice-clone-cta"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#C99A2E] text-black font-medium hover:bg-[#DBC075] transition-colors"
                  >
                    {user ? "Train your voice in Studio" : "Begin VIP intake"} <ArrowUpRight size={15} />
                  </Link>
                  <Link to="/pricing" className="text-white/55 hover:text-white text-sm font-mono uppercase tracking-wider" data-testid="voice-clone-pricing-link">
                    See Concierge plan →
                  </Link>
                </div>
              </div>

              {/* RIGHT: 3-tile presenter picker preview */}
              <div className="relative">
                <div className="rounded-3xl bg-black/40 border border-white/10 p-6 lg:p-8 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/45">Pick a voice</span>
                    <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#C99A2E] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C99A2E] animate-pulse" /> Live preview
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="rounded-2xl border border-white/10 p-4 text-center bg-white/[0.03]">
                      <div className="text-3xl mb-2">👩</div>
                      <div className="font-serif text-base">Mia</div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-white/40 mt-1">AU · UK</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 p-4 text-center bg-white/[0.03]">
                      <div className="text-3xl mb-2">👨</div>
                      <div className="font-serif text-base">Oliver</div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-white/40 mt-1">UK · RP</div>
                    </div>
                    <div className="rounded-2xl border-2 border-[#C99A2E] p-4 text-center bg-gradient-to-br from-[#C99A2E]/15 to-[#C99A2E]/5 relative">
                      <div className="absolute -top-2 right-2 text-[8px] font-mono uppercase tracking-wider bg-[#C99A2E] text-black px-1.5 py-0.5 rounded">You</div>
                      <Mic size={26} className="mx-auto mb-1 text-[#C99A2E]" />
                      <div className="font-serif text-base text-[#C99A2E]">My voice</div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#C99A2E]/70 mt-1">60s training</div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-black/40 border border-white/10 p-4 mb-4">
                    <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-white/40 mb-1.5">Sample script</div>
                    <p className="font-serif text-base text-white/85 italic">"Welcome to 12 Wolseley Road — six bedrooms, harbour views, and a kitchen that closes deals on its own."</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => preview({ id: 'mia', name: 'Mia', voice_id: presenters.find(p=>p.id==='mia')?.voice_id })}
                    disabled={!presenters.length || loadingId === 'mia'}
                    data-testid="voice-clone-demo-play"
                    className="w-full py-3.5 rounded-full bg-white/[0.05] border border-white/15 hover:bg-white/[0.1] inline-flex items-center justify-center gap-2 text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {loadingId === 'mia' ? <><Loader2 size={15} className="animate-spin" /> Mia's speaking…</> : <><Sparkles size={14} className="text-[#C99A2E]" /> Preview this sample with Mia's voice</>}
                  </button>
                  <p className="text-[10px] text-center text-white/35 mt-3 font-mono uppercase tracking-wider">Voice cloning · Concierge tier · ElevenLabs powered</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 text-center">
          <Link to={user ? "/app/studio" : "/register"} data-testid="presenters-bottom-cta" className="inline-block px-8 py-4 rounded-full bg-[#C99A2E] text-black font-medium hover:bg-[#DBC075]">
            {user ? "Use a presenter in Studio →" : "Create a free account →"}
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
