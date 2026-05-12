/* PWA bootstrap — registers SW once and swaps manifest/theme based on path. */

const linkOf = (rel) => document.querySelector(`link[rel="${rel}"]`);

function ensureLink(rel, attrs = {}) {
  let l = linkOf(rel);
  if (!l) {
    l = document.createElement("link");
    l.rel = rel;
    document.head.appendChild(l);
  }
  Object.entries(attrs).forEach(([k, v]) => l.setAttribute(k, v));
  return l;
}

function ensureMeta(name, content) {
  let m = document.querySelector(`meta[name="${name}"]`);
  if (!m) { m = document.createElement("meta"); m.name = name; document.head.appendChild(m); }
  m.content = content;
}

function applyBrand() {
  const isLumen = window.location.pathname.startsWith("/lumen");
  if (isLumen) {
    ensureLink("manifest", { href: "/lumen.webmanifest" });
    ensureLink("icon", { href: "/lumen-icon.svg", type: "image/svg+xml" });
    ensureLink("apple-touch-icon", { href: "/lumen-icon.svg" });
    ensureMeta("theme-color", "#FF6B6B");
    ensureMeta("apple-mobile-web-app-title", "Lumen");
    document.title = "Lumen — Record. Read. Send love.";
  } else {
    ensureLink("manifest", { href: "/manifest.json" });
    ensureLink("icon", { href: "/lensflow-icon.svg", type: "image/svg+xml" });
    ensureLink("apple-touch-icon", { href: "/lensflow-icon.svg" });
    ensureMeta("theme-color", "#0A0A0A");
    ensureMeta("apple-mobile-web-app-title", "LensFlow");
    document.title = "LensFlow — AI Real Estate Media Studio";
  }
  ensureMeta("apple-mobile-web-app-capable", "yes");
  ensureMeta("mobile-web-app-capable", "yes");
  ensureMeta("apple-mobile-web-app-status-bar-style", "black-translucent");
}

export function bootPWA() {
  applyBrand();

  // Re-apply brand on SPA navigation (react-router pushState)
  const wrap = (m) => {
    const orig = history[m];
    history[m] = function (...args) {
      const r = orig.apply(this, args);
      window.dispatchEvent(new Event("locationchange"));
      return r;
    };
  };
  wrap("pushState"); wrap("replaceState");
  window.addEventListener("popstate", applyBrand);
  window.addEventListener("locationchange", applyBrand);

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    });
  }
}
