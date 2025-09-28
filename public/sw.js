// public/sw.js - Service Worker بسيط للأداء
const CACHE_NAME = 'savio-v1';
const STATIC_ASSETS = [
  '/',
  '/store',
  '/women.webp',
  '/men.webp',
  '/master.webp',
  '/whitelogo.png',
  '/darklogo.png'
];

// Install - cache critical assets
self.addEventListener('install', (event) => {
  console.log('SW: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  console.log('SW: Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch - serve from cache first
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip API calls
  if (event.request.url.includes('/api/')) return;
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
          .then((fetchResponse) => {
            // Cache successful responses
            if (fetchResponse.ok) {
              const responseClone = fetchResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => cache.put(event.request, responseClone));
            }
            return fetchResponse;
          });
      })
      .catch(() => {
        // Return offline page for HTML requests
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return new Response(
            '<h1>Offline</h1><p>Please check your connection</p>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        }
      })
  );
});

console.log('SW: Loaded');