"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function ProductPage(){
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);

  useEffect(()=>{
    if(!id) return;
    fetch("/products.json").then(r=>r.json()).then(all=>{
      setProduct(all.find(p=>p.id===id) || null);
    }).catch(()=>{});
  }, [id]);

  function buyNow(){
    try {
      const cart = JSON.parse(localStorage.getItem("maa_cart_v1")||"[]");
      const ex = cart.find(x=>x.id===product.id);
      if(ex) ex.qty += 1; else cart.push({...product, qty:1});
      localStorage.setItem("maa_cart_v1", JSON.stringify(cart));
      localStorage.setItem("maa_last_items", JSON.stringify(cart));
    } catch {}
    window.location.href="/checkout";
  }

  if(!product) return <main style={{maxWidth:900, margin:"16px auto", padding:"0 16px"}}>Loading…</main>;
  return (
    <main style={{maxWidth:900, margin:"16px auto", padding:"0 16px"}}>
      <img src={product.image} alt={product.name} style={{width:"100%", maxHeight:300, objectFit:"contain", background:"#fafafa", borderRadius:8}} />
      <h1>{product.name}</h1>
      <div className="small" style={{color:"#374151"}}>{product.category}</div>
      <div style={{fontWeight:800, marginTop:6}}>₹{(product.price||0).toLocaleString()}</div>
      <div style={{marginTop:10}}>
        <button className="btn primary" onClick={buyNow}>Buy Now</button>
      </div>
    </main>
  );
}
