"use client";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ p }){
  const { add } = useCart();
  const discount = p.mrp > p.price ? `Save ₹${p.mrp - p.price}` : null;
  return (
    <article className="card">
      <img src={p.image} alt={p.name} />
      <div className="title">{p.name}</div>
      <div className="rating">★ {p.rating.toFixed(1)}</div>
      <div className="price">
        <span className="sell">₹{p.price.toLocaleString()}</span>
        {p.mrp>p.price && <span className="mrp">₹{p.mrp.toLocaleString()}</span>}
      </div>
      {discount && <span className="small" style={{color:"#0a7c0a", fontWeight:700}}>{discount}</span>}
      <button className="btn primary" onClick={()=>add(p,1)}>Add to cart</button>
    </article>
  );
}