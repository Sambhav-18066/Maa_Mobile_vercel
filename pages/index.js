"use client";
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import STORE_CONFIG from "@/lib/storeConfig";
import HeroCarousel from "@/components/HeroCarousel";
import DealsBanner from "@/components/DealsBanner";
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

      {/* your top category nav stays as-is */}
      <nav className="nav">
        {STORE_CONFIG.CATEGORIES.map(c => (
          <button
            key={c}
            className={c===cat ? "active": ""}
            onClick={()=>setCat(c)}
          >
            {c}
          </button>
        ))}
      </nav>

      {/* NEW: sub-category chips ON THE HOME SCREEN (above hero) */}
      <section aria-label="Quick categories" style={{marginTop:6}}>
        <div className="subcats">
          <div className="subcat">
            <div className="title">Mobile Phone</div>
            <div className="chips">
              <a className="chip" href="/search?q=smartphone">Smart phone</a>
              <a className="chip" href="/search?q=feature phone">Feature phones</a>
              <a className="chip" href="/search?q=Samsung">Samsung</a>
              <a className="chip" href="/search?q=Apple">Apple</a>
              <a className="chip" href="/search?q=Lava">Lava</a>
              <a className="chip" href="/search?q=Itel">Itel</a>
              <a className="chip" href="/search?q=HMD Nokia">HMD (Nokia)</a>
            </div>
          </div>

          <div className="subcat">
            <div className="title">Accessories</div>
            <div className="chips">
              <a className="chip" href="/search?q=charger">charger</a>
              <a className="chip" href="/search?q=cables">cables</a>
              <a className="chip" href="/search?q=aux">aux cords</a>
              <a className="chip" href="/search?q=sd card">sd cards</a>
              <a className="chip" href="/search?q=cover">cover</a>
              <a className="chip" href="/search?q=earphones">earphones</a>
              <a className="chip" href="/search?q=headphones">headphones</a>
              <a className="chip" href="/search?q=bluetooth speaker">bluetooth speakers</a>
            </div>
          </div>

          <div className="subcat">
            <div className="title">LPG</div>
            <div className="chips">
              <a className="chip" href="/search?q=Bharat Gas cylinder">book Bharat cylinder</a>
              <a className="chip" href="/search?q=Indane cylinder">book Indane cylinder</a>
              <a className="chip" href="/search?q=lpg pipe">lpg home pipe</a>
              <a className="chip" href="/search?q=lpg regulator">regulator</a>
              <a className="chip" href="/search?q=gas stove">gas stove</a>
              <a className="chip" href="/search?q=lpg fittings">fittings</a>
            </div>
          </div>

          <div className="subcat">
            <div className="title">Electronics</div>
            <div className="chips">
              <a className="chip" href="/search?q=switches">switches</a>
              <a className="chip" href="/search?q=lights">lights</a>
              <a className="chip" href="/search?q=modular switches">modular switches</a>
              <a className="chip" href="/search?q=door bell">door bells</a>
              <a className="chip" href="/search?q=tube light">tube light</a>
              <a className="chip" href="/search?q=wires">wires</a>
            </div>
          </div>

          <div className="subcat">
            <div className="title">Home Appliances</div>
            <div className="chips">
              <a className="chip" href="/search?q=tv">tv</a>
              <a className="chip" href="/search?q=fridge">fridge</a>
              <a className="chip" href="/search?q=ac">ac</a>
              <a className="chip" href="/search?q=ceiling fan">ceiling fan</a>
              <a className="chip" href="/search?q=table fan">table fan</a>
              <a className="chip" href="/search?q=induction">induction</a>
              <a className="chip" href="/search?q=water heater">water heater</a>
              <a className="chip" href="/search?q=kettle">kettle</a>
              <a className="chip" href="/search?q=home theater">home theater</a>
              <a className="chip" href="/search?q=soundbar">sound bar</a>
            </div>
          </div>
        </div>
      </section>

      {/* your original blocks continue unchanged */}
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
        <a
          className="btn gold"
          target="_blank"
          rel="noopener"
          href={`https://wa.me/${STORE_CONFIG.ADMIN_WHATSAPP_NUMBER || ""}?text=${encodeURIComponent("Hi, I have a question for Maa Mobile.")}`}
        >
          WhatsApp Us
        </a>
      </footer>

      <CartDrawer open={cartOpen} onClose={()=>setCartOpen(false)} />
    </>
  );
}
