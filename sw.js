// sw.js
const CACHE_NAME = 'chalo-bhanie-v20';
const PRECACHE_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './favicon.ico',
    './apple-touch-icon.png',
    './icon-192x192.png',
    './icon-512x512.png',
    './loader.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
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
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.endsWith('.ts') || url.pathname.endsWith('.tsx')) {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          if (!networkResponse.ok) {
            return caches.match(event.request).then(cachedResponse => {
                return cachedResponse || networkResponse;
            });
          }
          
          const responseToCache = networkResponse.clone();
          const headers = new Headers(networkResponse.headers);
          headers.set('Content-Type', 'text/javascript');
          
          const modifiedResponse = new Response(networkResponse.body, {
            status: networkResponse.status,
            statusText: networkResponse.statusText,
            headers: headers
          });
          
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          
          return modifiedResponse;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  } else {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          
          return fetch(event.request).then(
            networkResponse => {
              if(!networkResponse || networkResponse.status !== 200) { // Removed type basic check for more flexibility
                return networkResponse;
              }

              const responseToCache = networkResponse.clone();

              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });

              return networkResponse;
            }
          );
        })
    );
  }
});
