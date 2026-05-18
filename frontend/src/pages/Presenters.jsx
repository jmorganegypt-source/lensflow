import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import MarketingNav from "../components/MarketingNav";
import Footer from "../components/Footer";
import api, { formatApiErrorDetail } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Play, Loader2, Pause } from "lucide-react";
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
          <p className="text-lg text-white/55 max-w-2xl">Four signature presenters, hand-tuned for prestige real estate across continents.</p>
          <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-white/45 font-mono">
            <span className="w-1.5 h-1.5 bg-[#C99A2E] rounded-full" /> Bring your own ElevenLabs voice IDs via backend env for instant cloning
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-10 pb-32">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6">
          {presenters.map((p) => (
            <div key={p.id} data-testid={`presenter-${p.id}`} className="group glass rounded-3xl overflow-hidden tracing-border">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="aspect-square md:aspect-auto relative">
                  <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a0a]/40 md:to-[#0a0a0a]" />
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
          ))}
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
