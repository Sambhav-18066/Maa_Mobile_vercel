"use client";
import { useEffect, useState } from "react";

function upiDeepLink(amount){
  const upi = encodeURIComponent(`${STORE_CONFIG.UPI_ID}`);
  const name = encodeURIComponent(`${STORE_CONFIG.UPI_NAME}`);
  return `upi://pay?pa=${upi}&pn=${name}&cu=INR&am=${amount}`;
}

export default function Checkout(){
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name:"", phone:"", address:"", whatsapp:"8908884402" });

  useEffect(()=>{ try { setItems(JSON.parse(localStorage.getItem("maa_cart_v1")||"[]")); } catch {} }, []);
  function upd(k,v){ setForm(s=>({...s,[k]:v})); }

  // flush queue when back online
  useEffect(()=>{
    async function flush(){
      const q = JSON.parse(localStorage.getItem("maa_offline_queue") || "[]");
      if (!q.length) return;
      const next = [];
      for (const o of q){
        try {
          await fetch("/api/orders/create",{ method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(o) });
        } catch (e) { next.push(o); }
      }
      localStorage.setItem("maa_offline_queue", JSON.stringify(next));
    }
    window.addEventListener("online", flush);
    return ()=> window.removeEventListener("online", flush);
  }, []);

  const progressPct = step===1 ? 33 : step===2 ? 66 : 100;

  return (
    <main style={{maxWidth:900, margin:"16px auto", padding:"0 16px"}}>
      <h1>Checkout</h1>

      <section style={{background:"#fff", border:"1px solid #eee", borderRadius:12, padding:12, marginBottom:12}}>
        <div style={{fontWeight:800, marginBottom:8}}>Order Summary</div>
        <div style={{display:"grid", gap:10}}>
          {items.map(i => (
            <div key={i.id} style={{display:"grid", gridTemplateColumns:"56px 1fr auto", gap:10, alignItems:"center"}}>
              <img src={i.image} alt={i.name} width={56} height={56} loading="lazy" style={{borderRadius:8, background:"#fafafa"}}/>
              <div><div className="name">{i.name}</div><div className="small">Qty: {i.qty}</div></div>
              <div><strong>₹{(i.qty*i.price).toLocaleString()}</strong></div>
            </div>
          ))}
          {items.length>0 && (
            <div style={{display:"flex", justifyContent:"space-between", fontWeight:800}}>
              <span>Total</span><span>₹{items.reduce((s,i)=>s+i.qty*i.price,0).toLocaleString()}</span>
            </div>
          )}
        </div>
      </section>

      <section style={{background:"#fff", border:"1px solid #eee", borderRadius:12, padding:12}}>
        <div style={{display:"grid", gap:10}}>
          <div style={{display:"grid", gap:6}}>
            <label>Phone</label>
            <input value={form.phone} onChange={e=>upd("phone", e.target.value.replace(/\D/g,""))} inputMode="numeric" placeholder="10-digit mobile number" />
          </div>
          <div style={{display:"grid", gap:6}}>
            <label>Full Name</label>
            <input value={form.name} onChange={e=>upd("name", e.target.value)} placeholder="Your name" />
          </div>
          <div style={{display:"grid", gap:6}}>
            <label>Address</label>
            <textarea value={form.address} onChange={e=>upd("address", e.target.value)} placeholder="House no, street, area" rows={3} />
          </div>
        </div>
      </section>
    </main>
  );
}
