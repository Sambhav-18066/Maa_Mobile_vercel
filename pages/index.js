"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ProductCard from "../components/ProductCard";

// utils
function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }
function autoAdvance(fn, ms){ let t; const start=()=>t=setInterval(fn, ms); const stop=()=>{ if(t) clearInterval(t); }; return { start, stop }; }

export default function Home(){
  // load products
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{
    let on = true;
    fetch("/products.json").then(r=>r.json()).then(d=>{ if(on){ setAll(Array.isArray(d)?d:[]); setLoading(false); } }).catch(()=>setLoading(false));
    return ()=>{ on=false; }
  }, []);

  // hero (4 slides; safe fallback)
  const hero = useMemo(()=>[
    { src: "/assets/hero-1.jpg", alt: "Latest smartphones" },
    { src: "/assets/hero-2.jpg", alt: "Accessories deals" },
    { src: "/assets/hero-3.jpg", alt: "Home appliances" },
    { src: "/assets/hero-4.jpg", alt: "Electronics & more" } // this is the historically-missing slide
  ],[]);
  const [idx, setIdx] = useState(0);
  const totalSlides = hero.length;
  const rotator = useRef(null);
  useEffect(()=>{
    rotator.current = autoAdvance(()=> setIdx(i => (i+1)%totalSlides), 4000);
    rotator.current.start();
    return rotator.current.stop;
  }, [totalSlides]);
  const go = (i)=> setIdx(clamp(i,0,totalSlides-1));
  const prev = ()=> setIdx(i => (i-1+totalSlides)%totalSlides);
  const next = ()=> setIdx(i => (i+1)%totalSlides);

  // derived product sets
  const featured = useMemo(()=> all.slice(0, 8), [all]);
  const mobiles  = useMemo(()=> all.filter(p => (p.category||"").toLowerCase().includes("mobile")).slice(0,8), [all]);

  // search
  const [q, setQ] = useState("");
  const submitSearch = (e)=>{ e.preventDefault(); const term=q.trim(); if(term){ window.location.href="/search?q="+encodeURIComponent(term); } };

  return (
    <main className="page" style={{maxWidth:1120, margin:"0 auto", padding:"0 16px"}}>
      {/* HEADER */}
      <header className="header" style={{padding:"10px 0"}}>
        <div className="bar" style={{display:"grid", gridTemplateColumns:"auto 1fr auto", alignItems:"center", gap:12}}>
          <Link className="logo" href="/" style={{display:"flex", alignItems:"center", gap:10, textDecoration:"none"}}>
            <img src="/assets/logo.svg" alt="logo" width="36" height="36" />
            <div className="title">Maa Mobile</div>
          </Link>

          {/* search */}
          <form onSubmit={submitSearch} style={{display:"flex", gap:8, justifySelf:"center"}}>
            <input
              value={q}
              onChange={(e)=>setQ(e.target.value)}
              placeholder="Search phones, accessories, LPG, appliances…"
              aria-label="Search"
              style={{minWidth:320}}
            />
            <button className="btn primary">Search</button>
          </form>

          <div style={{textAlign:"right"}}>
            <Link className="badge" href="/myorders">My Orders</Link>
          </div>
        </div>
      </header>

      {/* SUB-CATEGORIES — ON HOME SCREEN (full width, above hero) */}
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

      {/* HERO */}
      <section className="section" style={{marginTop:10}}>
        <div
          onMouseEnter={()=>rotator.current?.stop()}
          onMouseLeave={()=>rotator.current?.start()}
          onTouchStart={()=>rotator.current?.stop()}
          onTouchEnd={()=>rotator.current?.start()}
          style={{position:"relative", overflow:"hidden", borderRadius:14, border:"1px solid #e5e7eb", background:"#fff"}}
        >
          <div
            style={{
              display:"grid",
              gridTemplateColumns:`repeat(${totalSlides}, 100%)`,
              transform:`translateX(-${idx*100}%)`,
              transition:"transform .5s ease",
              width:`${totalSlides*100}%`
            }}
          >
            {hero.map((h, i)=>(
              <div key={i} style={{position:"relative"}}>
                <img
                  src={h.src}
                  alt={h.alt}
                  onError={(e)=>{ e.currentTarget.src="/assets/hero-fallback.jpg"; }}
                  style={{width:"100%", height:260, objectFit:"cover", display:"block"}}
                  loading={i===0?"eager":"lazy"}
                />
              </div>
            ))}
          </div>

          <button className="btn" aria-label="Previous" onClick={prev}
                  style={{position:"absolute", left:10, top:"50%", transform:"translateY(-50%)"}}>‹</button>
          <button className="btn" aria-label="Next" onClick={next}
                  style={{position:"absolute", right:10, top:"50%", transform:"translateY(-50%)"}}>›</button>

          <div style={{position:"absolute", bottom:10, left:0, right:0, display:"flex", justifyContent:"center", gap:6}}>
            {hero.map((_,i)=>(
              <button key={i} onClick={()=>go(i)} aria-label={`Go to slide ${i+1}`} className="badge" style={{opacity: i===idx?1:.5}}>
                {i+1}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="section" style={{marginTop:16}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8}}>
          <h2 style={{margin:0}}>Featured</h2>
          <Link className="badge" href="/search?q=best">See all</Link>
        </div>
        <div style={{display:"grid", gap:12, gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))"}}>
          {loading && Array.from({length:8}).map((_,i)=>(
            <div key={i} style={{height:240, border:"1px solid #eee", borderRadius:14, background:"#fff"}} />
          ))}
          {!loading && featured.map(p=>(
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      {/* MOBILES */}
      <section className="section" style={{marginTop:16, marginBottom:24}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8}}>
          <h2 style={{margin:0}}>Mobiles</h2>
          <Link className="badge" href="/search?q=smartphone">Browse smartphones</Link>
        </div>
        <div style={{display:"grid", gap:12, gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))"}}>
          {loading && Array.from({length:8}).map((_,i)=>(
            <div key={i} style={{height:240, border:"1px solid #eee", borderRadius:14, background:"#fff"}} />
          ))}
          {!loading && mobiles.map(p=>(
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>
    </main>
  );
}
