
"use client";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import Link from "next/link";

export default function ProductCard({ p }){
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const discount = p.mrp > p.price ? `Save ₹${p.mrp - p.price}` : null;

  function onAdd(e){
    e.stopPropagation();
    e.preventDefault();
    add(p,1);
    setAdded(true);
  }

  return (
    <Link href={`/product/${p.id}`} className="card" style={{textDecoration:"none", color:"inherit", cursor:"pointer"}}>
      <img src={p.image} alt={p.name} />
      <div className="title">{p.name}</div>
      <div className="rating">★ {Number(p.rating).toFixed(1)}</div>
      <div className="price">
        <span className="sell">₹{p.price.toLocaleString()}</span>
        {p.mrp>p.price && <span className="mrp">₹{p.mrp.toLocaleString()}</span>}
      </div>
      {discount && <span className="small" style={{color:"#0a7c0a", fontWeight:700}}>{discount}</span>}
      <button className="btn primary" onClick={onAdd}>
        {added ? "Added ✓" : "Add to cart"}
      </button>
    </Link>
  );
}
