
"use client";
import { useEffect, useState } from "react";

function msToParts(ms){
  const total = Math.max(0, Math.floor(ms/1000));
  const h = Math.floor(total/3600);
  const m = Math.floor((total%3600)/60);
  const s = total%60;
  return [h,m,s].map(x=>String(x).padStart(2,'0'));
}

export default function DealsBanner(){
  // End at tonight 23:59:59 local time
  const getEnd = ()=>{
    const d = new Date(); d.setHours(23,59,59,999); return d;
  };
  const [end, setEnd] = useState(getEnd());
  const [now, setNow] = useState(new Date());
  useEffect(()=>{
    const t = setInterval(()=> setNow(new Date()), 1000);
    return ()=> clearInterval(t);
  }, []);
  useEffect(()=>{
    if(now > end) setEnd(getEnd()); // reset each midnight
  }, [now, end]);
  const [hh,mm,ss] = msToParts(end - now);

  return (
    <section style={{maxWidth:1200, margin:"16px auto", background:"#fff", borderRadius:8, border:"1px solid #eee", padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
      <div style={{display:"flex", alignItems:"center", gap:12}}>
        <div style={{fontWeight:800, fontSize:18}}>Deals of the Day</div>
        <div style={{fontFamily:"monospace", fontWeight:800, background:"#000", color:"#0f0", padding:"4px 8px", borderRadius:6}}>{hh}:{mm}:{ss}</div>
      </div>
      <div style={{display:"flex", gap:8}}>
        <a className="btn" href="#Electronics">Electronics</a>
        <a className="btn" href="#Home Appliances">Home Appliances</a>
      </div>
    </section>
  );
}
