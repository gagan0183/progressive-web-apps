self.addEventListener("install", (event) => {
    console.log("[Service worker] installing service worker...", event);
    event.waitUtil(caches.open('static').then(function(cache) {
        console.log('[Service worker] Precaching app shell');
        cache.add('/src/js/app.js');
    }));
});

self.addEventListener("activate", (event) => {
  console.log("[Service worker] activating service worker...", event);
  return self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(caches.match(event.request).then(function(response) {
    if (response) {
        return response;
    } else {
        return fetch(event.request);
    }
  }).catch());
});