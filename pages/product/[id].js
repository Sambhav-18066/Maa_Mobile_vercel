
"use client";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";

export default function ProductPage({ initial }){
  const { query } = useRouter();
  const { add } = useCart();
  const [all, setAll] = useState(initial ? [initial] : []);
  const [p, setP] = useState(initial || null);

  useEffect(()=>{ if(!initial){ fetch("/products.json").then(r=>r.json()).then(setAll); } }, [initial]);
  useEffect(()=>{
    if(query.id && all.length){ setP(all.find(x=>x.id===query.id)); }
  }, [query.id, all]);

  if(!p) return (
    <>
      <Head>
        <title>Product • Maa Mobile</title>
      </Head>
      <main style={{maxWidth:1000,margin:"20px auto",padding:"0 16px"}}>Loading…</main>;

  return (
    <>
      <Head>
        <title>{p ? p.name + ' • Maa Mobile' : 'Product • Maa Mobile'}</title>
        <meta name="description" content={p ? p.name + ' — Buy locally with delivery' : 'Local product'} />
        <meta property="og:title" content={p ? p.name : 'Product'} />
      </Head>

    <main style={{maxWidth:1000, margin:"20px auto", padding:"0 16px"}}>
      <nav style={{marginBottom:10}}><Link href="/">← Back to Home</Link></nav>
      <div style={{display:"grid", gridTemplateColumns:"420px 1fr", gap:20, alignItems:"start"}}>
        <div style={{border:"1px solid #eee", borderRadius:8, padding:10, textAlign:"center"}}>
          <img src={p.image} alt={p.name} style={{width:"100%", height:360, objectFit:"contain"}}/>
        </div>
        <div>
          <h1 style={{margin:"0 0 8px"}}>{p.name}</h1>
          <div style={{color:"#388e3c", fontWeight:800, fontSize:20}}>₹{p.price.toLocaleString()}</div>
          {p.mrp>p.price && <div style={{textDecoration:"line-through", color:"#666"}}>₹{p.mrp.toLocaleString()}</div>}
          <div style={{margin:"10px 0"}}>Rating: ★ {Number(p.rating).toFixed(1)}</div>
          <p style={{maxWidth:540}}>{p.description}</p>
          <div style={{display:"flex", gap:10, marginTop:12}}>
            <button className="btn primary" onClick={()=>add(p,1)}>Add to cart</button>
            <Link className="btn" href="/checkout">Buy Now</Link>
          </div>
          <ul style={{marginTop:16, color:"#333"}}>
            <li>Free delivery & easy returns</li>
            <li>1 year standard warranty</li>
            <li>Cash on Delivery & UPI supported</li>
          </ul>
        </div>
      </div>
    </main>
    </>

  );
}

export async function getStaticPaths(){
  const products = require("../../public/products.json");
  return { paths: products.map(p => ({ params: { id: p.id } })), fallback: false };
}
export async function getStaticProps({ params }){
  const products = require("../../public/products.json");
  const initial = products.find(p => p.id === params.id) || null;
  return { props: { initial } };
}
