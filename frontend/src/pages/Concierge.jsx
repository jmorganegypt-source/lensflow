import React, { useState } from "react";
import useDocTitle from "../hooks/useDocTitle";
import MarketingNav from "../components/MarketingNav";
import Footer from "../components/Footer";
import api, { formatApiErrorDetail } from "../lib/api";
import { toast } from "sonner";
import { Send, Loader2, Phone, Mail, MapPin } from "lucide-react";

const CONCIERGE_BG = "https://customer-assets.emergentagent.com/job_luxury-video-studio-1/artifacts/105xaupo_concierge.jpg";

export default function Concierge() {
  useDocTitle("Done-for-You · LensFlow — $1,790 / listing");
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", property_address: "", message: "", package: "Done-for-You" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/concierge", form);
      setSent(true);
      toast.success("Request received. We'll be in touch within 24 hours.");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Submit failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white" data-testid="concierge-page">
      <MarketingNav />
      <section className="pt-40 pb-24 px-6 lg:px-10">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] font-mono text-[#C99A2E] mb-5">Concierge</div>
            <h1 className="font-serif text-6xl lg:text-7xl tracking-tighter leading-[0.95] mb-8">
              White-glove production.<br /><span className="italic text-[#C99A2E]">Done for you.</span>
            </h1>
            <p className="text-white/65 text-lg leading-relaxed mb-10">
              Our editors take your listing and return a broadcast-grade hero edit within 24 hours. Drone, dusk, lifestyle b-roll, captions and platform-ready exports — all done.
            </p>
            <div className="rounded-3xl overflow-hidden mb-8">
              <img src={CONCIERGE_BG} alt="LensFlow Pro Concierge" className="w-full h-auto" />
            </div>
            <div className="space-y-4 text-white/65 text-sm">
              <div className="flex items-center gap-3"><Mail size={16} className="text-[#C99A2E]" /> concierge@lensflow.ai</div>
              <div className="flex items-center gap-3"><Phone size={16} className="text-[#C99A2E]" /> +61 2 8000 1234 · +44 20 7946 0000</div>
              <div className="flex items-center gap-3"><MapPin size={16} className="text-[#C99A2E]" /> Sydney · London · Los Angeles</div>
            </div>
          </div>

          <div className="glass rounded-3xl p-8 lg:p-10 sticky top-28">
            {sent ? (
              <div className="text-center py-16" data-testid="concierge-success">
                <div className="font-serif text-3xl mb-3 text-[#C99A2E]">Received.</div>
                <p className="text-white/65">Our concierge team will reach out within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4" data-testid="concierge-form">
                <h3 className="font-serif text-3xl mb-2">Request a quote</h3>
                <p className="text-white/55 text-sm mb-6">Average response time: under 4 hours.</p>
                <div className="grid grid-cols-2 gap-3">
                  <input required placeholder="Full name" data-testid="concierge-name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#C99A2E] focus:outline-none" />
                  <input required type="email" placeholder="Email" data-testid="concierge-email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#C99A2E] focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Phone" data-testid="concierge-phone" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#C99A2E] focus:outline-none" />
                  <input placeholder="Agency" data-testid="concierge-company" value={form.company} onChange={(e) => setForm({...form, company: e.target.value})} className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#C99A2E] focus:outline-none" />
                </div>
                <input placeholder="Property address" data-testid="concierge-address" value={form.property_address} onChange={(e) => setForm({...form, property_address: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#C99A2E] focus:outline-none" />
                <select data-testid="concierge-package" value={form.package} onChange={(e) => setForm({...form, package: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#C99A2E] focus:outline-none">
                  <option value="Bespoke">Bespoke — Custom scope</option>
                  <option value="Hero Edit">Hero Edit — 60s broadcast cut · $1,490</option>
                  <option value="Full Suite">Full Suite — 5 platform cuts + captions · $2,490</option>
                  <option value="Quarterly">Quarterly retainer · $9,990/quarter</option>
                </select>
                <textarea required rows={4} placeholder="Tell us about the listing & timeline" data-testid="concierge-message" value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-[#C99A2E] focus:outline-none resize-none" />
                <button disabled={loading} data-testid="concierge-submit" className="w-full px-6 py-4 rounded-full bg-[#C99A2E] text-black font-medium hover:bg-[#DBC075] disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <>Send request <Send size={16} /></>}
                </button>
                <p className="text-xs text-white/35 text-center">We respect your data. No spam. Read our DPA.</p>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
