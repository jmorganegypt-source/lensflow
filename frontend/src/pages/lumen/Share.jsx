import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import lumenApi from "../../lib/lumenApi";
import { Loader2, Play, Heart, Music as MusicIcon } from "lucide-react";

export default function LumenShare() {
  const { token } = useParams();
  const [moment, setMoment] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    lumenApi.get(`/share/${token}`).then(r => setMoment(r.data)).catch(e => setErr("Moment not found"));
  }, [token]);

  useEffect(() => {
    const prev = document.title;
    document.title = moment?.sender_name
      ? `${moment.sender_name} sent you a Lumen moment 💌`
      : "A Lumen moment for you 💌";
    return () => { document.title = prev; };
  }, [moment]);

  if (err) return (
    <div className="lumen-root min-h-screen flex items-center justify-center p-6" data-testid="lumen-share-error">
      <div className="lumen-card p-10 text-center max-w-md">
        <div className="text-5xl mb-3">💌</div>
        <h1 className="lumen-display text-3xl mb-2">Moment not found</h1>
        <p className="text-[#5C5C7A] mb-6">The link may have been deleted or never existed.</p>
        <Link to="/lumen" className="lumen-btn-primary inline-block">Make your own →</Link>
      </div>
    </div>
  );

  if (!moment) return (
    <div className="lumen-root min-h-screen flex items-center justify-center" data-testid="lumen-share-loading">
      <Loader2 className="animate-spin text-[#FF6B6B]" size={32} />
    </div>
  );

  return (
    <div className="lumen-root min-h-screen" data-testid="lumen-share-page">
      <div className="max-w-2xl mx-auto px-5 py-10">
        <div className="text-center mb-6">
          <div className="lumen-hand text-2xl text-[#FF6B6B]">a moment for you</div>
          <h1 className="lumen-display text-4xl lg:text-5xl mt-2">{moment.sender_name} sent you love.</h1>
          <p className="text-[#5C5C7A] mt-2 text-sm">Press play below — it's only a minute.</p>
        </div>

        <div className="lumen-card overflow-hidden">
          {moment.recording_url ? (
            <video src={moment.recording_url} controls playsInline className="w-full aspect-[9/16] bg-black object-cover" data-testid="lumen-share-video" />
          ) : (
            <div className="aspect-[9/16] bg-gradient-to-br from-[#FFE3D8] to-[#FFD166]/70 flex items-center justify-center p-10 text-center">
              <div>
                <Heart size={36} className="mx-auto text-[#FF6B6B] mb-3" />
                <p className="lumen-display text-2xl mb-4">{moment.script}</p>
                <p className="text-xs text-[#5C5C7A]">(No video yet — message preview)</p>
              </div>
            </div>
          )}
          <div className="p-6">
            <div className="flex items-center justify-between mb-3 text-xs uppercase tracking-widest font-semibold text-[#FF6B6B]">
              <span>For {moment.recipient_name}</span>
              <span>{moment.views} {moment.views === 1 ? "view" : "views"}</span>
            </div>
            <p className="lumen-display text-xl text-[#1A1A2E]/85 leading-snug">"{moment.script}"</p>
            {moment.music_id && moment.music_id !== "none" && (
              <p className="mt-4 text-xs text-[#9999B0] flex items-center gap-1.5"><MusicIcon size={12} /> Backed by {moment.music_id.replace("_", " ")}</p>
            )}
          </div>
        </div>

        {moment.watermark && (
          <div className="mt-8 text-center">
            <Link to="/lumen" className="inline-flex items-center gap-2 text-sm text-[#5C5C7A] hover:text-[#FF6B6B] transition-colors" data-testid="watermark">
              <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#FF6B6B] to-[#FFD166]" /> Made with <span className="font-semibold text-[#FF6B6B]">Lumen</span> · make your own →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
