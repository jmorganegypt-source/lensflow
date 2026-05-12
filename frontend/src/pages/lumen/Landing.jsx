import React from "react";
import { Link } from "react-router-dom";
import LumenNav from "./_Nav";
import { motion } from "framer-motion";
import { ArrowRight, Play, Heart, Send, Music, Sparkles, Camera } from "lucide-react";

const photos = [
  { url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=500&q=80", rot: -4, top: "10%", left: "5%" },
  { url: "https://images.unsplash.com/photo-1543269664-7eef42226a21?w=500&q=80", rot: 3, top: "30%", right: "8%" },
  { url: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500&q=80", rot: -2, bottom: "10%", left: "12%" },
  { url: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=500&q=80", rot: 5, bottom: "25%", right: "5%" },
];

const occasions = [
  { id: "birthday", label: "Happy Birthday", emoji: "🎂", color: "#FFD166" },
  { id: "anniversary", label: "Anniversary", emoji: "💞", color: "#FF6B6B" },
  { id: "sorry", label: "I'm Sorry", emoji: "🤍", color: "#D5C6F8" },
  { id: "thank_you", label: "Thank You", emoji: "🙏", color: "#B8F2D8" },
  { id: "miss_you", label: "Miss You", emoji: "✨", color: "#FFD166" },
  { id: "i_love_you", label: "I Love You", emoji: "💌", color: "#FF6B6B" },
  { id: "congrats", label: "Congrats", emoji: "🎉", color: "#FFD166" },
  { id: "just_because", label: "Just Because", emoji: "🌈", color: "#D5C6F8" },
];

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-80px" }, transition: { duration: 0.6 } };

export default function LumenLanding() {
  return (
    <div className="lumen-root" data-testid="lumen-landing">
      <LumenNav />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="lumen-blob" style={{ background: "#FFD166", width: 400, height: 400, top: -100, left: -100 }} />
        <div className="lumen-blob" style={{ background: "#FF6B6B", width: 500, height: 500, top: 100, right: -150 }} />

        <div className="relative max-w-7xl mx-auto px-5 lg:px-8 pt-16 pb-24 lg:pt-24 lg:pb-32 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 relative z-10">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-md rounded-full px-4 py-1.5 mb-6 shadow-sm" data-testid="hero-badge">
                <span className="text-[#FF6B6B] text-base">💌</span>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#1A1A2E]/70">A video message to someone you love</span>
              </div>
              <h1 className="lumen-display text-5xl sm:text-6xl lg:text-7xl leading-[0.95] mb-6">
                Record. Read. <span className="text-[#FF6B6B]">Send love</span>.
              </h1>
              <p className="text-lg sm:text-xl text-[#5C5C7A] max-w-xl mb-8 leading-relaxed">
                Tell Lumen what you want to say. We write the words. You hit record. They get a beautiful 60-second video — in minutes, not hours.
              </p>
              <div className="flex flex-wrap gap-3 mb-10">
                <Link to="/lumen/register" data-testid="hero-cta" className="lumen-btn-primary inline-flex items-center gap-2 text-base">
                  Try 7 days free <ArrowRight size={18} />
                </Link>
                <a href="#how" className="lumen-btn-ghost inline-flex items-center gap-2 text-base">
                  <Play size={16} className="text-[#FF6B6B]" /> See how it works
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-[#5C5C7A]">
                <div className="flex -space-x-2">
                  {["https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80","https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80","https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80","https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80"].map((u,i) => (
                    <img key={i} src={u} alt="" className="w-9 h-9 rounded-full border-2 border-white object-cover" />
                  ))}
                </div>
                <span><span className="font-semibold text-[#1A1A2E]">12,400+</span> moments sent this month</span>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-5 relative h-[500px] hidden lg:block">
            {photos.map((p, i) => (
              <div key={i} className="lumen-photo absolute w-52 h-64" style={{ "--rot": `${p.rot}deg`, top: p.top, left: p.left, right: p.right, bottom: p.bottom }}>
                <img src={p.url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            <div className="lumen-sticker bg-[#FFD166]" style={{ top: "20%", right: "30%" }}>🎂</div>
            <div className="lumen-sticker bg-[#FF6B6B] text-white" style={{ bottom: "20%", left: "8%" }}>💌</div>
            <div className="lumen-sticker bg-[#D5C6F8]" style={{ top: "5%", right: "5%" }}>✨</div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — 3 steps */}
      <section id="how" className="relative py-24 px-5 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-16">
            <div className="lumen-hand text-3xl text-[#FF6B6B] mb-2">three easy steps</div>
            <h2 className="lumen-display text-4xl sm:text-5xl lg:text-6xl">How Lumen works</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: 1, Icon: Sparkles, t: "Record", s: "Pick an occasion. We write the perfect script. You're never lost for words.", color: "#FFD166" },
              { n: 2, Icon: Camera, t: "Read", s: "Auto-scrolling teleprompter. Pick a look, music & a backdrop. Hit record.", color: "#FF6B6B" },
              { n: 3, Icon: Send, t: "Send", s: "Get a private link. Text it, email it, drop it in their DMs. They'll cry happy.", color: "#D5C6F8" },
            ].map((step, i) => (
              <motion.div {...fadeUp} transition={{ duration: 0.6, delay: i * 0.1 }} key={step.n} data-testid={`step-${step.n}`} className="lumen-card p-8 relative">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ background: step.color }}>
                  <step.Icon size={26} className="text-[#1A1A2E]" />
                </div>
                <div className="lumen-hand text-2xl text-[#FF6B6B] mb-1">Step {step.n}</div>
                <h3 className="lumen-display text-3xl mb-2">{step.t}</h3>
                <p className="text-[#5C5C7A] leading-relaxed">{step.s}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* OCCASIONS */}
      <section id="occasions" className="py-24 px-5 lg:px-8 bg-gradient-to-b from-transparent to-[#FFE3D8]/60">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <div className="lumen-hand text-3xl text-[#FF6B6B] mb-2">say something real</div>
            <h2 className="lumen-display text-4xl sm:text-5xl lg:text-6xl mb-4">For every moment that matters</h2>
            <p className="text-lg text-[#5C5C7A] max-w-2xl mx-auto">Birthday, sorry, thank-you, miss-you — pick the moment and Lumen drafts the words.</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {occasions.map((o, i) => (
              <motion.div {...fadeUp} transition={{ duration: 0.4, delay: i * 0.05 }} key={o.id} data-testid={`occ-${o.id}`} className="lumen-card p-6 text-center cursor-pointer hover:scale-[1.03] transition-transform">
                <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-3" style={{ background: o.color }}>{o.emoji}</div>
                <div className="font-semibold text-[#1A1A2E]">{o.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURE STRIP */}
      <section className="py-20 px-5 lg:px-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-5">
          {[
            { Icon: Sparkles, t: "AI writes for you", s: "GPT-5.2 drafts a heartfelt message in seconds." },
            { Icon: Camera, t: "Looks & filters", s: "Golden glow, vintage film, dreamy bloom — pick a vibe." },
            { Icon: Music, t: "Music & backdrops", s: "Acoustic, lofi, fireworks — add a backdrop too." },
            { Icon: Heart, t: "Real voices", s: "Optional AI narration in 4 honest voices." },
          ].map((f, i) => (
            <motion.div {...fadeUp} transition={{ duration: 0.4, delay: i * 0.06 }} key={i} data-testid={`feature-${i}`} className="text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4">
                <f.Icon size={24} className="text-[#FF6B6B]" />
              </div>
              <h4 className="lumen-display text-xl mb-2">{f.t}</h4>
              <p className="text-sm text-[#5C5C7A]">{f.s}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 px-5 lg:px-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-5">
          {[
            { q: "Made my mum cry happy tears 5 mins after I made it. Worth every cent.", n: "Maya · 19", color: "#FFD166" },
            { q: "I'm not a 'video person' but Lumen made me look like a poet.", n: "Theo · 22", color: "#FF6B6B" },
            { q: "Sent my best friend a 'just because' on a Tuesday. We're closer than ever.", n: "Indie · 26", color: "#D5C6F8" },
          ].map((t, i) => (
            <motion.div {...fadeUp} transition={{ delay: i * 0.08 }} key={i} data-testid={`test-${i}`} className="lumen-card p-7">
              <div className="text-3xl mb-3" style={{ color: t.color }}>★ ★ ★ ★ ★</div>
              <p className="lumen-display text-xl leading-snug mb-5">"{t.q}"</p>
              <p className="text-sm text-[#5C5C7A] font-medium">{t.n}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-24 px-5 lg:px-8 overflow-hidden">
        <div className="lumen-blob" style={{ background: "#FFD166", width: 400, height: 400, bottom: -100, left: -100 }} />
        <div className="lumen-blob" style={{ background: "#FF6B6B", width: 500, height: 500, top: -150, right: -150 }} />
        <motion.div {...fadeUp} className="relative max-w-2xl mx-auto text-center">
          <h2 className="lumen-display text-5xl sm:text-6xl lg:text-7xl mb-6 leading-[0.95]">Say it before<br /><span className="text-[#FF6B6B]">tomorrow</span>.</h2>
          <p className="text-xl text-[#5C5C7A] mb-8">7 days free, then 10 minutes a month on the house. Pay only if you fall in love.</p>
          <Link to="/lumen/register" data-testid="final-cta" className="lumen-btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
            Start your free week <ArrowRight size={20} />
          </Link>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-5 text-center text-sm text-[#5C5C7A] border-t border-black/[0.04]">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#FF6B6B] to-[#FFD166]" />
          <span className="lumen-display text-xl text-[#1A1A2E]">Lumen</span>
        </div>
        <p>© 2026 Lumen. Made with 💞 worldwide.</p>
      </footer>
    </div>
  );
}
