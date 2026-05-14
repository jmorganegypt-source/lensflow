import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, Sparkles, Captions, Wand2, Eye, UserCircle2, Home, Building, GraduationCap,
  Lightbulb, BookOpen, Megaphone, HeartHandshake, DollarSign, MessageCircle, Instagram,
  Youtube, Linkedin, Twitter, Facebook, Mail, Globe, MessageSquare, Music, ArrowRight,
  ArrowLeft, Check, Trophy,
} from "lucide-react";
import api, { formatApiErrorDetail } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

const TOOLS = [
  { id: "teleprompter",   label: "AI Teleprompter",      Icon: Mic, hint: "Perfect eye-contact recording" },
  { id: "ai_video",       label: "AI Listing Videos",    Icon: Sparkles, hint: "Mia or Oliver narrates", popular: true },
  { id: "captions",       label: "Automatic Subtitles",  Icon: Captions, hint: "9:16 · 16:9 · 1:1 ready" },
  { id: "video_editing",  label: "Smart Video Edit",     Icon: Wand2, hint: "AI cleans up pacing & audio" },
  { id: "eye_contact",    label: "Eye Contact Fix",      Icon: Eye, hint: "Look at the camera, always" },
  { id: "ai_avatar",      label: "Voice Clone (Elite)",  Icon: UserCircle2, hint: "Your voice, on autopilot" },
  { id: "glamour",        label: "Glamour Photos",       Icon: Wand2, hint: "iPhone → Magazine grade", popular: true },
];

const ROLES = [
  { id: "agent_solo",      label: "Independent Agent",    Icon: Home, primary: true },
  { id: "agency",          label: "Agency / Office",      Icon: Building },
  { id: "principal",       label: "Principal / Director", Icon: GraduationCap },
  { id: "marketing",       label: "Marketing Team",       Icon: Megaphone },
  { id: "business_dev",    label: "Business Development", Icon: Lightbulb },
  { id: "buyers_agent",    label: "Buyer's Agent",        Icon: HeartHandshake },
  { id: "investor",        label: "Investor / Developer", Icon: DollarSign },
  { id: "other",           label: "Something else",       Icon: MessageCircle },
];

const PLATFORMS = [
  { id: "instagram",  label: "Instagram",      Icon: Instagram, primary: true },
  { id: "tiktok",     label: "TikTok",         Icon: Music },
  { id: "youtube",    label: "YouTube",        Icon: Youtube },
  { id: "linkedin",   label: "LinkedIn",       Icon: Linkedin, primary: true },
  { id: "facebook",   label: "Facebook",       Icon: Facebook },
  { id: "twitter",    label: "Twitter / X",    Icon: Twitter },
  { id: "rea",        label: "REA · Domain",   Icon: Home, primary: true },
  { id: "email",      label: "Listing Emails", Icon: Mail },
  { id: "website",    label: "Agency Website", Icon: Globe },
  { id: "messages",   label: "SMS / WhatsApp", Icon: MessageSquare },
];

const PRESENTERS = [
  { id: "mia",    name: "Mia",    desc: "Warm AU-UK · Residential",  img: "/assets/property/mia-headshot.jpg",   op: "50% 18%" },
  { id: "oliver", name: "Oliver", desc: "British RP · Commercial",   img: "/assets/property/oliver-portrait.jpg",op: "50% 18%" },
  { id: "aria",   name: "Aria",   desc: "American · Modern",         img: "/assets/property/aria-portrait.jpg",  op: "50% 18%" },
  { id: "marcus", name: "Marcus", desc: "Continental · International",img: "/assets/property/marcus-portrait.jpg",op: "50% 18%" },
];

