/* =========================================================
   Gymmy – service worker
   Caches the app so it opens offline once installed.
   Bump CACHE when you change any file so users get the update.
   ========================================================= */
const CACHE = 'gymmy-v2';

// Only './' for the page: hosts like Cloudflare redirect index.html to the
// folder URL, and a cached redirect breaks navigations served from the cache.
const APP_SHELL = [
  './',
  'css/styles.css',
  'js/data.js',
  'js/i18n.js',
  'js/timer.js',
  'js/app.js',
  'manifest.webmanifest',
  'assets/icons/icon.svg',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
];

const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// Serve from cache right away and refresh the cache in the background.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;
  if (!sameOrigin && !FONT_HOSTS.includes(url.hostname)) return;

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request, { ignoreSearch: sameOrigin });
      const network = fetch(request)
        .then((response) => {
          if ((response.ok && !response.redirected) || response.type === 'opaque') cache.put(request, response.clone());
          return response;
        })
        .catch(() => (request.mode === 'navigate' ? cache.match('./') : undefined));
      return cached || network;
    })
  );
});
