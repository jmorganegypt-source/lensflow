import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Download, X } from "lucide-react";

/* Install-app A2HS prompt — listens for `beforeinstallprompt`, surfaces
   a branded card you can dismiss. Shows different styling for LensFlow vs Lumen. */
export default function PWAInstallPrompt() {
  const [evt, setEvt] = useState(null);
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem("pwa_dismissed") === "1");
  const loc = useLocation();
  const isLumen = loc.pathname.startsWith("/lumen");

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setEvt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    const onInstalled = () => { setEvt(null); setDismissed(true); };
    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);

  if (!evt || dismissed) return null;

  const install = async () => {
    evt.prompt();
    const r = await evt.userChoice;
    if (r.outcome === "accepted") setEvt(null);
  };

  const close = () => { setDismissed(true); sessionStorage.setItem("pwa_dismissed", "1"); };

  return (
    <div
      data-testid="pwa-install-prompt"
      style={{
        position: "fixed",
        bottom: "76px",
        left: "16px",
        right: "16px",
        maxWidth: 420,
        margin: "0 auto",
        zIndex: 60,
        borderRadius: 24,
        padding: "16px 18px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 18px 40px rgba(0,0,0,0.25)",
        background: isLumen ? "#fff" : "#0A0A0A",
        color: isLumen ? "#1A1A2E" : "#fff",
        border: isLumen ? "1px solid rgba(255,107,107,0.25)" : "1px solid rgba(201,154,46,0.3)",
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 14,
        background: isLumen ? "linear-gradient(135deg,#FF6B6B,#FFD166)" : "#C99A2E",
        color: isLumen ? "#fff" : "#000",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, fontFamily: isLumen ? "Fraunces, serif" : "Playfair Display, serif",
        fontSize: 22, fontWeight: 700,
      }}>L</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.2 }}>
          {isLumen ? "Install Lumen" : "Install LensFlow"}
        </div>
        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>
          {isLumen ? "Make moments faster — straight from your home screen." : "Open the studio with one tap on your phone."}
        </div>
      </div>
      <button
        onClick={install}
        data-testid="pwa-install-btn"
        style={{
          background: isLumen ? "#FF6B6B" : "#C99A2E",
          color: isLumen ? "#fff" : "#000",
          border: "none", borderRadius: 999, padding: "8px 14px",
          fontSize: 13, fontWeight: 600, cursor: "pointer",
          display: "inline-flex", alignItems: "center", gap: 6,
        }}
      >
        <Download size={14} /> Install
      </button>
      <button
        onClick={close}
        data-testid="pwa-dismiss-btn"
        aria-label="dismiss"
        style={{
          background: "transparent", border: "none",
          color: isLumen ? "#9999B0" : "rgba(255,255,255,0.6)",
          cursor: "pointer", padding: 4,
        }}
      ><X size={16}/></button>
    </div>
  );
}
