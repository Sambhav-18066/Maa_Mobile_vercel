"use client";
import { useCart } from "@/context/CartContext";
import { useEffect, useRef } from "react";

export default function CartDrawer({ open, onClose }){
  const { items, addId, removeId, subtotal, count } = useCart();
  const ref = useRef();

  useEffect(()=>{
    function onEsc(e){ if(e.key === "Escape") onClose?.(); }
    document.addEventListener("keydown", onEsc);
    return ()=> document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  return (
    <aside className={`cartDrawer ${open ? "open":""}`} ref={ref}>
      <header className="cartHeader">
        <strong>Your Cart</strong>
        <button onClick={onClose}>✕</button>
      </header>
      <div className="cartItems">
        {items.length === 0 ? <div className="small">Your cart is empty.</div> :
          items.map(i => (
            <div className="cartItem" key={i.id}>
              <img src={i.image} alt={i.name} width={64} height={64}/>
              <div>
                <div className="name">{i.name}</div>
                <div className="small">₹{i.price.toLocaleString()}</div>
                <div className="qty">
                  <button onClick={()=>addId(i.id,-1)}>−</button>
                  <span>{i.qty}</span>
                  <button onClick={()=>addId(i.id, 1)}>+</button>
                  <button style={{marginLeft:"auto"}} onClick={()=>removeId(i.id)}>Remove</button>
                </div>
              </div>
              <div><strong>₹{(i.price*i.qty).toLocaleString()}</strong></div>
            </div>
          ))
        }
      </div>
      <div className="cartTotal">
        <div className="cartRow"><span>Items</span><span>{count}</span></div>
        <div className="cartRow"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
        <div className="cartRow total"><span>Total</span><span>₹{subtotal.toLocaleString()}</span></div>
        <div style={{display:"flex", gap:10}}>
          <a className="btn" href="/checkout">Checkout</a>
        </div>
      </div>
    </aside>
  );
}