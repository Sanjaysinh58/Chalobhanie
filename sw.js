const CACHE_NAME = 'chalo-bhanie-cache-v7';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './favicon.ico',
  './apple-touch-icon.png',
  './icon-192x192.png',
  './icon-512x512.png',
  './index.tsx',
  './App.tsx',
  './types.ts',
  './services/geminiService.ts',
  './components/AboutPage.tsx',
  './components/BottomNavBar.tsx',
  './components/BooksPage.tsx',
  './components/ChapterDetailPage.tsx',
  './components/ChapterPage.tsx',
  './components/ChatBox.tsx',
  './components/ContactPage.tsx',
  './components/DisclaimerPage.tsx',
  './components/GoogleFormPage.tsx',
  './components/GradePage.tsx',
  './components/Header.tsx',
  './components/icons.tsx',
  './components/LoadingSpinner.tsx',
  './components/MathInput.tsx',
  './components/NotificationBell.tsx',
  './components/OldPapersPage.tsx',
  './components/PdfViewer.tsx',
  './components/PrivacyPolicyPage.tsx',
  './components/Sidebar.tsx',
  './components/SolutionDisplay.tsx',
  './components/SubjectPage.tsx',
  './components/VideoSolution.tsx',
  './components/WrittenSolution.tsx',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
];

// Install a service worker
self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Add all URLs to cache, but don't fail the install if one fetch fails
        const promises = urlsToCache.map(url => {
          return cache.add(url).catch(err => {
            console.warn(`Failed to cache ${url}:`, err);
          });
        });
        return Promise.all(promises);
      })
  );
});

// Cache and return requests
self.addEventListener('fetch', event => {
  // We only want to intercept GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Cache hit - return response
        if (cachedResponse) {
          return cachedResponse;
        }

        // Not in cache - fetch from network
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response.
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            const url = new URL(event.request.url);
            // For .ts/.tsx files, we need to fix the MIME type for the browser to treat them as modules.
            if (url.pathname.endsWith('.ts') || url.pathname.endsWith('.tsx')) {
              return networkResponse.text().then(text => {
                const headers = new Headers(networkResponse.headers);
                headers.set('Content-Type', 'text/javascript');
                
                const responseToCache = new Response(text, { headers });

                caches.open(CACHE_NAME).then(cache => {
                  cache.put(event.request, responseToCache.clone());
                });

                return responseToCache;
              });
            }

            // For all other assets, cache them as is.
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(error => {
          console.error('Fetching failed:', error);
          // You could return a custom offline page here if you had one
          throw error;
        });
      })
  );
});


// Update a service worker and remove old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
