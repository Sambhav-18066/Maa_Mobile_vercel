
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProductRow({ title, category }) {
  const [all, setAll] = useState([]);
  useEffect(() => {
    fetch("/products.json").then(r => r.json()).then(setAll);
  }, []);

  const items = all.filter(p => p.category === category).slice(0, 6);

  return (
    <section style={{margin:"20px auto", maxWidth:1200, background:"#fff", borderRadius:8, padding:12}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10}}>
        <h2 style={{fontSize:20, fontWeight:"700"}}>{title}</h2>
        <Link href={`/#${category}`} className="btn">View all</Link>
      </div>
      <div style={{display:"flex", gap:12, overflowX:"auto", paddingBottom:10}}>
        {items.map(p => (
          <div key={p.id} style={{minWidth:180, border:"1px solid #eee", borderRadius:8, padding:8, flexShrink:0, textAlign:"center"}}>
            <Link href={`/product/${p.id}`}>
              <img src={p.image} alt={p.name} style={{width:"100%", height:140, objectFit:"contain"}}/>
              <div style={{fontWeight:"600", marginTop:6}}>{p.name}</div>
              <div style={{color:"green", fontWeight:"700"}}>₹{p.price}</div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
