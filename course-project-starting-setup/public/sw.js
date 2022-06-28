importScripts("/src/js/idb.js");
importScripts("/src/js/utility.js");

var CACHE_STATIC = "static-v2";
var STATIC_ASSETS = [
  "/",
  "/index.html",
  "/offline.html",
  "/src/js/app.js",
  "/src/js/material.min.js",
  "/src/js/feed.js",
  "/src/js/idb.js",
  "/src/css/app.css",
  "/src/css/feed.css",
  "/src/images/main-image.jpg",
  "https://fonts.googleapis.com/css?family=Roboto:400,700",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
  "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
];

function trimCache(cacheName, maxItems) {
  caches
    .open(cacheName)
    .then(function (cache) {
      return cache.keys().then(function (keys) {
        if (keys.length > maxItems) {
          cache.delete(keys[0]).then(trimCache(cacheName, maxItems));
        }
      });
    });
}

self.addEventListener("install", (event) => {
  console.log("[Service worker] installing service worker...", event);
  event.waitUntil(
    caches.open(CACHE_STATIC).then(function (cache) {
      console.log("[Service worker] Precaching app shell");
      cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("[Service worker] activating service worker...", event);
  event.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(
        keyList.map(function (key) {
          if (key !== CACHE_STATIC && key !== "dynamic") {
            console.log("[Service Worker] removing old caches", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

function isInArray(string, array) {
  var cachePath;
  if (string.indexOf(self.origin) === 0) {
    // request targets domain where we serve the page from (i.e. NOT a CDN)
    console.log("matched ", string);
    cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
  } else {
    cachePath = string; // store the full request (for CDNs)
  }
  return array.indexOf(cachePath) > -1;
}

// cache the network & dynamic caching strategy
self.addEventListener("fetch", (event) => {
  var url = "https://learnpwa-ee647-default-rtdb.firebaseio.com/posts.json";
  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(fetch(event.request).then(function (res) {
        var clonedRes = res.clone();
        clonedRes.json().then(function(data) {
          for (var key in data) {
            dbPromise.writeData('posts', data[key]);
          }
        });
        return res;
      })
    );
  } else if (isInArray(event.request.url, STATIC_ASSETS)) {
    event.respondWith(caches.match(event.request));
  } else {
    event.respondWith(
      caches.match(event.request).then(function (response) {
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then(function (res) {
              return caches.open("dynamic").then(function (cache) {
                // trimCache("dynamic", 3);
                cache.put(event.request.url, res.clone());
                return res;
              });
            })
            .catch(function (err) {
              console.log("error", err);
              return caches.open(CACHE_STATIC).then(function (cache) {
                if (event.request.headers.get("accept").includes("text/html")) {
                  return cache.match("/offline.html");
                }
              });
            });
        }
      })
    );
  }
});

// cache the network strategy
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

// first network strategy
// self.addEventListener("fetch", (event) => {
//   event.respondWith(
//     fetch(event.request)
//       .then(function(res) {
//         return caches.open("dynamic").then(function(cache) {
//           cache.put(event.request.url, res.clone());
//           return res;
//         })
//       }).catch(function(err) {
//         return caches.match(event.request);
//       })
//   );
// });

// network with caches strategy
// self.addEventListener("fetch", (event) => {
//   event.respondWith(
//     fetch(event.request).catch(function (err) {
//       return caches.match(event.request);
//     })
//   );
// });

// cache only strategy
// self.addEventListener("fetch", (event) => {
//   event.respondWith(
//     caches.match(event.request)
//   );
// });

// network only strategy
// self.addEventListener("fetch", (event) => {
//   event.respondWith(fetch(event.request));
// });
