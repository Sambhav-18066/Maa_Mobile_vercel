"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import STORE_CONFIG from "@/lib/storeConfig";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/router";

function upiDeepLink(amount){
  const upi = encodeURIComponent(`${STORE_CONFIG.UPI_ID}`);
  const name = encodeURIComponent(`${STORE_CONFIG.UPI_NAME}`);
  return `upi://pay?pa=${upi}&pn=${name}&cu=INR&am=${amount}`;
}

export default function Checkout(){
  const { items, clear } = useCart();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [pay, setPay] = useState("COD");
  const subtotal = useMemo(()=> items.reduce((s,i)=>s+i.qty*i.price,0), [items]);
  const count = useMemo(()=> items.reduce((n,i)=>n+i.qty,0), [items]);

  const [form, setForm] = useState({ name:"", phone:"", address:"", nickname:"Home", whatsapp:"" });
  const [more, setMore] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  useEffect(()=>{
    // smart defaults
    const lastPhone = localStorage.getItem("maa_phone") || "";
    const lastPay   = localStorage.getItem("maa_pay") || "COD";
    const lastNick  = localStorage.getItem("maa_address_nick") || "Home";
    setForm(f => ({...f, phone: lastPhone}));
    setPay(lastPay);
    setForm(f => ({...f, nickname: lastNick}));
  }, []);

  useEffect(()=>{ localStorage.setItem("maa_pay", pay); }, [pay]);

  function update(k,v){ setForm(prev => ({...prev, [k]: v})); }

  const disabled = placing || count === 0 || !/^\d{10,12}$/.test(form.phone) || form.address.trim().length < 8;

  async function onSubmit(e){
    e.preventDefault();
    setError("");
    if (disabled) return;

    setPlacing(true);

    
    // try to persist to server (Supabase API)
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
      // Save to Supabase
      const r = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify(o)
      });
      const j = await r.json();
      const newId = j?.id || orderId;
      // Also save to local cache
      try {
        const existing = JSON.parse(localStorage.getItem("maa_orders") || "[]");
        existing.push(payload);
        localStorage.setItem("maa_orders", JSON.stringify(existing));
        router.push(`/success?id=${newId}`);
      } catch(e) {
        console.error("Local cache save failed", e);
      }
    } catch (e) {
      console.error("Order persistence failed", e);
    }

    try {
      // online path
      const out = await sendOrder(order);
      localStorage.setItem("maa_phone", order.phone);
      localStorage.setItem("maa_address_nick", form.nickname||"Home");

      // optional: WhatsApp to shop number
      if (form.whatsapp) {
        // nothing to do now; success page offers button
      }

      clear();
      router.push(`/success?id=${order.id}`);
    } catch (err) {
      // offline queue path
      const q = JSON.parse(localStorage.getItem("maa_offline_queue") || "[]");
      q.push(order);
      localStorage.setItem("maa_offline_queue", JSON.stringify(q));
      setError("You're offline. We'll queue this order and send it when you're back online.");
      // small delay to show message then go to success UI
      clear();
      setTimeout(()=> router.push(`/success?id=${order.id}&offline=1`), 900);
    } finally {
      setPlacing(false);
    }
  }

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
              <input type="tel" inputMode="numeric" pattern="[0-9]*" required pattern="\d{10,12}" value={form.phone} onChange={e=>update("phone", e.target.value)} placeholder="10-digit phone" style={{padding:10,border:"1px solid #ddd",borderRadius:10}}/>
            </div>
            <div style={{display:"grid", gap:6}}>
              <label>Address</label>
              <textarea required rows={3} value={form.address} onChange={e=>update("address", e.target.value)} placeholder="House, street, landmark, city, PIN" style={{padding:10,border:"1px solid #ddd",borderRadius:10}}/>
            </div>

          <form onSubmit={onSubmit} style={{display:"grid", gap:12}}>
            {step===1 && (
              <div>
                <label htmlFor="phone">Phone</label>
                <input id="phone" type="tel" inputMode="numeric" pattern="\\d{10,12}" required
                  value={form.phone} onChange={e=>update("phone", e.target.value.replace(/\\D/g,''))}
                  placeholder="10-digit mobile number"
                  aria-describedby="phoneHelp"
                  style={{padding:10,border:"1px solid #ddd",borderRadius:10}}/>
                <div id="phoneHelp" className="small">We'll text you if the ETA changes.</div>

                <div style={{marginTop:12, display:"flex", gap:8}}>
                  <button type="button" className="btn" onClick={()=>setStep(2)} disabled={!/^\d{10,12}$/.test(form.phone)}>Next →</button>
                </div>
              </div>
            )}

            <div style={{display:"grid", gap:6}}>
              <label>Send order to shop WhatsApp (optional)</label>
              <input type="tel" inputMode="numeric" pattern="[0-9]*" type="tel" inputMode="numeric" pattern="[0-9]*" value={form.whatsapp} onChange={e=>update("whatsapp", e.target.value)} placeholder="Owner WhatsApp (e.g., 9198XXXXXXXX)" style={{padding:10,border:"1px solid #ddd",borderRadius:10}}/>
              <p className="small">If empty, we use the number in the config.</p>
            </div>

                <div style={{display:"grid", gap:6, gridTemplateColumns:"1fr 1fr"}}>
                  <div>
                    <label htmlFor="nick">Address nickname</label>
                    <select id="nick" value={form.nickname} onChange={e=>update("nickname",e.target.value)}>
                      <option>Home</option>
                      <option>Office</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="name">Name (optional)</label>
                    <input id="name" value={form.name} onChange={e=>update("name", e.target.value)}
                      placeholder="Name on order" style={{padding:10,border:"1px solid #ddd",borderRadius:10}}/>
                  </div>
                </div>

                <div style={{marginTop:12, display:"flex", gap:8}}>
                  <button type="button" className="btn" onClick={()=>setStep(1)}>← Back</button>
                  <button type="button" className="btn" onClick={()=>setStep(3)} disabled={form.address.trim().length < 8}>Next →</button>
                </div>
              </div>
            )}

            {step===3 && (
              <div>
                <div style={{display:"grid", gap:8}}>
                  <div>
                    <label>Payment</label>
                    <div style={{display:"grid", gap:6}}>
                      <label className="badge"><input type="radio" name="pay" value="COD" checked={pay==="COD"} onChange={()=>setPay("COD")}/> &nbsp;Cash on Delivery</label>
                      <details>
                        <summary className="badge">More options</summary>
                        <label className="badge"><input type="radio" name="pay" value="UPI" checked={pay==="UPI"} onChange={()=>setPay("UPI")}/> &nbsp;UPI</label>
                        {pay==="UPI" && (
                          <div style={{padding:10, border:"1px dashed #ddd", borderRadius:10}}>
                            <img src="/assets/upi-qr.svg" alt="UPI QR" width="160" height="160" style={{objectFit:"contain",background:"#fff",border:"1px solid #eee",borderRadius:8}}/>
                            <div className="small" style={{marginTop:6}}><strong>UPI:</strong> {STORE_CONFIG.UPI_ID} ({STORE_CONFIG.UPI_NAME})</div>
                            <a className="btn primary" href={upiDeepLink(subtotal)}>Pay now</a>
                          </div>
                        )}
                      </details>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="wa">Send order to shop WhatsApp (optional)</label>
                    <input id="wa" value={form.whatsapp} onChange={e=>update("whatsapp", e.target.value)}
                      placeholder="Shop WhatsApp number (auto if empty)"
                      style={{padding:10,border:"1px solid #ddd",borderRadius:10}}/>
                    <p className="small">If empty, we use the number in the config.</p>
                  </div>
                </div>

                {error && <div className="small" style={{color:"#b00020", fontWeight:700}}>{error}</div>}

                <div style={{display:"grid", gap:8, gridTemplateColumns:"1fr 1fr"}}>
                  <button type="button" className="btn" onClick={()=>setStep(2)}>← Back</button>
                  <button className="btn primary" type="submit" disabled={disabled}>
                    {placing ? "Placing..." : pay==="COD" ? "Confirm COD" : "Confirm"}
                  </button>
                </div>
              </div>
            )}
          </form>
        </section>

        {/* Cart summary */}
        <aside style={{background:"#fff", border:"1px solid #eee", borderRadius:14, padding:14}}>
          <h3>Summary</h3>
          <div className="small" style={{color:"#374151"}}>No scavenger hunts: primary actions here and bottom.</div>
          <div style={{display:"grid", gap:8, marginTop:8}}>
            {items.length===0 && <div className="small">Your cart is empty.</div>}
            {items.map(i => (
              <div key={i.id} style={{display:"grid", gridTemplateColumns:"64px 1fr auto", gap:10, alignItems:"center"}}>
                <img src={i.image} alt={i.name} width={64} height={64} loading="lazy"/>
                <div><div className="name">{i.name}</div><div className="small">Qty: {i.qty}</div></div>
                <div><strong>₹{(i.qty*i.price).toLocaleString()}</strong></div>
              </div>
            ))}
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