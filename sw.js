// sw.js
const CACHE_NAME = 'chalo-bhanie-v21';
const PRECACHE_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './favicon.ico',
    './apple-touch-icon.png',
    './icon-192x192.png',
    './icon-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

async function fetchAndFixMimeType(request) {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
        const headers = new Headers(networkResponse.headers);
        headers.set('Content-Type', 'text/javascript');

        const blob = await networkResponse.blob();
        const fixedResponse = new Response(blob, {
            status: networkResponse.status,
            statusText: networkResponse.statusText,
            headers: headers
        });

        // Cache the fixed response
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, fixedResponse.clone());
        return fixedResponse;
    }
    return networkResponse;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // For TS/TSX files, always try network first to get the code,
  // fix its MIME type, cache the fix, and then serve it.
  // Fallback to cache if network fails.
  if (url.pathname.endsWith('.ts') || url.pathname.endsWith('.tsx')) {
    event.respondWith(
        fetchAndFixMimeType(request).catch(() => caches.match(request))
    );
    return;
  }

  // For all other requests, use a standard cache-first strategy.
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      });
    })
  );
});
