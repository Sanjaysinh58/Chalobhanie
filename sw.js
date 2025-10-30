const CACHE_NAME = 'chalo-bhanie-cache-v17';

// Only cache the core app shell. Dynamic content like .tsx files will be cached on demand.
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './favicon.ico',
  './apple-touch-icon.png',
  './icon-192x192.png',
  './icon-512x512.png',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
      .catch(error => {
        console.error('Failed to cache app shell during install:', error);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // If we have a cached response, return it.
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise, fetch from the network.
      return fetch(event.request).then(networkResponse => {
        const url = new URL(event.request.url);

        // Check if it's a file that needs its MIME type fixed.
        if (url.pathname.endsWith('.ts') || url.pathname.endsWith('.tsx')) {
          // Clone the response to read its body.
          return networkResponse.text().then(body => {
            // Create the new, corrected response.
            const fixedResponse = new Response(body, {
              status: networkResponse.status,
              statusText: networkResponse.statusText,
              headers: { ...networkResponse.headers, 'Content-Type': 'text/javascript' }
            });

            // Cache the *fixed* response before returning it.
            const responseToCache = fixedResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });

            return fixedResponse;
          });
        } else {
          // For all other files, cache the original response if it's valid.
          if (networkResponse && networkResponse.ok) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        }
      }).catch(error => {
        console.error('Fetch failed for:', event.request.url, error);
        // You could return a fallback page here if you had one.
      });
    })
  );
});