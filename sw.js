/* G-RIEL IT Garden — Service Worker
 * Progressive enhancement only: the existing site remains the source of truth.
 */
const CACHE_VERSION = "griel-pwa-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./about.html",
  "./css/style.css",
  "./js/navigation.js",
  "./manifest.webmanifest",
  "./assets/images/logo.png",
  "./assets/images/pwa-icon-192.png",
  "./assets/images/pwa-icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => !key.startsWith(CACHE_VERSION))
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never interfere with external services/CDNs.
  if (url.origin !== self.location.origin) return;

  // Do not aggressively cache PDFs.
  if (url.pathname.toLowerCase().endsWith(".pdf")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  // Same-origin static/runtime resources: cache first, then update in background.
  event.respondWith(cacheFirstWithRevalidate(request));
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || caches.match("./index.html");
  }
}

async function cacheFirstWithRevalidate(request) {
  const cached = await caches.match(request);

  const networkUpdate = fetch(request)
    .then(response => {
      if (response.ok) {
        caches.open(RUNTIME_CACHE)
          .then(cache => cache.put(request, response.clone()));
      }
      return response;
    })
    .catch(() => null);

  return cached || await networkUpdate || Response.error();
}
