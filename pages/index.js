"use client";
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import STORE_CONFIG from "@/lib/storeConfig";
import HeroCarousel from "@/components/HeroCarousel";
import DealsBanner from "@/components/DealsBanner";
import ProductRow from "@/components/ProductRow";
import Head from "next/head";

export default function Home(){
const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(()=>{
    fetch("/products.json").then(r=>r.json()).then(d=>{ setAll(d); setLoading(false); });
  }, []);

  const list = useMemo(()=>{
    const qlc = q.toLowerCase();
    return all.filter(p=>
      (cat==="All" || p.category===cat) &&
      (!q || p.name.toLowerCase().includes(qlc) || (p.brand||'').toLowerCase().includes(qlc))
    );
  }, [all, q, cat]);

  return (
    <>\n  <Head>
    <title>Maa Mobile — Mobiles, Electronics, LPG • 30km delivery</title>
    <meta name="description" content="Local store for mobiles, TVs, ACs, LPG. Free delivery within 30km. COD & UPI." />
    <meta property="og:title" content="Maa Mobile" />
    <meta property="og:description" content="Local electronics + LPG with fast delivery." />
    <meta property="og:image" content="/assets/hero-mobiles.svg" />
    <meta name="theme-color" content="#6a42f5" />
    <link rel="manifest" href="/manifest.json" />
  </Head>
\n    </>
    <>
      <Header onSearch={setQ} onOpenCart={()=>setCartOpen(true)} />
      <nav className="nav">
        {STORE_CONFIG.CATEGORIES.map(c => (
          <button key={c}
            className={c===cat ? "active": ""}
            onClick={()=>setCat(c)}>{c}</button>
        ))}
      </nav>

      <HeroCarousel/>
<DealsBanner/>
<ProductRow title='Best of Electronics' category='Electronics'/>
<ProductRow title='Best of Home Appliances' category='Home Appliances'/>



      <div className="notice">
        Free delivery within 30 km radius. Cash on Delivery available. UPI payments supported. LPG bookings accepted.
      </div>

      <main className="grid">
        {list.map(p => (<ProductCard key={p.id} p={p} />))}
        {list.length===0 && <div className="small">No items match your search.</div>}
      </main>

      <footer className="footer small">
        <span>© {new Date().getFullYear()} Maa Mobile</span>
        <a className="btn" href="/checkout">Go to Checkout</a>
        <a className="btn gold" target="_blank" rel="noopener"
           href={`https://wa.me/${STORE_CONFIG.ADMIN_WHATSAPP_NUMBER || ""}?text=${encodeURIComponent("Hi, I have a question for Maa Mobile.")}`}>
          WhatsApp Us
        </a>
      </footer>

      <CartDrawer open={cartOpen} onClose={()=>setCartOpen(false)} />
    </>
  );
}