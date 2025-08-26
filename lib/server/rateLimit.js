const buckets = new Map();
export function rateLimit({ windowMs=60000, max=30 }={}){
  return function(ip){
    const now=Date.now();
    const b=buckets.get(ip)||{start:now,count:0};
    if(now-b.start>windowMs){ b.start=now; b.count=0; }
    b.count++; buckets.set(ip,b);
    return b.count<=max;
  }
}
