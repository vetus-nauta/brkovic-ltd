const CACHE_NAME = "ship-cashbox-shell-v20260603-62";
const SHELL = [
  "./index.html",
  "./assets/app.css?v=20260603-cashbox-dual-mode-25",
  "./assets/scan-engine.js?v=20260603-cashbox-dual-mode-25",
  "./assets/app.js?v=20260603-cashbox-dual-mode-25",
  "./assets/welcome-journal.webp",
  "./assets/welcome-crew.webp",
  "./assets/welcome-calculator.webp",
  "./manifest.webmanifest",
  "../js/config.js",
  "../js/language.js?v=20260531-language-menu-01",
  "../js/seo.js?v=20260531-clarity-01",
  "../js/main.js?v=20260602-auth-gate-cashbox-01",
  "../js/navdesk.js?v=20260601-runtime-i18n-01",
  "../lang/ru.json",
  "../lang/en.json",
  "../lang/de.json",
  "../lang/it.json",
  "../lang/es.json",
  "../lang/sr.json",
  "../lang/zh.json",
  "../css/variables.css",
  "../css/main.css?v=20260601-auth-modal-01",
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

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: "window", includeUncontrolled: true }))
      .then((clients) => Promise.all(clients.map((client) => {
        const url = new URL(client.url);
        if (url.origin === self.location.origin && url.pathname.includes("/ship-cashbox/")) {
          client.postMessage({ type: "SHIP_CASHBOX_SW_ACTIVATED", cache: CACHE_NAME });
        }
        return Promise.resolve();
      })))
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isDynamicRequest = isSameOrigin && (
    url.pathname.startsWith("/ship-cashbox/api/")
    || url.pathname.startsWith("/admin-api-proxy.php")
    || url.pathname.startsWith("/api/")
    || url.pathname.startsWith("/forms/")
  );

  if (isDynamicRequest) {
    event.respondWith(fetch(request, { cache: "no-store" }));
    return;
  }

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
