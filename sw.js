const CACHE_NAME = 'chalo-bhanie-cache-v13';
const urlsToCache = [
  './',
  './index.html',
  './loader.js',
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

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
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
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      // Try to find the response in the cache.
      return cache.match(event.request).then(cachedResponse => {
        // If a valid response is found in the cache, return it.
        if (cachedResponse) {
          return cachedResponse;
        }

        // If the response is not in the cache, fetch it from the network.
        return fetch(event.request).then(networkResponse => {
          // Don't cache unsuccessful responses.
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          
          // For .tsx files, we must create a new response with the correct MIME type.
          if (event.request.url.endsWith('.tsx')) {
            // Clone the response to read its body.
            return networkResponse.text().then(text => {
              const headers = new Headers(networkResponse.headers);
              headers.set('Content-Type', 'text/javascript');
              
              const fixedResponse = new Response(text, {
                status: networkResponse.status,
                statusText: networkResponse.statusText,
                headers: headers
              });
              
              // Cache the *fixed* response and then return it to the browser.
              // Clone again because a response body can only be used once.
              cache.put(event.request, fixedResponse.clone());
              return fixedResponse;
            });
          } else {
            // For all other files, cache the original response.
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          }
        });
      });
    })
  );
});