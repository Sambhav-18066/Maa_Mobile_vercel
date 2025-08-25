
self.addEventListener("install", e=>{ self.skipWaiting(); });
self.addEventListener("activate", e=>{ self.clients.claim(); });
self.addEventListener("fetch", (e)=>{
  if(e.request.method!=="GET") return;
  e.respondWith(
    caches.open("mm-cache-v1").then(async cache=>{
      const cached = await cache.match(e.request);
      const fetchP = fetch(e.request).then(res=>{ cache.put(e.request, res.clone()); return res; }).catch(()=>cached);
      return cached || fetchP;
    })
  );
});
