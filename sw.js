const CACHE_NAME = 'chalo-bhanie-cache-v11';
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

  // This function handles the core logic of fixing the MIME type for .tsx files.
  // It takes a Response object and returns a new one with the correct header if needed.
  const handleTsxResponse = (response) => {
    // If the response is invalid or not for a .tsx file, return it as is.
    if (!response || response.status !== 200 || !event.request.url.endsWith('.tsx')) {
      return response;
    }

    // It's a valid response for a .tsx file. We need to recreate it with the
    // correct Content-Type header for the browser to execute it.
    return response.text().then(text => {
      const headers = new Headers(response.headers);
      headers.set('Content-Type', 'text/javascript');
      return new Response(text, { status: response.status, statusText: response.statusText, headers });
    });
  };

  // Use a standard cache-first strategy.
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // If we have a cached response, process it and return.
        if (cachedResponse) {
          return handleTsxResponse(cachedResponse);
        }

        // If not in cache, fetch from the network.
        return fetch(event.request).then(networkResponse => {
          // Cache the original, unmodified network response for future requests.
          // Don't cache opaque responses (e.g. from CDNs with no CORS).
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          
          // Process the network response before returning it to the browser.
          return handleTsxResponse(networkResponse);
        });
      })
      .catch(error => {
        console.error("Fetch failed:", error);
        // Fallback for navigation requests could be the root page
        if (event.request.mode === 'navigate') {
          return caches.match('./');
        }
        // For other assets, just let the browser handle the error.
        return new Response('Network error', {
          status: 408,
          headers: { 'Content-Type': 'text/plain' },
        });
      })
  );
});