function Pip({ active, done }) {
  return <div className={`h-1 transition-all duration-300 rounded-full ${active ? "w-8 bg-[#C99A2E]" : done ? "w-2 bg-[#C99A2E]" : "w-2 bg-[#0F1A2E]/15"}`} />;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, fetchMe } = useAuth();
  const [step, setStep] = useState(0);
  const [tools, setTools] = useState(["teleprompter", "ai_video", "glamour"]);
  const [role, setRole] = useState("");
  const [presenter, setPresenter] = useState("mia");
  const [platforms, setPlatforms] = useState(["instagram", "linkedin", "rea"]);
  const [website, setWebsite] = useState("");
  const [handle, setHandle] = useState("");
  const [saving, setSaving] = useState(false);

  // If user has already completed onboarding, skip straight to dashboard.
  useEffect(() => {
    if (user && user.onboarded) navigate("/app/dashboard", { replace: true });
  }, [user, navigate]);

  const toggle = (arr, setter, id) => setter(arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]);

  const next = () => setStep(s => Math.min(s + 1, 4));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const finish = async () => {
    setSaving(true);
    try {
      await api.post("/auth/onboarding", { tools, role, presenter, platforms, website, handle });
      await fetchMe();
      toast.success("Welcome to LensFlow!");
      navigate("/app/dashboard");
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Could not save preferences");
    } finally { setSaving(false); }
  };

  const steps = [
    {
      title: "Your perfect toolkit.",
      sub: "Pick what you want to use today — change anytime.",
      content: (
        <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto" data-testid="step-tools">
          {TOOLS.map(t => {
            const on = tools.includes(t.id);
            return (
              <button key={t.id} onClick={() => toggle(tools, setTools, t.id)} data-testid={`tool-${t.id}`}
                className={`relative text-left p-5 rounded-2xl border-2 transition-all ${on ? "border-[#C99A2E] bg-[#C99A2E]/10" : "border-[#0F1A2E]/10 bg-white hover:border-[#0F1A2E]/25"}`}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${on ? "bg-[#C99A2E] text-[#0F1A2E]" : "bg-[#FAF7F2] text-[#0F1A2E]/55"}`}>
                  <t.Icon size={20} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-base text-[#0F1A2E]">{t.label}</span>
                  {t.popular && <span className="text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#C99A2E] text-black">Popular</span>}
                </div>
                <div className="text-xs text-[#0F1A2E]/55 mt-1">{t.hint}</div>
                {on && <Check size={14} className="absolute top-4 right-4 text-[#C99A2E]" />}
              </button>
            );
          })}
        </div>
      ),
    },
    {
      title: "Which describes you?",
      sub: "We'll tune your studio for the way you actually work.",
      content: (
        <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto" data-testid="step-role">
          {ROLES.map(r => {
            const on = role === r.id;
            return (
              <button key={r.id} onClick={() => setRole(r.id)} data-testid={`role-${r.id}`}
                className={`relative text-left p-5 rounded-2xl border-2 transition-all ${on ? "border-[#C99A2E] bg-[#C99A2E]/10" : "border-[#0F1A2E]/10 bg-white hover:border-[#0F1A2E]/25"}`}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${on ? "bg-[#C99A2E] text-[#0F1A2E]" : "bg-[#FAF7F2] text-[#0F1A2E]/55"}`}>
                  <r.Icon size={20} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-base text-[#0F1A2E]">{r.label}</span>
                  {r.primary && <span className="text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#0F1A2E] text-[#C99A2E]">Most agents</span>}
                </div>
                {on && <Check size={14} className="absolute top-4 right-4 text-[#C99A2E]" />}
              </button>
            );
          })}
        </div>
      ),
    },
    {
      title: "Pick your presenter.",
      sub: "Mia is most popular for residential. You can switch any time.",
      content: (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto" data-testid="step-presenter">
          {PRESENTERS.map(p => {
            const on = presenter === p.id;
            return (
              <button key={p.id} onClick={() => setPresenter(p.id)} data-testid={`presenter-${p.id}`}
                className={`relative rounded-2xl overflow-hidden border-2 transition-all ${on ? "border-[#C99A2E] ring-4 ring-[#C99A2E]/20" : "border-[#0F1A2E]/10 hover:border-[#0F1A2E]/25"}`}>
                <div className="aspect-[3/4] bg-[#0F1A2E]"><img src={p.img} alt={p.name} className="w-full h-full object-cover" style={{ objectPosition: p.op }} /></div>
                <div className="p-3 bg-white text-left">
                  <div className="font-serif text-lg text-[#0F1A2E]">{p.name}</div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#0F1A2E]/55 mt-0.5">{p.desc}</div>
                </div>
                {on && <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[#C99A2E] flex items-center justify-center"><Check size={14} className="text-[#0F1A2E]" /></div>}
              </button>
            );
          })}
        </div>
      ),
    },
    {
      title: "Where do you publish?",
      sub: "Pick channels so we auto-format every export — 9:16, 16:9, 1:1.",
      content: (
        <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto" data-testid="step-platforms">
          {PLATFORMS.map(p => {
            const on = platforms.includes(p.id);
            return (
              <button key={p.id} onClick={() => toggle(platforms, setPlatforms, p.id)} data-testid={`platform-${p.id}`}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${on ? "border-[#C99A2E] bg-[#C99A2E]/10" : "border-[#0F1A2E]/10 bg-white hover:border-[#0F1A2E]/25"}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${on ? "bg-[#C99A2E] text-[#0F1A2E]" : "bg-[#FAF7F2] text-[#0F1A2E]/55"}`}><p.Icon size={18} /></div>
                <span className="font-serif text-base text-[#0F1A2E] flex-1 text-left">{p.label}</span>
                {p.primary && <span className="text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#0F1A2E] text-[#C99A2E]">Recommended</span>}
                {on && <Check size={14} className="text-[#C99A2E]" />}
              </button>
            );
          })}
        </div>
      ),
    },
    {
      title: "Your brand identity.",
      sub: "Optional — we'll match your tone, fonts and watermark on every export.",
      content: (
        <div className="max-w-md mx-auto space-y-5" data-testid="step-brand">
          <div>
            <label className="text-xs font-mono uppercase tracking-[0.18em] text-[#0F1A2E]/55 mb-2 block">Your website</label>
            <input type="text" data-testid="brand-website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="raywhite.com.au" className="w-full px-5 py-4 rounded-2xl bg-white border-2 border-[#0F1A2E]/10 focus:border-[#C99A2E] focus:outline-none text-[#0F1A2E] text-base" />
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-[0.18em] text-[#0F1A2E]/55 mb-2 block">Instagram handle</label>
            <div className="flex">
              <span className="px-4 py-4 rounded-l-2xl bg-[#FAF7F2] border-2 border-r-0 border-[#0F1A2E]/10 text-[#0F1A2E]/55 font-mono">@</span>
              <input type="text" data-testid="brand-handle" value={handle} onChange={(e) => setHandle(e.target.value.replace(/^@/, ""))} placeholder="yourname" className="flex-1 px-5 py-4 rounded-r-2xl bg-white border-2 border-[#0F1A2E]/10 focus:border-[#C99A2E] focus:outline-none text-[#0F1A2E] text-base" />
            </div>
          </div>
          <div className="text-center mt-8 p-5 rounded-2xl bg-[#C99A2E]/10 border border-[#C99A2E]/30">
            <Trophy className="text-[#C99A2E] mx-auto mb-2" size={22} />
            <div className="font-serif text-lg text-[#0F1A2E]">You're all set.</div>
            <div className="text-sm text-[#0F1A2E]/65 mt-1">Your 7-day free trial starts now. Create your first listing in under 60 seconds.</div>
          </div>
        </div>
      ),
    },
  ];

  const current = steps[step];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#0F1A2E] flex flex-col" data-testid="onboarding-page">
      {/* Header */}
      <header className="px-6 lg:px-12 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#C99A2E] flex items-center justify-center">
            <span className="font-serif text-[#0F1A2E] text-xl leading-none pt-0.5">L</span>
          </div>
          <span className="font-serif text-2xl tracking-tight">LensFlow</span>
        </div>
        <button onClick={() => navigate("/app/dashboard")} data-testid="onboarding-skip" className="text-sm text-[#0F1A2E]/55 hover:text-[#0F1A2E] underline-offset-4 hover:underline">Skip for now</button>
      </header>

      {/* Progress pips */}
      <div className="flex items-center justify-center gap-2 mb-8" data-testid="onboarding-pips">
        {steps.map((_, i) => <Pip key={i} active={i === step} done={i < step} />)}
      </div>

      {/* Content */}
      <main className="flex-1 px-6 lg:px-12 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="text-center mb-10 max-w-2xl mx-auto">
              <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#C99A2E] mb-3">Step {step + 1} of {steps.length}</div>
              <h1 className="font-serif text-4xl lg:text-5xl tracking-tighter leading-[0.95] mb-4" data-testid="onboarding-title">{current.title}</h1>
              <p className="text-[#0F1A2E]/65 text-base">{current.sub}</p>
            </div>
            {current.content}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Fixed nav footer */}
      <footer className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-xl border-t border-[#0F1A2E]/8 px-6 lg:px-12 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <button onClick={back} disabled={step === 0} data-testid="onboarding-back" className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-[#0F1A2E]/70 hover:bg-[#0F1A2E]/5 disabled:opacity-30 disabled:cursor-not-allowed text-sm">
            <ArrowLeft size={14} /> Back
          </button>
          {step < steps.length - 1 ? (
            <button onClick={next} data-testid="onboarding-next" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#0F1A2E] text-white font-medium hover:bg-[#1A2944] text-sm">
              Continue <ArrowRight size={14} />
            </button>
          ) : (
            <button onClick={finish} disabled={saving} data-testid="onboarding-finish" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#C99A2E] text-[#0F1A2E] font-medium hover:bg-[#DBC075] disabled:opacity-60 text-sm shadow-lg">
              {saving ? "Setting up…" : "Open my studio"} <ArrowRight size={14} />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
