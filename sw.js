// ===== Service Worker (sw.js) =====
const CACHE_NAME = 'aailapasa-v1.2';
const OFFLINE_URL = '/offline.html'; // Make sure this file exists

// Consider adding more core assets or dynamic caching
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add other critical assets like fonts:
  // '/fonts/your-font.woff2'
];

// ===== INSTALL EVENT =====
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()) // Force activate new SW immediately
      .catch(err => console.error('Cache addAll error:', err))
  );
});

// ===== ACTIVATE EVENT =====
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.map(cache => {
        if (cache !== CACHE_NAME) {
          console.log('Deleting old cache:', cache);
          return caches.delete(cache);
        }
      })
    ).then(() => self.clients.claim())) // Take control of all clients
  );
});

// ===== FETCH EVENT =====
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and non-http(s) requests
  if (event.request.method !== 'GET' || 
      !event.request.url.startsWith('http')) {
    return;
  }

  // For API requests or non-cacheable resources, use network-only
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('chrome-extension')) {
    return fetch(event.request);
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response if available
        if (cachedResponse) return cachedResponse;

        return fetch(event.request)
          .then(networkResponse => {
            // Check if valid response
            if (!networkResponse.ok) return networkResponse;

            // Cache successful responses (except for API calls)
            if (!event.request.url.includes('/api/')) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseToCache));
            }

            return networkResponse;
          })
          .catch(async () => {
            // Offline fallback for HTML
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match(OFFLINE_URL) || 
                new Response('<h1>Offline</h1><p>You are offline.</p>', {
                  headers: { 'Content-Type': 'text/html' }
                });
            }
            // Return placeholder for images or other assets if needed
          });
      })
  );
});

// ===== PUSH NOTIFICATIONS =====
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data?.json() || {};
  } catch (e) {
    data = { title: 'New message', body: 'You have a new notification' };
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'New message', {
      body: data.body || 'You have a new notification',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png', // Add a badge icon
      data: { url: data.url || '/' } // Add click action URL
    })
  );
});

// ===== NOTIFICATION CLICK =====
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});
