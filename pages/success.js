
"use client";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import ProductRow from "@/components/ProductRow";

function etaString(){
  const d = new Date();
  d.setDate(d.getDate() + 3); // +3 days delivery estimate
  const opts = { weekday: "short", month: "short", day: "numeric" };
  return d.toLocaleDateString(undefined, opts);
}

export default function Success(){
  const { query } = useRouter();
  const [oid, setOid] = useState("");
  const [wa, setWa] = useState("");
  const [order, setOrder] = useState(null);

  useEffect(()=>{
    setOid(query?.oid || "");
    setWa(query?.wa ? decodeURIComponent(query.wa) : "");
  }, [query]);

  useEffect(()=>{
    try {
      const raw = sessionStorage.getItem("maa_last_order");
      if(raw) setOrder(JSON.parse(raw));
    } catch {}
  }, []);

  return (
    <main style={{maxWidth:1200, margin:"20px auto", padding:"0 16px"}}>
      {/* Header */}
      <section style={{display:"grid", gridTemplateColumns:"1fr 360px", gap:16, alignItems:"start"}}>
        <div style={{background:"#fff", border:"1px solid #eee", borderRadius:12}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px", borderBottom:"1px solid #eee"}}>
            <div style={{fontWeight:800}}>Thanks for shopping with us!</div>
            <div style={{background:"#e6ffed", border:"1px solid #b7f5c0", color:"#08660d", fontWeight:800, padding:"4px 10px", borderRadius:999}}>✓ Order Placed</div>
          </div>

          <div style={{padding:"14px 16px"}}>
            <div style={{display:"flex", alignItems:"center", gap:10}}>
              <span style={{fontWeight:700}}>Delivery by</span>
              <span>{etaString()}</span>
            </div>

            <div style={{marginTop:10}}>
              <a href="#" className="btn">Track &amp; manage order</a>
            </div>

            <div style={{marginTop:16, background:"#fff8e1", border:"1px solid #ffe199", borderRadius:8, padding:12}}>
              <div style={{fontWeight:700, marginBottom:6}}>Delivery requires an OTP</div>
              <div className="small">We may ask for an OTP at delivery to confirm open box inspection. Don’t share your OTP before the package arrives.</div>
            </div>

            <div style={{marginTop:16, display:"flex", justifyContent:"center"}}>
              <Link href="/" className="btn primary" style={{minWidth:260, textAlign:"center"}}>Continue Shopping</Link>
            </div>
          </div>
        </div>

        <aside style={{background:"#fff", border:"1px solid #eee", borderRadius:12, padding:12}}>
          <div style={{fontWeight:800, marginBottom:10}}>Deliver to</div>
          {order ? (
            <div>
              <div style={{fontWeight:700}}>{order.name}</div>
              <div className="small" style={{marginTop:6, whiteSpace:"pre-wrap"}}>{order.address}</div>
              <div className="small" style={{marginTop:6}}>Phone: {order.phone}</div>
              <div className="small" style={{marginTop:6}}>Payment: {order.payment}</div>
              <div className="small" style={{marginTop:6, color:"#666"}}>Order ID: {oid || order.id}</div>
            </div>
          ) : (
            <div className="small">Order details unavailable (session cleared). You can still send details via WhatsApp below.</div>
          )}

          <div style={{marginTop:12}}>
            {wa ? <a className="btn gold" target="_blank" rel="noopener" href={wa}>Send Order Details on WhatsApp</a> : null}
          </div>
        </aside>
      </section>

      {/* Items summary */}
      {order && (
        <section style={{marginTop:16, background:"#fff", border:"1px solid #eee", borderRadius:12, padding:12}}>
          <div style={{fontWeight:800, marginBottom:8}}>Order Items</div>
          <div style={{display:"grid", gap:10}}>
            {order.items.map(i => (
              <div key={i.id} style={{display:"grid", gridTemplateColumns:"80px 1fr auto", gap:10, alignItems:"center", border:"1px solid #f1f1f1", borderRadius:10, padding:8}}>
                <img src={i.image} alt={i.name} style={{width:80, height:80, objectFit:"contain", background:"#fafafa", borderRadius:8}}/>
                <div>
                  <div style={{fontWeight:700}}>{i.name}</div>
                  <div className="small">Qty: {i.qty}</div>
                </div>
                <div style={{fontWeight:800}}>₹{(i.qty*i.price).toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex", justifyContent:"flex-end", marginTop:10, fontWeight:800}}>Total: ₹{order.total.toLocaleString()}</div>
        </section>
      )}

      {/* Suggestions */}
      <section style={{marginTop:16}}>
        <ProductRow title="You might be also interested in" category="Electronics" />
      </section>
      <section>
        <ProductRow title="You May Also Like..." category="Mobiles" />
      </section>
    </main>
  );
}
