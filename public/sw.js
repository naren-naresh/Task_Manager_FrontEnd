const CACHE_NAME = 'taskflow-prod-v1';
// List all your core UI assets here
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  // Vite assets are hashed, but we can catch them in the fetch listener
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching App Shell');
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. BYPASS API CALLS: Let the syncManager/Redux handle data.
  // This allows offline CRUD to work via IndexedDB[cite: 71, 72].
  if (url.pathname.startsWith('/api/')) return;

  if (
    url.hostname === 'localhost' && 
    (url.pathname.includes('@vite/client') || url.search.includes('v='))
  ) {
    return;
  }

  // 2. IGNORE NON-HTTP: Prevents chrome-extension errors
  if (!event.request.url.startsWith('http')) return;

  // 3. STALE-WHILE-REVALIDATE for Static Assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((networkResponse) => {
        // Cache new static assets (JS/CSS/Images) on the fly
        if (networkResponse.ok && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // If everything fails (offline), return index.html for SPA routes
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

self.addEventListener('push', (event) => {
  const data = event.data.json();

  self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon || '/icon.png',
    data: data.data || {}
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});