// Network first, so a published change shows on the next open; the cached copy is only
// used with no signal (or when the network takes longer than 3 seconds).
const CACHE = "aurix-v16";
const FILES = ["./", "index.html", "setup.html", "manifest.webmanifest", "apple-touch-icon.png", "icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.open(CACHE).then((cache) => {
      const fresh = fetch(e.request, { cache: "no-cache" }).then((res) => {
        if (res.ok) cache.put(e.request, res.clone());
        return res;
      });
      const slow = new Promise((resolve) => setTimeout(resolve, 3000))
        .then(() => cache.match(e.request))
        .then((cached) => cached || fresh);
      return Promise.race([fresh, slow]).catch(() =>
        cache.match(e.request).then((cached) => cached || Response.error())
      );
    })
  );
});
