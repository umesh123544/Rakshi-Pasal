// ===== Service Worker (sw.js) =====
// Cache name with versioning
const CACHE_NAME = 'aailapasa-v1.2';
const OFFLINE_URL = '/offline.html'; // Optional offline fallback

// Files to cache (update these paths to match your project)
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add other critical assets (fonts, JSON data, etc.)
];

// ===== INSTALL EVENT =====
// Caches core assets during installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.log('Cache addAll error:', err))
  );
});

// ===== ACTIVATE EVENT =====
// Cleans up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// ===== FETCH EVENT =====
// Serves cached files or falls back to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and chrome-extension
  if (event.request.method !== 'GET' || 
      event.request.url.startsWith('chrome-extension')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached file if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Clone request for network fetch
        return fetch(event.request)
          .then((networkResponse) => {
            // Check if valid response
            if (!networkResponse || 
                networkResponse.status !== 200 || 
                networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Cache successful responses
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          })
          .catch(() => {
            // Optional: Return offline page for HTML requests
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match(OFFLINE_URL);
            }
          });
      })
  );
});

// ===== PUSH NOTIFICATIONS (Optional) =====
self.addEventListener('push', (event) => {
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192x192.png'
    })
  );
});
