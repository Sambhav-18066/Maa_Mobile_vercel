"use client";
import { useEffect, useState } from "react";
import OrderTimeline from "@/components/OrderTimeline";

export default function MyOrders() {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(()=>{
    const p = localStorage.getItem("maa_phone") || "";
    if(p) setPhone(p);
  }, []);

  async function fetchOrders() {
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/orders/byPhone", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ phone })
      });
      const j = await r.json();
      if(!j.ok) throw new Error(j.error || "Failed to fetch");
      setOrders(j.orders || []);
      localStorage.setItem("maa_phone", phone);
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{maxWidth:900, margin:"24px auto", padding:"0 16px"}}>
      <h1>My Orders</h1>
      <div style={{display:"flex", gap:8}}>
        <input placeholder="Enter your phone number" value={phone} onChange={e=>setPhone(e.target.value)} />
        <button className="btn" onClick={fetchOrders} disabled={!phone || loading}>{loading ? "Loading..." : "Show"}</button>
      </div>
      {error && <div style={{color:"crimson", marginTop:6}}>{error}</div>}

      <div style={{display:"grid", gap:12, marginTop:16}}>
        {orders.map(o => (
          <div key={o.id} style={{border:"1px solid #eee", borderRadius:12, padding:12}}>
            <div style={{display:"flex", justifyContent:"space-between", gap:8, flexWrap:"wrap"}}>
              <div>
                <div style={{fontWeight:800}}>{o.id} — {o.status}</div>
                <div className="small">Placed: {o.created_at ? new Date(o.created_at).toLocaleString() : "-"}</div>
                {o.eta && <div className="small">Expected delivery: {new Date(o.eta).toLocaleString()}</div>}
                <div className="small">Total: ₹{Number(o.total||0).toLocaleString()}</div>
              </div>
              <div className="small">Tracking code: {o.tracking_code || "—"}</div>
            </div>
            <div style={{marginTop:8}}>
              <OrderTimeline order={o} />
            </div>
            <div style={{ marginTop: 10 }}>
              {o.items?.map(i => (
                <div key={i.id} className="small">- {i.name} × {i.qty}</div>
              ))}
            </div>
          </div>
        ))}
        {orders.length === 0 && !loading && <div className="small">No orders found for this number.</div>}
      </div>
    </main>
  );
}
