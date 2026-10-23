/* ===========================================================
   Abisal · Service Worker (offline, rutas relativas)
   - App: stale-while-revalidate
   - questions.json: network-first (recibe preguntas nuevas)
   Cambia CACHE_VERSION en cada despliegue de código.
   =========================================================== */
const CACHE_VERSION = 'abisal-v2.0.0';

const PRECACHE_URLS = [
  './',
  './index.html',
  './styles.css',
  './generator.js',
  './app.js',
  './questions.json',
  './manifest.json',
  './icons/icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('abisal-') && k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(req) {
  const cache = await caches.open(CACHE_VERSION);
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(req, { signal: ctrl.signal });
    clearTimeout(timer);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    const cached = await cache.match(req, { ignoreSearch: true });
    return cached || new Response('{"questions":[]}', { headers: { 'Content-Type': 'application/json' } });
  }
}

async function staleWhileRevalidate(event) {
  const req = event.request;
  const cache = await caches.open(CACHE_VERSION);
  const cached = await cache.match(req, { ignoreSearch: true });
  const network = fetch(req)
    .then((res) => { if (res && res.ok && res.type === 'basic') cache.put(req, res.clone()); return res; })
    .catch(() => null);

  if (cached) { event.waitUntil(network); return cached; }
  const fresh = await network;
  if (fresh) return fresh;
  if (req.mode === 'navigate') {
    const shell = await cache.match('./index.html');
    if (shell) return shell;
  }
  return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (!req.url.startsWith(self.registration.scope)) return;

  if (new URL(req.url).pathname.endsWith('/questions.json')) {
    event.respondWith(networkFirst(req));
    return;
  }
  event.respondWith(staleWhileRevalidate(event));
});
