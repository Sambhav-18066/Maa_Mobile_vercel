
"use client";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import STORE_CONFIG from "@/lib/storeConfig";

function etaString(){
  const d = new Date();
  d.setDate(d.getDate() + 3);
  const opts = { weekday: "short", month: "short", day: "numeric" };
  return d.toLocaleDateString(undefined, opts);
}

export default function Success(){
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [wa, setWa] = useState("");

  useEffect(()=>{
    try {
      const cart = JSON.parse(localStorage.getItem("maa_cart_v1") || "[]");
      setItems(cart);
      const num = (localStorage.getItem("maa_phone") || "8908884402").replace(/[^0-9]/g,"");
      const text = encodeURIComponent(`Hi! I placed order ${router.query.id||""}. Could you confirm?`);
      const url = num ? `https://wa.me/${num}?text=${text}` : `https://wa.me/?text=${text}`;
      setWa(url);
    } catch {}
  }, [router.query.id]);

  const total = useMemo(()=> items.reduce((s,i)=>s + i.qty*i.price, 0), [items]);

  return (
    <main style={{maxWidth:1000, margin:"16px auto", padding:"0 16px", display:"grid", gap:16}}>
      <header className="header">
        <div className="bar">
          <Link className="logo" href="/">
            <img src="/assets/logo.svg" width="36" height="36" alt="logo"/>
            <div className="title">Order Placed</div>
          </Link>
          <div></div>
          <div className="actions"><Link className="badge" href="/">Continue shopping</Link></div>
        </div>
      </header>

      <section style={{background:"#fff", border:"1px solid #eee", borderRadius:14, padding:14}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline"}}>
          <div style={{fontSize:18, fontWeight:800}}>🎉 Order {router.query.id}</div>
          <div className="small" style={{padding:"4px 8px", border:"1px solid #eee", borderRadius:999}}>Seller: {STORE_CONFIG.NAME} · +91 8908884402</div>
        </div>
        <div className="small" style={{marginTop:6}}>Estimated delivery: <strong>{etaString()}</strong></div>
        <div style={{display:"grid", gap:10, gridTemplateColumns:"1fr 1fr", marginTop:10}}>
          <Link className="btn primary" href="/myorders">Show order details</Link>
          {wa ? <a className="btn" target="_blank" rel="noopener" href={wa}>Open WhatsApp</a> : null}
        </div>
      </section>

      <section style={{background:"#fff", border:"1px solid #eee", borderRadius:12, padding:12}}>
        <div style={{fontWeight:800, marginBottom:8}}>Order Summary</div>
        <div style={{display:"grid", gap:10}}>
          {items.map(i => (
            <div key={i.id} style={{display:"grid", gridTemplateColumns:"64px 1fr auto", gap:10, alignItems:"center"}}>
              <img src={i.image} alt={i.name} width={64} height={64} loading="lazy"/>
              <div><div className="name">{i.name}</div><div className="small">Qty: {i.qty}</div></div>
              <div><strong>₹{(i.qty*i.price).toLocaleString()}</strong></div>
            </div>
          ))}
          {items.length>0 && (
            <div style={{display:"flex", justifyContent:"space-between", fontWeight:800}}>
              <span>Total</span><span>₹{total.toLocaleString()}</span>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
