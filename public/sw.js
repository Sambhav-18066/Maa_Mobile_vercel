
const CACHE_NAME = "maa-cache-v1";
const OFFLINE_URL = "/offline.html";
const ASSETS = ["/", "/manifest.json", OFFLINE_URL];

self.addEventListener("install", (e)=>{
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e)=>{
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (e)=>{
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  e.respondWith((async ()=>{
    try {
      const res = await fetch(e.request);
      // cache simple GETs
      const cache = await caches.open(CACHE_NAME);
      cache.put(e.request, res.clone());
      return res;
    } catch (err) {
      // offline fallback
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(e.request);
      return cached || cache.match(OFFLINE_URL);
    }
  })());
});
