/* ==========================================================
   SERVICE WORKER — Chauffeur App
   Caches static assets for offline shell, network-first for API
   ========================================================== */
const CACHE_NAME = 'chauffeur-v1';

const PRECACHE = [
  '../index.html',
  '../Pages/book.html',
  '../Pages/payment.html',
  '../Pages/dashboard.html',
  '../assets/css/styles.css',
  '../assets/js/app.js',
  '../assets/js/carousel.js',
  '../assets/js/roller.js',
  '../assets/js/booking.js',
  '../assets/js/payment.js',
  '../assets/manifest.json',
  '../Data/Drivers.json',
  '../Data/Vehicles.json'
];

/* Install — pre-cache shell */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

/* Activate — purge old caches */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* Fetch — cache-first for static, network-first for API */
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Network-first for the distance worker API
  if (url.hostname.includes('freddy-b97.workers.dev')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache-first for everything else
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
