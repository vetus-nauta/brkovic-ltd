const CACHE_NAME = "ship-cashbox-shell-v20260601-01";
const SHELL = [
  "./index.html",
  "./assets/app.css?v=20260601-cashbox-audit-01",
  "./assets/app.js?v=20260601-cashbox-audit-01",
  "./manifest.webmanifest",
  "../js/config.js",
  "../js/language.js?v=20260531-language-menu-01",
  "../js/seo.js?v=20260531-clarity-01",
  "../js/main.js?v=20260531-google-auth-01",
  "../js/navdesk.js?v=20260531-tool-consent-01",
  "../lang/ru.json",
  "../lang/en.json",
  "../lang/de.json",
  "../lang/it.json",
  "../lang/es.json",
  "../lang/sr.json",
  "../lang/zh.json",
  "../css/variables.css",
  "../css/main.css?v=20260531-google-auth-01",
  "../css/responsive.css?v=20260531-google-auth-01",
  "../css/navdesk.css?v=20260531-shipcashbox-card-01",
  "../brand/logo-header-inline-light.png",
  "../brand/logo-header-mobile.png",
  "../favicons/favicon-clean.png?v=2",
  "../favicons/apple-touch-icon-clean.png?v=2",
  "../favicons/android-chrome-192x192.png",
  "../favicons/android-chrome-512x512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isRuntimeShell = isSameOrigin && (
    request.mode === "navigate"
    || request.destination === "document"
    || request.destination === "script"
    || request.destination === "style"
  );

  if (isRuntimeShell) {
    event.respondWith(
      fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
        return response;
      }).catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        return caches.match("./index.html");
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
        return response;
      }).catch(() => caches.match("./index.html"));
    })
  );
});
