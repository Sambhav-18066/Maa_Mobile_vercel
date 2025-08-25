"use client";
import { useEffect, useMemo, useState } from "react";

const STATUSES = ["PLACED","APPROVED","OUT_FOR_DELIVERY","DELIVERED","CANCELLED"];

export default function AdminOrders(){
  const [key, setKey] = useState("");
  const [orders, setOrders] = useState([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");

  useEffect(()=>{
    const k = sessionStorage.getItem("maa_admin_key") || "";
    setKey(k);
  }, []);

  async function load(){
    setError("");
    try {
      const res = await fetch("/api/orders/list?key="+encodeURIComponent(key));
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setOrders(json.orders || []);
    } catch (e) {
      setError(String(e));
    }
  }
  useEffect(()=>{ if (key) load(); }, [key]);

  async function patch(id, patch){
    const res = await fetch("/api/orders/update", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ key, id, patch })
    });
    const json = await res.json();
    if (!res.ok) { alert(json.error||"Update failed"); return; }
    setOrders(prev => prev.map(o => o.id===id ? json.order : o));
  }

  const filtered = useMemo(()=>{
    return orders.filter(o => (!statusFilter || o.status===statusFilter) &&
      (!q || (o.name?.toLowerCase().includes(q.toLowerCase()) || o.phone?.includes(q) || o.id?.includes(q))));
  }, [orders, statusFilter, q]);

  function quickFilterToday(){
    const today = new Date().toISOString().slice(0,10);
    setOrders(prev => prev.filter(o => (o.created_at||"").slice(0,10) === today));
  }

  function presetApprove(o){
    const eta = new Date(Date.now() + 2*60*60*1000).toISOString(); // +2 hours
    patch(o.id, { status: "APPROVED", eta });
  }
  function presetOutForDelivery(o){
    const eta = new Date(Date.now() + 60*60*1000).toISOString(); // +1 hour
    patch(o.id, { status: "OUT_FOR_DELIVERY", eta });
  }

  function nudge(o){
    const num = (o.phone||"").replace(/[^0-9]/g,"");
    const text = encodeURIComponent(`Hi ${o.name||""}, quick update on your order ${o.id}: ${o.status?.replaceAll("_"," ")}${o.eta ? " | ETA " + new Date(o.eta).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : ""}`);
    const url = num ? `https://wa.me/${num}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, "_blank");
  }

  return (
    <main style={{maxWidth:1000, margin:"16px auto", padding:"0 16px"}}>
      <h2>Admin · Orders</h2>
      <div style={{display:"grid", gap:10, gridTemplateColumns:"1fr 1fr 1fr 1fr"}}>
        <input type="password" placeholder="Admin key" value={key} onChange={e=>{setKey(e.target.value); sessionStorage.setItem("maa_admin_key", e.target.value);} }/>
        <input placeholder="Search name/phone/order id" value={q} onChange={e=>setQ(e.target.value)} />
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div style={{display:"flex", gap:8}}>
          <button className="btn" onClick={load}>Reload</button>
          <button className="btn" onClick={quickFilterToday}>Today</button>
          <button className="btn" onClick={()=>setStatusFilter("PENDING")}>Pending</button>
          <button className="btn" onClick={()=>setStatusFilter("OUT_FOR_DELIVERY")}>Out for delivery</button>
        </div>
      </div>
      {error && <div className="small" style={{color:"#b00020"}}>{error}</div>}

      <div style={{display:"grid", gap:10, marginTop:12}}>
        {filtered.map(o => (
          <div key={o.id} style={{display:"grid", gridTemplateColumns:"1fr 280px", gap:12, border:"1px solid #eee", borderRadius:10, padding:10}}>
            <div>
              <div style={{fontWeight:800}}>{o.id} — {o.name} ({o.phone})</div>
              <div className="small">{o.address}</div>
              <div className="small">Payment: {o.payment} | Placed: {o.created_at ? new Date(o.created_at).toLocaleString() : "-"}</div>
              <div className="small">Items: {o.items?.map(i=> i.name + " × " + i.qty).join(", ")}</div>
              <div style={{fontWeight:800}}>Total: ₹{Number(o.total||0).toLocaleString()}</div>
            </div>
            <div style={{minWidth:260, display:"grid", gap:8}}>
              <label className="small">Status</label>
              <select value={o.status || "PLACED"} onChange={e=>patch(o.id,{status: e.target.value})}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="small">ETA: {o.eta ? new Date(o.eta).toLocaleString() : "—"}</div>
              <input type="datetime-local" onChange={e=>patch(o.id, { eta: e.target.value ? new Date(e.target.value).toISOString() : null })}/>
              <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                <button className="btn" onClick={()=>presetApprove(o)}>Approve (+2h)</button>
                <button className="btn" onClick={()=>presetOutForDelivery(o)}>Out for delivery (+1h)</button>
                <button className="btn" onClick={()=>nudge(o)}>Nudge (WA)</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}