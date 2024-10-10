self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('checador-movil-cache').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/static/js/main.js',
        '/static/css/main.css',
        '/manifest.json',
        '/favicon.ico',
        '/apple-touch-icon.png',
        '/safari-pinned-tab.svg',
      ]);
    }),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('firebaseio.com')) {
    event.respondWith(
      caches.match('firebase-data').then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((response) => {
          const data = response.json();
          caches.open('checador-movil-cache').then((cache) => {
            cache.put('firebase-data', new Response(JSON.stringify(data)));
          });
          return response;
        });
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open('checador-movil-cache').then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        });
      })
    );
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => cacheName !== 'checador-movil-cache').map((cacheName) => caches.delete(cacheName)),
      );
    }),
  );
});