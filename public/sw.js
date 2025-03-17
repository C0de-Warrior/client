const CACHE_NAME = 'my-pwa-cache-v1';
const API_CACHE = 'api-cache-v1';

const STATIC_ASSETS = [
  '/',         // App shell (index.html)
  '/index.html',
  '/static/js/bundle.js',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/css/main.css'
  // Add other static assets as needed
];

// Install event – Pre-cache static assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
  );
});

// Activate event – Clean up old caches and proactively cache API data
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all([
        ...cacheNames.map(name => {
          if (name !== CACHE_NAME && name !== API_CACHE) {
            console.log('[Service Worker] Removing old cache:', name);
            return caches.delete(name);
          }
        }),
        // Proactively cache API data
        caches.open(API_CACHE).then(cache => {
          console.log('[Service Worker] Proactively caching API data');
          return fetch('/submissions') // Assuming your API endpoint is '/submissions'
            .then(response => {
              if (response.ok) {
                return cache.put('/submissions', response.clone()); // Use the API endpoint as the cache key
              } else {
                console.warn('[Service Worker] Failed to proactively cache API data:', response.status);
              }
            })
            .catch(error => {
              console.error('[Service Worker] Error proactively caching API data:', error);
            });
        })
      ]);
    })
  );
});

// Fetch event – Return a valid Response in every branch
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith((async () => {
    // For navigation requests, serve index.html from cache if network fails
    if (event.request.mode === 'navigate') {
      try {
        const networkResponse = await fetch(event.request);
        return networkResponse;
      } catch (error) {
        const cachedShell = await caches.match('/index.html');
        if (cachedShell) {
          return cachedShell;
        }
        return new Response(
          '<h1>Offline</h1><p>The app is offline and no cached shell is available.</p>',
          { headers: { 'Content-Type': 'text/html' } }
        );
      }
    }

    // For API requests (e.g. requests containing '/submissions')
    if (event.request.url.includes('/submissions')) {
      const cache = await caches.open(API_CACHE);
      try {
        const networkResponse = await fetch(event.request);
        if (networkResponse && networkResponse.status === 200) {
          // Cache the successful network response
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // Return an empty array as fallback so that the client gets valid JSON
        return new Response(JSON.stringify(), {
          headers: { 'Content-Type': 'application/json' },
          status: 200
        });
      }
    }

    // For all other GET requests, use a network-first strategy with fallback to static cache
    try {
      const networkResponse = await fetch(event.request);
      if (networkResponse && networkResponse.status === 200) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) return cachedResponse;
      return new Response('Offline and no cached resource', {
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  })());
});