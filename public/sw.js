self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never intercept:
  // 1. Any request to the backend API (cross-origin or /api/ path)
  // 2. Any non-GET method (POST, PATCH, PUT, DELETE, etc.)
  //    — these should never go through a caching service worker
  const isApiCall =
    url.pathname.startsWith('/api/') ||
    url.hostname !== self.location.hostname;

  const isNonGet = event.request.method !== 'GET';

  if (isApiCall || isNonGet) {
    // Pass through directly — do not intercept with event.respondWith()
    return;
  }

  // For GET requests to same-origin static assets / navigation: pass through with fallback
  event.respondWith(
    fetch(event.request).catch((err) => {
      return caches.match(event.request).then((res) => res || Promise.reject(err));
    })
  );
});
