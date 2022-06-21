var CACHE_STATIC = 'static-v3';

self.addEventListener("install", (event) => {
  console.log("[Service worker] installing service worker...", event);
  event.waitUntil(
    caches.open(CACHE_STATIC).then(function (cache) {
      console.log("[Service worker] Precaching app shell");
      cache.addAll([
        "/",
        "/index.html",
        "/offline.html",
        "/src/js/app.js",
        "/src/js/material.min.js",
        "/src/js/feed.js",
        "/src/css/app.css",
        "/src/css/feed.css",
        "/src/images/main-image.jpg",
        "https://fonts.googleapis.com/css?family=Roboto:400,700",
        "https://fonts.googleapis.com/icon?family=Material+Icons",
        "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
      ]);
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("[Service worker] activating service worker...", event);
  event.waitUntil(caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== CACHE_STATIC && key !== "dynamic") {
          console.log("[Service Worker] removing old caches", key);
          return caches.delete(key);
        }
      }));
  }))
  return self.clients.claim();
});

// self.addEventListener("fetch", (event) => {
//   event.respondWith(
//     caches
//       .match(event.request)
//       .then(function (response) {
//         if (response) {
//           return response;
//         } else {
//           return fetch(event.request)
//             .then(function (res) {
//               return caches.open("dynamic").then(function (cache) {
//                 cache.put(event.request.url, res.clone());
//                 return res;
//               });
//             })
//             .catch(function (err) {
//               console.log("error", err);
//               return caches.open(CACHE_STATIC).then(function (cache) {
//                 return cache.match("/offline.html");
//               });
//             });
//         }
//       })
//       .catch()
//   );
// });

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request)
  );
});
