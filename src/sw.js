// Registra el evento de instalación del service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    // Crea una caché para almacenar los recursos
    caches.open('checador-movil-cache').then((cache) => {
      // Agrega los recursos a la caché
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

// Registra el evento de fetch del service worker
self.addEventListener('fetch', (event) => {
  if (event.request.url.startsWith('https://checador-movil-carquin-default-rtdb.firebaseio.com/')) {
    event.respondWith(
      caches.open('checador-movil-cache').then((cache) => {
        return cache.match('firebase-data').then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request).then((response) => {
            cache.put('firebase-data', response.clone());
            return response;
          });
        });
      }),
    );
  } else {
    event.respondWith(
      // Busca el recurso en la caché
      caches.match(event.request).then((response) => {
        // Si el recurso está en la caché, devuelve la respuesta
        if (response) {
          return response;
        }

        // Si no está en la caché, intenta obtenerlo desde la red
        return fetch(event.request).then((response) => {
          // Si la respuesta es válida, la agrega a la caché
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open('checador-movil-cache').then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        }).catch((error) => {
          // Si no hay conexión a Internet, devuelve la caché de la base de datos de Firebase
          if (event.request.url.includes('firebaseio.com')) {
            return caches.match('firebase-data').then((response) => {
              if (response) {
                return response;
              }
            });
          }
        });
      }),
    );
  }
});

// Registra el evento de activación del service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    // Elimina las cachés antiguas
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => cacheName !== 'checador-movil-cache' && cacheName !== 'firebase-data').map((cacheName) => caches.delete(cacheName)),
      );
    }),
  );
});

// Guarda el JSON en caché cuando se carga la página
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('firebaseio.com')) {
    event.respondWith(
      fetch(event.request).then((response) => {
        caches.open('checador-movil-cache').then((cache) => {
          cache.put('firebase-data', response);
        });
        return response;
      }),
    );
  }
});