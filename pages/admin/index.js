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
    try{
      const r = await fetch("/api/orders/list", { headers: { "x-admin-key": key }});
      const j = await r.json();
      if(!j.ok) throw new Error(j.error || "Failed to load");
      setOrders(j.orders || []);
    }catch(e){
      setError(String(e.message||e));
    }
  }

  function saveKey(){
    sessionStorage.setItem("maa_admin_key", key);
    load();
  }

  async function patch(id, patch){
    const r = await fetch("/api/orders/update", {
      method: "POST",
      headers: { "Content-Type":"application/json", "x-admin-key": key },
      body: JSON.stringify({ id, patch })
    });
    const j = await r.json();
    if(j.ok){
      setOrders(prev => prev.map(o => o.id===id ? j.order : o));
    }else{
      alert(j.error || "Failed to update");
    }
  }

  const filtered = useMemo(()=>{
    return (orders||[]).filter(o => {
      const hay = (o.id + " " + (o.name||"") + " " + (o.phone||"") + " " + (o.address||"")).toLowerCase();
      const okQ = !q || hay.includes(q.toLowerCase());
      const okS = !statusFilter || o.status === statusFilter;
      return okQ && okS;
    });
  }, [orders, q, statusFilter]);

  return (
    <main style={{maxWidth:1000, margin:"24px auto", padding:"0 16px"}}>
      <h1>Admin · Orders</h1>
      <div style={{display:"flex", gap:8, alignItems:"center", flexWrap:"wrap"}}>
        <input placeholder="Admin key" value={key} onChange={e=>setKey(e.target.value)} style={{padding:"6px 10px"}}/>
        <button className="btn" onClick={saveKey}>Unlock</button>
        <button className="btn" onClick={load}>Refresh</button>
        <input placeholder="Search (name/phone/address)" value={q} onChange={e=>setQ(e.target.value)} style={{marginLeft:"auto", padding:"6px 10px"}}/>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
          <option value="">All</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {error && <div style={{color:"crimson", marginTop:6}}>{error}</div>}

      <div style={{display:"grid", gap:12, marginTop:16}}>
        {filtered.map(o => (
          <div key={o.id} style={{border:"1px solid #eee", borderRadius:12, padding:12}}>
            <div style={{display:"flex", justifyContent:"space-between", gap:8, flexWrap:"wrap"}}>
              <div>
                <div style={{fontWeight:800}}>{o.id} — {o.name} ({o.phone})</div>
                <div className="small">{o.address}</div>
                <div className="small">Payment: {o.payment} | Placed: {o.created_at ? new Date(o.created_at).toLocaleString() : "-"}</div>
                <div className="small">Items: {o.items?.map(i=> i.name + " × " + i.qty).join(", ")}</div>
                <div style={{fontWeight:800}}>Total: ₹{Number(o.total||0).toLocaleString()}</div>
              </div>
              <div style={{minWidth:240}}>
                <label className="small">Status</label>
                <select value={o.status || "PLACED"} onChange={e=>patch(o.id,{status: e.target.value})}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="small" style={{marginTop:6}}>ETA: {o.eta ? new Date(o.eta).toLocaleString() : "—"}</div>
                <input type="datetime-local" onChange={e=>patch(o.id,{eta: e.target.value ? new Date(e.target.value).toISOString() : null})}/>
                <div style={{marginTop:6}}>
                  <a className="btn" target="_blank" rel="noreferrer"
                    href={`https://wa.me/${o.whatsapp || ""}?text=${encodeURIComponent("Order " + o.id)}`}>Open WhatsApp</a>
                </div>
                <div className="small">Updated: {o.updatedAt ? new Date(o.updatedAt).toLocaleString() : "-"}</div>
              </div>
            </div>
            <details style={{marginTop:8}}>
              <summary className="small">Status timeline</summary>
              <pre className="small" style={{whiteSpace:"pre-wrap"}}>{JSON.stringify(o.status_timestamps,null,2)}</pre>
            </details>
          </div>
        ))}
        {filtered.length===0 && <div className="small">No orders.</div>}
      </div>
    </main>
  );
}
