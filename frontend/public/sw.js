/* LensFlow + Lumen service worker
   v3 — network-first for API and HTML, cache-first for static assets, app-shell offline fallback.
*/
const SHELL_CACHE = 'shell-v3';
const STATIC_CACHE = 'static-v3';
const SHELL = [
  '/',
  '/lumen',
  '/manifest.json',
  '/lumen.webmanifest',
  '/lensflow-icon.svg',
  '/lumen-icon.svg',
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(SHELL_CACHE).then((c) => c.addAll(SHELL).catch(() => null))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => ![SHELL_CACHE, STATIC_CACHE].includes(k))
            .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Never cache API or auth-sensitive requests
  if (url.pathname.startsWith('/api/')) return;

  // App routes (HTML navigation) → network-first, offline fallback to shell
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    e.respondWith(
      fetch(req).catch(() =>
        caches.match(req).then((r) =>
          r || caches.match(url.pathname.startsWith('/lumen') ? '/lumen' : '/')
        )
      )
    );
    return;
  }

  // Static assets → cache-first, update in background
  if (req.destination === 'image' || req.destination === 'font' ||
      req.destination === 'style' || req.destination === 'script' ||
      url.pathname.match(/\.(svg|png|jpg|jpeg|webp|css|js|woff2?)$/)) {
    e.respondWith(
      caches.match(req).then((cached) => {
        const fetched = fetch(req).then((resp) => {
          if (resp.ok && resp.type === 'basic') {
            caches.open(STATIC_CACHE).then((c) => c.put(req, resp.clone()));
          }
          return resp;
        }).catch(() => cached);
        return cached || fetched;
      })
    );
  }
});
