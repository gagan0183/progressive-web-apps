self.addEventListener("install", (event) => {
    console.log("[Service worker] installing service worker...", event);
});

self.addEventListener("activate", (event) => {
  console.log("[Service worker] activating service worker...", event);
  return self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  console.log("[Service worker] fetching something...", event);
  event.respondWith(fetch(event.request));
});