const CACHE_NAME = 'bitminer-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Standard network-first cache strategy
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});