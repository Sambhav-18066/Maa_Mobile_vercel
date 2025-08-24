
"use client";
import { useEffect, useMemo, useState } from "react";

function useKey(){
  const [key, setKey] = useState("");
  useEffect(()=>{
    const k = sessionStorage.getItem("maa_admin_key") || "";
    setKey(k);
  }, []);
  function save(k){
    setKey(k);
    sessionStorage.setItem("maa_admin_key", k);
  }
  return [key, save];
}

export default function Admin(){
  const [key, saveKey] = useKey();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  async function load(){
    setError("");
    try {
      const r = await fetch("/api/orders/list", { headers: { "x-admin-key": key }});
      const j = await r.json();
      if(!j.ok) throw new Error(j.error || "Failed");
      setOrders(j.orders || []);
    } catch (e) {
      setError(String(e.message||e));
    }
  }

  async function updateStatus(id, status){
    const r = await fetch("/api/orders/update", { method:"POST", headers: { "Content-Type":"application/json", "x-admin-key": key }, body: JSON.stringify({ id, patch: { status }})});
    const j = await r.json();
    if(j.ok){
      setOrders(prev => prev.map(o => o.id===id ? j.order : o));
    }
  }

  useEffect(()=>{ if(key) load(); }, [key]);

  return (
    <main style={{maxWidth:1100, margin:"20px auto", padding:"0 16px"}}>
      <h1>Maa Mobile — Admin</h1>

      <div style={{display:"flex", gap:10, alignItems:"center", marginBottom:12}}>
        <input value={key} onChange={e=>saveKey(e.target.value)} placeholder="Enter ADMIN_KEY" style={{padding:10, border:"1px solid #ddd", borderRadius:8, width:260}}/>
        <button className="btn primary" onClick={load}>Load Orders</button>
        {error && <span className="small" style={{color:"crimson"}}>{error}</span>}
      </div>

      <div style={{display:"grid", gap:10}}>
        {orders.map(o => (
          <div key={o.id} style={{background:"#fff", border:"1px solid #eee", borderRadius:10, padding:12}}>
            <div style={{display:"grid", gridTemplateColumns:"1fr 180px 180px 120px", gap:10, alignItems:"center"}}>
              <div>
                <div style={{fontWeight:800}}>{o.id} — {o.name} ({o.phone})</div>
                <div className="small">{o.address}</div>
                <div className="small">Payment: {o.pay} | Placed: {new Date(o.createdAt).toLocaleString()}</div>
                <div className="small">Items: {o.items?.map(i=> i.name + " x" + i.qty).join(", ")}</div>
                <div style={{fontWeight:800}}>Total: ₹{Number(o.total||0).toLocaleString()}</div>
              </div>
              <div>
                <label className="small">Status</label>
                <div style={{display:"flex", gap:6, flexWrap:"wrap"}}>
                  {["new","confirmed","packed","shipped","delivered","cancelled"].map(s=>
                    <button key={s} onClick={()=>updateStatus(o.id, s)}
                      className={"btn " + (o.status===s ? "gold": "")}>{s}</button>
                  )}
                </div>
              </div>
              <div>
                <a className="btn" target="_blank" rel="noreferrer"
                   href={`https://wa.me/${o.whatsapp || ""}?text=${encodeURIComponent("Order " + o.id)}`}>Open WhatsApp</a>
              </div>
              <div className="small">Updated: {o.updatedAt ? new Date(o.updatedAt).toLocaleString() : "-"}</div>
            </div>
          </div>
        ))}
        {orders.length===0 && <div className="small">No orders yet.</div>}
      </div>
    </main>
  );
}
