"use client";
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import STORE_CONFIG from "@/lib/storeConfig";
import HeroCarousel from "@/components/HeroCarousel";
import ProductRow from "@/components/ProductRow";

export default function Home(){
  const [all, setAll] = useState([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(()=>{
    fetch("/products.json").then(r=>r.json()).then(setAll);
  }, []);

  const list = useMemo(()=>{
    const qlc = q.toLowerCase();
    return all.filter(p=>
      (cat==="All" || p.category===cat) &&
      (!q || p.name.toLowerCase().includes(qlc) || (p.brand||'').toLowerCase().includes(qlc))
    );
  }, [all, q, cat]);

  return (
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