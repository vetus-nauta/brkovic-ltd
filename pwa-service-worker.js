const CACHE_NAME = "brkovic-main-shell-v20260601-game-sso-01";
const SHELL_ASSETS = [
  "/",
  "/index.html",
  "/journal.html",
  "/navdesk.html",
  "/css/variables.css",
  "/css/main.css",
  "/css/responsive.css",
  "/js/config.js",
  "/js/language.js",
  "/js/main.js",
  "/site.webmanifest",
  "/favicons/android-chrome-192x192.png",
  "/favicons/android-chrome-512x512.png",
  "/favicons/apple-touch-icon-clean.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .catch(() => null)
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key !== CACHE_NAME && key.startsWith("brkovic-main-shell-"))
        .map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/admin-api-proxy.php") || url.pathname.startsWith("/forms/")) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        if (response.ok && shouldCache(url)) {
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => null);
        }
        return response;
      })
      .catch(() => caches.match(request).then((cached) => {
        if (cached) return cached;
        if (request.mode === "navigate") return caches.match("/index.html");
        return Response.error();
      }))
  );
});

function shouldCache(url) {
  return [
    "/",
    "/index.html",
    "/journal.html",
    "/navdesk.html",
    "/site.webmanifest"
  ].includes(url.pathname)
    || /\.(?:css|js|png|jpg|jpeg|svg|webp|woff2?)$/i.test(url.pathname);
}
