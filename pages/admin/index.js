
"use client";
import { useMemo, useState } from "react";

export default function Admin(){
  const [filter, setFilter] = useState("all");
  const orders = []; // hook up to your data source in your repo

  function isToday(ts){ try{ const d = new Date(ts); const t = new Date(); return d.toDateString() === t.toDateString(); }catch{return false;} }
  function applyPreset(o, type){
    const now = Date.now();
    if(type==="approve"){ o.status="approved"; o.approvedAt = new Date(now).toISOString(); o.eta = new Date(now + 2*60*60*1000).toISOString(); }
    if(type==="ofd"){ o.status="out_for_delivery"; o.outForDeliveryAt = new Date(now).toISOString(); o.eta = new Date(now + 60*60*1000).toISOString(); }
    return o;
  }
  function nudgeWA(o){
    const text = encodeURIComponent(`Update for order ${o.id}: Status - ${o.status}. ETA: ${o.eta ? new Date(o.eta).toLocaleTimeString() : "N/A"}`);
    window.open(`https://wa.me/${(o.phone||"").replace(/[^0-9]/g,"")}?text=${text}`, "_blank");
  }

  const filtered = useMemo(()=> (orders||[]).filter(o =>
    filter==="all" ? true :
    filter==="today" ? isToday(o.created_at||o.createdAt) :
    filter==="pending" ? ((o.status||"")==="placed") :
    (o.status||"")==="out_for_delivery"
  ), [orders, filter]);

  return (
    <main style={{maxWidth:900, margin:"16px auto", padding:"0 16px"}}>
      <h1>Admin</h1>
      <div className="toolbar" style={{display:"flex", gap:8, flexWrap:"wrap"}}>
        <select value={filter} onChange={e=>setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="today">Today</option>
          <option value="pending">Pending</option>
          <option value="ofd">Out for delivery</option>
        </select>
      </div>
      <ul style={{display:"grid", gap:10, listStyle:"none", padding:0, marginTop:12}}>
        {filtered.map(o => (
          <li key={o.id} style={{border:"1px solid #eee", borderRadius:10, padding:10}}>
            <div style={{display:"flex", justifyContent:"space-between"}}>
              <div>#{o.id} • {o.status}</div>
              <div className="small">{o.created_at || o.createdAt}</div>
            </div>
            <div style={{display:"flex", gap:8, flexWrap:"wrap", marginTop:8}}>
              <button className="btn" onClick={()=>/* hook your update */ null}>Save</button>
              <button className="btn" onClick={()=>/* hook your update */ null}>Approve +2h</button>
              <button className="btn" onClick={()=>/* hook your update */ null}>Out for delivery +1h</button>
              <button className="btn" onClick={()=>nudgeWA(o)}>Nudge (WA)</button>
            </div>
          </li>
        ))}
        {filtered.length===0 && <li className="small">No orders yet.</li>}
      </ul>
    </main>
  );
}
