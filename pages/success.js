// Server-side so Next won't try to pre-render this page at build time
export async function getServerSideProps(){ 
  return { props: {} }; 
}

import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

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
  const [items, setItems] = useState([]);

  useEffect(()=>{
    const id = router.query.id;
    if (!id) return;

    // read items snapshot stored during checkout/buy now
    const last = JSON.parse(localStorage.getItem("maa_last_items") || "[]");
    setOrder({ id, items: last });
    setItems(last);

    // default WhatsApp number if none saved
    const num = (localStorage.getItem("maa_phone") || "8908884402").replace(/[^0-9]/g,"");
    const text = encodeURIComponent(`Hi! I placed order ${id}. Could you confirm?`);
    setWa(num ? `https://wa.me/${num}?text=${text}` : `https://wa.me/?text=${text}`);
  }, [router.query.id]);

  const total = useMemo(()=> (items || []).reduce((s,i)=> s + i.qty*i.price, 0), [items]);
  const offline = router.query.offline === "1";

  return (
    <main style={{maxWidth:1000, margin:"16px auto", padding:"0 16px", display:"grid", gap:16}}>
      <header className="header">
        <div className="bar">
          <Link className="logo" href="/"><div className="title">Maa Mobile</div></Link>
          <div></div>
          <div className="actions"><Link className="badge" href="/">Continue shopping</Link></div>
        </div>
      </header>

      <section style={{background:"#fff", border:"1px solid #eee", borderRadius:14, padding:14}}>
        <div style={{fontSize:18, fontWeight:800, marginBottom:8}}>🎉 Order {router.query.id} placed.</div>
        {offline
          ? <div className="small" style={{color:"#b00020"}}>You appear to be offline—no stress. We'll ping the order when you're back.</div>
          : <div className="small">We’ll ping you when it’s approved. ETA: <strong>{etaString()}</strong></div>}

        <div style={{display:"grid", gap:10, gridTemplateColumns:"1fr 1fr", marginTop:10}}>
          <Link className="btn primary big" href="/myorders">Track in app</Link>
          {wa ? <a className="btn big" target="_blank" rel="noopener" href={wa}>Open WhatsApp</a> : null}
        </div>

        <div style={{marginTop:10, display:"flex", gap:8, flexWrap:"wrap"}}>
          <a className="btn" href={"sms:?&body="+encodeURIComponent("Order "+(router.query.id||"")+" placed at Maa Mobile. ETA: "+etaString())}>Text (SMS) update</a>
          <button className="btn" onClick={()=>{
            const text=`Order ${router.query.id||""} placed at Maa Mobile. ETA: ${etaString()}`;
            if(navigator.share){ navigator.share({title:"Order placed", text, url:window.location.href}).catch(()=>{}); }
            else { navigator.clipboard?.writeText(text+" "+window.location.href); alert("Share text copied"); }
          }}>Share</button>
        </div>
      </section>

      {(order?.items || []).length > 0 && (
        <section style={{background:"#fff", border:"1px solid #eee", borderRadius:12, padding:12}}>
          <div style={{fontWeight:800, marginBottom:8}}>Order Items</div>
          <div style={{display:"grid", gap:10}}>
            {(order?.items || []).map(i => (
              <div key={i.id} style={{display:"grid", gridTemplateColumns:"64px 1fr auto", gap:10, alignItems:"center"}}>
                <img src={i.image} alt={i.name} width={64} height={64} loading="lazy"/>
                <div><div className="name">{i.name}</div><div className="small">Qty: {i.qty}</div></div>
                <div><strong>₹{(i.qty*i.price).toLocaleString()}</strong></div>
              </div>
            ))}
            <div style={{display:"flex", justifyContent:"space-between", fontWeight:800}}>
              <span>Total</span><span>₹{total.toLocaleString()}</span>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
