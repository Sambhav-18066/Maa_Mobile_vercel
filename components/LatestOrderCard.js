"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

function pretty(o){
  if(!o) return "";
  const p=[];
  if(o.status_timestamps?.PLACED) p.push(`Placed ${new Date(o.status_timestamps.PLACED).toLocaleTimeString()}`);
  if(o.status_timestamps?.APPROVED) p.push("Approved");
  if(o.status_timestamps?.OUT_FOR_DELIVERY) p.push("Out for delivery");
  if(o.eta) p.push(`ETA ${new Date(o.eta).toLocaleTimeString()}`);
  if(o.status==="DELIVERED") p.push("Delivered");
  return p.join(" → ");
}

export default function LatestOrderCard(){
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const phone = typeof window!=="undefined" ? (localStorage.getItem("maa_phone") || "") : "";
    if(!phone){ setLoading(false); return; }
    fetch("/api/orders/byPhone", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ phone })})
      .then(r=>r.json()).then(j=>{
        setOrder((j.orders||[])[0]||null);
      }).finally(()=>setLoading(false));
  }, []);

  if(loading) return <div className="skeleton" style={{height:88, borderRadius:12}}/>;
  if(!order) return null;
  return (
    <div style={{border:"1px solid #eee", borderRadius:12, padding:12, margin:"12px 0"}}>
      <div style={{display:"flex", justifyContent:"space-between", gap:8}}>
        <div>
          <div style={{fontWeight:800}}>Recent Order {order.id}</div>
          <div className="small">{pretty(order)}</div>
        </div>
        <Link href="/myorders" className="btn">Track</Link>
      </div>
    </div>
  );
}
