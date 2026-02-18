const CACHE_NAME = 'chauffeur-app-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './book.html',
  './payment.html',
  '../assets/css/styles.css',
  '../assets/js/script.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
