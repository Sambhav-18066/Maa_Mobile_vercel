"use client";
import { useEffect, useState } from "react";

export default function Checkout(){
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name:"", phone:"", address:"", whatsapp:"8908884402" });

  useEffect(()=>{ try { setItems(JSON.parse(localStorage.getItem("maa_cart_v1")||"[]")); } catch {} }, []);
  function upd(k,v){ setForm(s=>({...s,[k]:v})); }

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
