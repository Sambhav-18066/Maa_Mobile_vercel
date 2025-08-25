"use client";
import { useEffect, useMemo, useState } from "react";

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || ""; // must be set in Vercel

export default function Admin(){
  const [key, setKey] = useState("");
  const [ok, setOk] = useState(false);
  const [filter, setFilter] = useState("all");
  const [orders, setOrders] = useState([]);

  // hydrate key from localStorage and/or ?key=
  useEffect(()=>{
    const fromLs = localStorage.getItem("maa_admin_key") || "";
    const fromQuery = new URLSearchParams(window.location.search).get("key") || "";
    const val = fromQuery || fromLs;
    if (val) { setKey(val); setOk(val === ADMIN_KEY); }
  }, []);

  // demo fetch; replace with your API
  useEffect(()=>{
    // TODO: fetch("/api/orders").then(r=>r.json()).then(setOrders)
    setOrders([]); // keep it empty until you wire your backend
  }, []);

  function login(e){
    e.preventDefault();
    const ok = key === ADMIN_KEY;
    setOk(ok);
    if (ok) localStorage.setItem("maa_admin_key", key);
  }

  function isToday(ts){ try{ const d = new Date(ts); const t = new Date(); return d.toDateString() === t.toDateString(); }catch{return false;} }

  // quick actions (client only — wire your API where marked)
  async function applyPreset(o, type){
    const now = Date.now();
    const patch = {};
    if(type==="approve"){ patch.status="approved"; patch.approvedAt = new Date(now).toISOString(); patch.eta = new Date(now + 2*60*60*1000).toISOString(); }
    if(type==="ofd"){ patch.status="out_for_delivery"; patch.outForDeliveryAt = new Date(now).toISOString(); patch.eta = new Date(now + 60*60*1000).toISOString(); }
    // TODO: await fetch(`/api/orders/${o.id}`, { method:"PATCH", body: JSON.stringify(patch) })
    alert(`Preset "${type}" would update order ${o.id}. Wire your API in admin/index.js`);
  }

  function nudgeWA(o){
    const num = (o.phone || "").replace(/[^0-9]/g,"");
    const text = encodeURIComponent(`Update for order ${o.id}: Status - ${o.status || "placed"}. ETA: ${o.eta ? new Date(o.eta).toLocaleTimeString() : "N/A"}`);
    const url = num ? `https://wa.me/${num}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, "_blank");
  }

  const filtered = useMemo(()=> (orders||[]).filter(o =>
    filter==="all" ? true :
    filter==="today" ? isToday(o.created_at||o.createdAt) :
    filter==="pending" ? ((o.status||"")==="placed") :
    (o.status||"")==="out_for_delivery"
  ), [orders, filter]);

  // gate
  if (!ok) {
    return (
      <main style={{maxWidth:500, margin:"40px auto", padding:"0 16px"}}>
        <h1>Admin login</h1>
        <form onSubmit={login} style={{display:"grid", gap:10, marginTop:12}}>
          <input value={key} onChange={e=>setKey(e.target.value)} placeholder="Enter admin key" />
          <button className="btn primary">Enter</button>
        </form>
        {ADMIN_KEY ? <div className="small" style={{marginTop:8}}>Tip: you can append <code>?key=YOUR_KEY</code> to the URL.</div> : (
          <div className="small" style={{marginTop:8, color:"#b00020"}}>NEXT_PUBLIC_ADMIN_KEY is not set on the server.</div>
        )}
      </main>
    );
  }

  return (
    <main style={{maxWidth:900, margin:"16px auto", padding:"0 16px"}}>
      <h1>Admin</h1>

      <div className="toolbar" style={{display:"flex", gap:8, flexWrap:"wrap", alignItems:"center"}}>
        <select value={filter} onChange={e=>setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="today">Today</option>
          <option value="pending">Pending</option>
          <option value="ofd">Out for delivery</option>
        </select>
        <a className="badge" href="/admin">Refresh</a>
      </div>

      <ul style={{display:"grid", gap:10, listStyle:"none", padding:0, marginTop:12}}>
        {filtered.map(o => (
          <li key={o.id} style={{border:"1px solid #eee", borderRadius:10, padding:10, background:"#fff"}}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", gap:8}}>
              <div><strong>#{o.id}</strong> • {o.status || "placed"}</div>
              <div className="small">{o.created_at || o.createdAt || ""}</div>
            </div>
            <div className="small" style={{marginTop:6}}>
              {o.name} • {o.phone} • {o.address}
            </div>
            <div style={{display:"flex", gap:8, flexWrap:"wrap", marginTop:8}}>
              <button className="btn" onClick={()=>applyPreset(o, "approve")}>Approve → set ETA +2h</button>
              <button className="btn" onClick={()=>applyPreset(o, "ofd")}>Out for delivery → ETA +1h</button>
              <button className="btn" onClick={()=>nudgeWA(o)}>Nudge (WhatsApp)</button>
            </div>
          </li>
        ))}
        {filtered.length===0 && <li className="small">No orders yet.</li>}
      </ul>
    </main>
  );
}
