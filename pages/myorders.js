"use client";
import Head from "next/head";
import { useEffect, useState } from "react";
import OrderTimeline from "@/components/OrderTimeline";

function plainLanguage(order){
  const t = order.status_timestamps || {};
  const parts = [];
  if (t.PLACED) parts.push(`Order placed at ${new Date(t.PLACED).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`);
  if (t.APPROVED) parts.push(`Approved at ${new Date(t.APPROVED).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`);
  if (t.OUT_FOR_DELIVERY) parts.push(`Out for delivery${order.eta ? ` (ETA ${new Date(order.eta).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})})` : ""}`);
  if (t.DELIVERED) parts.push(`Delivered at ${new Date(t.DELIVERED).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`);
  return parts.slice(-1)[0] || "Processing...";
}

export default function MyOrders() {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expand, setExpand] = useState(false);

  useEffect(()=>{
    const p = localStorage.getItem("maa_phone") || "";
    if(p) setPhone(p);
  }, []);

  async function load(){
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/orders/byPhone", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ phone }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error||"Failed");
      setOrders(json.orders || []);
    } catch (e) {
      setError(String(e));
    } finally { setLoading(false); }
  }

  useEffect(()=>{ if (phone) load(); }, [phone]);

  const latest = orders[0];

  return (
    <>
      <Head>
        <title>My Orders • Maa Mobile</title>
        <meta name=\"robots\" content=\"noindex\" />
      </Head>
    
      <Head>
        <title>My Orders • Maa Mobile</title>
        <meta name="robots" content="noindex" />
      </Head>
      <main style={{maxWidth: 1000, margin:"16px auto", padding:"0 16px", display:"grid", gap:16}}>
      <header className="header">
        <div className="bar">
          <div className="logo"><img src="/assets/logo.svg" width="36" height="36" alt="logo"/><div className="title">My Orders</div></div>
          <div></div>
          <div className="actions"><a href="/" className="badge">⬅ Back</a></div>
        </div>
      </header>

      <section style={{background:"#fff", border:"1px solid #eee", borderRadius:14, padding:14}}>
        <div style={{display:"grid", gap:10}}>
          <label htmlFor="phone">Phone</label>
          <input id="phone" type="tel" inputMode="numeric" pattern="\\d{10,12}" value={phone} onChange={e=>setPhone(e.target.value.replace(/\\D/g,''))} placeholder="10-digit mobile number"
            style={{padding:10,border:"1px solid #ddd",borderRadius:10}}/>
          <button className="btn primary" onClick={load} disabled={!/^\d{10,12}$/.test(phone)}>Find orders</button>
          {error && <div className="small" style={{color:"#b00020"}}>{error}</div>}
        </div>
      </section>

      {loading && (
        <section style={{background:"#fff", border:"1px solid #eee", borderRadius:14, padding:14}}>
          <div className="skeleton" style={{height:18, marginBottom:10}}/>
          <div className="skeleton" style={{height:120}}/>
        </section>
      )}

      {latest && !loading && (
        <section style={{background:"#fff", border:"1px solid #eee", borderRadius:14, padding:14}}>
          <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
            <div>
              <div style={{fontWeight:800}}>Latest: {latest.id}</div>
              <div className="small">{plainLanguage(latest)}</div>
            </div>
            <button className="btn" onClick={()=>setExpand(e=>!e)}>{expand ? "Hide details" : "Show details"}</button>
          </div>
          <div style={{marginTop:10}}>
            <OrderTimeline order={latest} />
          </div>
          {expand && (
            <div style={{marginTop:10}}>
              {latest.items?.map(i => (
                <div key={i.id} className="small">- {i.name} × {i.qty}</div>
              ))}
            </div>
          )}
        </section>
      )}

      {!loading && orders.length>1 && (
        <section style={{background:"#fff", border:"1px solid #eee", borderRadius:14, padding:14}}>
          <div style={{fontWeight:800, marginBottom:8}}>Previous orders</div>
          <div style={{display:"grid", gap:10}}>
            {orders.slice(1).map(o => (
              <div key={o.id} style={{border:"1px solid #eee", borderRadius:10, padding:10}}>
                <div style={{fontWeight:700}}>{o.id} — ₹{Number(o.total||0).toLocaleString()}</div>
                <div className="small">{o.items?.map(i=> i.name + " × " + i.qty).join(", ")}</div>
                <OrderTimeline order={o} />
              </div>
            ))}
          </div>
        </section>
      )}

      {!loading && orders.length===0 && phone && <div className="small">No orders found for this number.</div>}
    </main>
    </>
  );
}