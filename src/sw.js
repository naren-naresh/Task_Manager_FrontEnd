import { precacheAndRoute } from 'workbox-precaching';

// 1. Let Workbox handle the pre-caching of your Vite assets automatically
// Vite will replace self.__WB_MANIFEST with the actual hashed files during build.
precacheAndRoute(self.__WB_MANIFEST);

const CACHE_NAME = 'taskflow-prod-v1';

// We can remove the manual 'install' event listener because 
// precacheAndRoute handles the installation and caching of the app shell for us.

// 2. Keep your manual activation logic to clean up old custom caches if needed
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim(); // Take control immediately
});

// 3. Keep your custom Fetch logic
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith('/api/')) return;
  if (url.hostname === 'localhost' && (url.pathname.includes('@vite/client') || url.search.includes('v='))) return;
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((networkResponse) => {
        if (networkResponse.ok && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

// 4. Your Push Listeners are now safe and will execute!
self.addEventListener('push', (event) => {
  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/logo192.png', // Ensure this points to a valid icon
      data: data.data || {}
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});