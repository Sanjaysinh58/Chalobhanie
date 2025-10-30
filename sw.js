const CACHE_NAME = 'chalo-bhanie-cache-v14';
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
        // Use addAll for atomic caching of essential assets
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
      .catch(error => {
        console.error('Failed to cache resources during install:', error);
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
  if (event.request.method !== 'GET') {
    return;
  }

  // Use a cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // If we have a response in the cache, return it
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise, fetch from the network
        return fetch(event.request).then(networkResponse => {
          // If the network request is successful, clone it and cache it.
          if (networkResponse && networkResponse.ok) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }
          // Return the response from the network
          return networkResponse;
        });
      })
  );
});