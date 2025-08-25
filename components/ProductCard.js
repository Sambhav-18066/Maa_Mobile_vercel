import React from "react";

export default function ProductCard({ p }){
  function getCart(){ try { return JSON.parse(localStorage.getItem("maa_cart_v1")||"[]"); } catch { return []; } }
  function setCart(c){ localStorage.setItem("maa_cart_v1", JSON.stringify(c)); }

  function add(){
    const cart = getCart();
    const ex = cart.find(x=>x.id===p.id);
    if (ex) ex.qty += 1; else cart.push({...p, qty: 1});
    setCart(cart);
    localStorage.setItem("maa_last_items", JSON.stringify(cart));
  }
  function buyNow(){
    add();
    sessionStorage.setItem("maa_buy_now","1");
    window.location.href="/checkout";
  }

  return (
    <div className="product-card">
      <img src={p.image} alt={p.name} loading="lazy" style={{width:"100%", height:160, objectFit:"contain", background:"#fafafa", borderRadius:8}} />
      <div style={{fontWeight:800, marginTop:6}}>{p.name}</div>
      <div className="small" style={{color:"#374151"}}>{p.category}</div>
      <div style={{fontWeight:800, marginTop:6}}>₹{p.price?.toLocaleString?.() || p.price}</div>
      <div className="actions" style={{marginTop:8, display:"flex", gap:8, flexWrap:"wrap"}}>
        <button className="btn" onClick={add}>Add to cart</button>
        <button className="btn primary" onClick={buyNow}>Buy Now</button>
      </div>
    </div>
  );
}
