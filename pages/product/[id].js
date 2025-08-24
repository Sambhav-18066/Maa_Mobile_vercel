
"use client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";

export default function ProductPage(){
  const { query } = useRouter();
  const [p,setP] = useState(null);
  useEffect(()=>{
    if(query.id){
      fetch("/products.json").then(r=>r.json()).then(all=>{
        setP(all.find(x=>x.id===query.id));
      });
    }
  }, [query.id]);
  if(!p) return <div style={{padding:20}}>Loading…</div>;
  return (
    <main style={{maxWidth:900, margin:"20px auto", padding:20}}>
      <h1>{p.name}</h1>
      <img src={p.image} alt={p.name} style={{width:300, height:300, objectFit:"contain"}}/>
      <p>{p.description}</p>
      <p><strong>₹{p.price}</strong> &nbsp;<s>₹{p.mrp}</s></p>
      <p>Rating: ★ {p.rating}</p>
      <ProductCard p={p}/>
    </main>
  );
}
