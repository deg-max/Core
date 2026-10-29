// The planner moved to ../aurix/. This replaces the old planner worker, clears its cache and steps aside.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.delete("planner-v1").then(() => self.registration.unregister()));
});
