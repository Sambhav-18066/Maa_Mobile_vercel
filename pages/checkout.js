"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import STORE_CONFIG from "@/lib/storeConfig";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/router";

export default function Checkout(){
  const { items } = useCart();
  const router = useRouter();
  const [pay, setPay] = useState("COD");
  const subtotal = useMemo(()=> items.reduce((s,i)=>s+i.qty*i.price,0), [items]);
  const count = useMemo(()=> items.reduce((n,i)=>n+i.qty,0), [items]);

  const [form, setForm] = useState({name:"", phone:"", address:"", whatsapp:""});

  function update(k,v){ setForm(prev => ({...prev, [k]: v})); }

  function buildOrderText(orderId){
    const lines = [];
    lines.push(`Order ID: ${orderId}`);
    lines.push(`Name: ${form.name}`);
    lines.push(`Phone: ${form.phone}`);
    lines.push(`Address: ${form.address}`);
    lines.push(`Payment: ${pay}`);
    lines.push("");
    lines.push("Items:");
    for(const i of items){ lines.push(`- ${i.name} x ${i.qty} = ₹${(i.qty*i.price).toLocaleString()}`); }
    lines.push("");
    lines.push(`Total: ₹${subtotal.toLocaleString()}`);
    lines.push("");
    lines.push("— Sent from Maa Mobile store");
    return lines.join("\n");
  }

  function upiDeepLink(amount){
    const upi = STORE_CONFIG.UPI_ID;
    const name = encodeURIComponent(STORE_CONFIG.UPI_NAME || "Maa Mobile");
    return `upi://pay?pa=${encodeURIComponent(upi)}&pn=${name}&am=${encodeURIComponent(String(amount))}&cu=INR`;
  }

  function onSubmit(e){
    e.preventDefault();
    const orderId = "MMA" + Math.floor(100000 + Math.random()*900000);
    const to = (form.whatsapp || STORE_CONFIG.ADMIN_WHATSAPP_NUMBER || "").replace(/[^0-9]/g,"");
    const details = buildOrderText(orderId);
    const wa = to ? `https://wa.me/${to}?text=${encodeURIComponent(details)}` : `https://wa.me/?text=${encodeURIComponent(details)}`;

    // clear cart
    if (typeof window !== "undefined") localStorage.removeItem("maa_cart_v1");

    
    // try to persist to server (Vercel KV)
    try {
      const payload = {
        id: orderId,
        name: form.name,
        phone: form.phone,
        address: form.address,
        payment: pay,
        pay: pay,
        items: items,
        total: subtotal,
        whatsapp: (form.whatsapp || ""),
      };
      await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error("Order persistence failed", e);
    }

    
    // store order locally for success page rendering
    try {
      const view = {
        id: orderId,
        name: form.name,
        phone: form.phone,
        address: form.address,
        payment: pay,
        items: items,
        total: subtotal,
        placedAt: new Date().toISOString()
      };
      sessionStorage.setItem("maa_last_order", JSON.stringify(view));
    } catch {}

    router.push(`/success?oid=${orderId}&wa=${encodeURIComponent(wa)}`);


  }

  return (
    <>
      <header className="header">
        <div className="bar">
          <Link className="logo" href="/">
            <img src="/assets/logo.svg" width="36" height="36" alt="logo"/>
            <div className="title">Maa Mobile</div>
          </Link>
          <div></div>
          <div className="actions"><Link className="badge" href="/">⬅ Back to shop</Link></div>
        </div>
      </header>

      <main style={{maxWidth:1000, margin:"16px auto", padding:"0 16px", display:"grid", gridTemplateColumns:"1fr 360px", gap:16, alignItems:"start"}}>
        <section style={{background:"#fff", border:"1px solid #eee", borderRadius:14, padding:14}}>
          <h2>Delivery Details</h2>
          <form onSubmit={onSubmit} style={{display:"grid", gap:10}}>
            <div style={{display:"grid", gap:6}}>
              <label>Full Name</label>
              <input required value={form.name} onChange={e=>update("name", e.target.value)} placeholder="Your name" style={{padding:10,border:"1px solid #ddd",borderRadius:10}}/>
            </div>
            <div style={{display:"grid", gap:6}}>
              <label>Phone</label>
              <input required pattern="\d{10,12}" value={form.phone} onChange={e=>update("phone", e.target.value)} placeholder="10-digit phone" style={{padding:10,border:"1px solid #ddd",borderRadius:10}}/>
            </div>
            <div style={{display:"grid", gap:6}}>
              <label>Address</label>
              <textarea required rows={3} value={form.address} onChange={e=>update("address", e.target.value)} placeholder="House, street, landmark, city, PIN" style={{padding:10,border:"1px solid #ddd",borderRadius:10}}/>
            </div>

            <div style={{display:"grid", gap:6}}>
              <label>Payment Method</label>
              <div style={{display:"flex", gap:10, flexWrap:"wrap"}}>
                <label className="badge"><input type="radio" name="pay" value="COD" checked={pay==="COD"} onChange={()=>setPay("COD")}/> &nbsp;Cash on Delivery</label>
                <label className="badge"><input type="radio" name="pay" value="UPI" checked={pay==="UPI"} onChange={()=>setPay("UPI")}/> &nbsp;UPI</label>
              </div>
            </div>

            {pay==="UPI" && (
              <div style={{border:"1px dashed #e7e3ff", borderRadius:12, padding:12}}>
                <h3>Pay via UPI</h3>
                <p className="small">Scan code or tap the button to open your UPI app.</p>
                <img src="/assets/upi-qr.svg" alt="UPI QR" style={{width:180,height:180,objectFit:"contain",background:"#fff",border:"1px solid #eee",borderRadius:8}}/>
                <div style={{marginTop:8}}>
                  <div><strong>UPI:</strong> {STORE_CONFIG.UPI_ID} ({STORE_CONFIG.UPI_NAME})</div>
                  <a className="btn primary" href={upiDeepLink(subtotal)}>Pay now</a>
                </div>
              </div>
            )}

            <div style={{display:"grid", gap:6}}>
              <label>Send order to shop WhatsApp (optional)</label>
              <input value={form.whatsapp} onChange={e=>update("whatsapp", e.target.value)} placeholder="Owner WhatsApp (e.g., 9198XXXXXXXX)" style={{padding:10,border:"1px solid #ddd",borderRadius:10}}/>
              <p className="small">If empty, we use the number in the config.</p>
            </div>

            <button className="btn primary" type="submit">Place Order</button>
          </form>
        </section>

        <aside style={{background:"#fff", border:"1px solid #eee", borderRadius:14, padding:14}}>
          <h3>Order Summary</h3>
          <div className="cartItems" style={{maxHeight:340}}>
            {items.length===0 ? <div className="small">Your cart is empty.</div> :
              items.map(i => (
                <div className="cartItem" key={i.id}>
                  <img src={i.image} alt={i.name} width={64} height={64}/>
                  <div><div className="name">{i.name}</div><div className="small">Qty: {i.qty}</div></div>
                  <div><strong>₹{(i.qty*i.price).toLocaleString()}</strong></div>
                </div>
              ))
            }
          </div>
          <div className="cartTotal">
            <div className="cartRow"><span>Items</span><span>{count}</span></div>
            <div className="cartRow"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
            <div className="cartRow total"><span>Total</span><span>₹{subtotal.toLocaleString()}</span></div>
          </div>
        </aside>
      </main>
    </>
  );
}