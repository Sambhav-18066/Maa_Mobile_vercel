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
  const [order, setOrder] = useState(null);
  const [wa, setWa] = useState("");

  useEffect(()=>{
    const id = router.query.id;
    if (!id) return;
    // build a local order summary from offline queue if needed
    setOrder({ id, items: JSON.parse(localStorage.getItem("maa_last_items")||"[]") });
    const num = (localStorage.getItem("maa_phone") || "").replace(/[^0-9]/g,"");
    const text = encodeURIComponent(`Hi! I placed order ${id}. Could you confirm?`);
    const url = num ? `https://wa.me/${num}?text=${text}` : `https://wa.me/?text=${text}`;
    setWa(url);
  }, [router.query.id]);

  useEffect(()=>{
    // store last items snapshot on prior page if available
    try {
      const cart = JSON.parse(localStorage.getItem("maa_cart_v1") || "[]");
      localStorage.setItem("maa_last_items", JSON.stringify(cart));
    } catch {}
  }, [router.query.id]);

  const total = useMemo(()=> items.reduce((s,i)=>s + i.qty*i.price, 0), [items]);

  const offline = router.query.offline === "1";

  return (
    <main style={{maxWidth:1000, margin:"16px auto", padding:"0 16px", display:"grid", gap:16}}>
      <header className="header">
        <div className="bar">
          <Link className="logo" href="/">
            <img src="/assets/logo.svg" width="36" height="36" alt="logo"/>
            <div className="title">Maa Mobile</div>
          </Link>
          <div></div>
          <div className="actions"><Link className="badge" href="/">Continue shopping</Link></div>
        </div>
      </header>

      <section style={{background:"#fff", border:"1px solid #eee", borderRadius:14, padding:14}}>
        <div style={{fontSize:18, fontWeight:800, marginBottom:8}}>🎉 Order {router.query.id} placed.</div>
        {offline ? (
          <div className="small" style={{color:"#b00020"}}>You appear to be offline—no stress. We'll ping the order when you're back.</div>
        ) : (
          <div className="small">We’ll ping you when it’s approved. ETA: <strong>{etaString()}</strong></div>
        )}

        <div style={{display:"grid", gap:10, gridTemplateColumns:"1fr 1fr", marginTop:10}}>
          <Link className="btn primary big" href="/myorders">Track in app</Link>
          {wa ? <a className="btn big" target="_blank" rel="noopener" href={wa}>Open WhatsApp</a> : null}
        </div>
      </section>

      {/* Items summary */}
      {order && (
        <section style={{background:"#fff", border:"1px solid #eee", borderRadius:12, padding:12}}>
          <div style={{fontWeight:800, marginBottom:8}}>Order Items</div>
          <div style={{display:"grid", gap:10}}>
            {order.items.map(i => (
              <div key={i.id} style={{display:"grid", gridTemplateColumns:"64px 1fr auto", gap:10, alignItems:"center"}}>
                <img src={i.image} alt={i.name} width={64} height={64} loading="lazy"/>
                <div><div className="name">{i.name}</div><div className="small">Qty: {i.qty}</div></div>
                <div><strong>₹{(i.qty*i.price).toLocaleString()}</strong></div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section style={{marginTop:4}}>
        <ProductRow title="People also bought" category="Mobiles" />
      </section>
    </main>
  );
}