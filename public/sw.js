- self.addEventListener("install", (e)=>{ self.skipWaiting(); });
- self.addEventListener("activate", (e)=>{ self.clients.claim(); });
const CACHE_NAME = "mm-cache-v3"; // bump this

self.addEventListener("install", (e)=>{ self.skipWaiting(); });
self.addEventListener("activate", (e)=>{
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e)=>{
  if(e.request.method!=="GET") return;
  e.respondWith(
    caches.open(CACHE_NAME).then(async cache=>{
      const cached = await cache.match(e.request);
      const fetchP = fetch(e.request).then(res=>{ cache.put(e.request, res.clone()); return res; }).catch(()=>cached);
      return cached || fetchP;
    })
  );
});
