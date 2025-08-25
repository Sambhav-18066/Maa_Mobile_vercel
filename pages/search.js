"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

function debounce(fn, wait){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), wait); }; }
function score(q, p){
  const n = (p.name||"").toLowerCase(), c = (p.category||"").toLowerCase();
  const t = (p.tags||[]).join(" ").toLowerCase();
  const L = (q||"").toLowerCase();
  let s = 0; if(!L) return s;
  if(n.startsWith(L)) s += 5;
  if(n.includes(L)) s += 3;
  if(c.includes(L)) s += 2;
  if(t.includes(L)) s += 1;
  return s;
}

export default function Search(){
  const [all, setAll] = useState([]);
  const [q, setQ] = useState("");
  const [hist, setHist] = useState([]);
  const [suggest, setSuggest] = useState([]);
  const run = useRef(debounce((val, list)=>{
    if(!val){ setSuggest([]); return; }
    const ranked = [...list].map(p=>({p, s:score(val,p)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s).slice(0,8).map(x=>x.p);
    setSuggest(ranked);
  }, 150));

  useEffect(()=>{
    fetch("/products.json").then(r=>r.json()).then(setAll).catch(()=>setAll([]));
    try { setHist(JSON.parse(localStorage.getItem("maa_search_hist")||"[]")); } catch {}
    const urlQ = new URLSearchParams(window.location.search).get("q") || "";
    setQ(urlQ);
  }, []);

  useEffect(()=>{ run.current(q, all); }, [q, all]);

  const results = useMemo(()=>{
    const L = (q||"").trim().toLowerCase();
    if (!L) return [];
    return all.filter(p => score(L, p) > 0);
  }, [q, all]);

  function submit(e){
    e.preventDefault();
    const val = q.trim();
    if (!val) return;
    const h = [val, ...hist.filter(x=>x!==val)].slice(0,10);
    setHist(h);
    localStorage.setItem("maa_search_hist", JSON.stringify(h));
  }

  return (
    <main style={{maxWidth:1000, margin:"16px auto", padding:"0 16px"}}>
      <header className="header">
        <div className="bar">
          <Link className="logo" href="/"><div className="title">Search</div></Link>
          <form onSubmit={submit} style={{display:"flex", gap:8}}>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search products" name="q" />
            <button className="btn primary">Search</button>
          </form>
          <div></div>
        </div>
      </header>

      {q && suggest.length>0 && (
        <section style={{background:"#fff", border:"1px solid #eee", borderRadius:14, padding:14, marginTop:10}}>
          <div style={{fontWeight:800, marginBottom:8}}>Suggestions</div>
          <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
            {suggest.map(p => <Link key={p.id} className="badge" href={"/product/"+p.id}>{p.name}</Link>)}
          </div>
        </section>
      )}

      {hist.length>0 && (
        <section style={{background:"#fff", border:"1px solid #eee", borderRadius:14, padding:14, marginTop:10}}>
          <div style={{fontWeight:800, marginBottom:8}}>Recent searches</div>
          <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
            {hist.map((h,i)=> <a className="badge" key={i} href={"/search?q="+encodeURIComponent(h)}>{h}</a>)}
          </div>
        </section>
      )}

      <section style={{background:"#fff", border:"1px solid #eee", borderRadius:14, padding:14, marginTop:10}}>
        <div style={{fontWeight:800, marginBottom:8}}>Results</div>
        <div style={{display:"grid", gap:12}}>
          {results.map(p => (
            <Link key={p.id} href={"/product/"+p.id} style={{display:"grid", gridTemplateColumns:"90px 1fr auto", gap:12, alignItems:"center", border:"1px solid #eee", borderRadius:10, padding:10}}>
              <img src={p.image} width="90" height="90" alt={p.name} loading="lazy" style={{objectFit:"contain", background:"#fafafa", borderRadius:8}}/>
              <div>
                <div style={{fontWeight:800}}>{p.name}</div>
                <div className="small" style={{color:"#374151"}}>{p.category}</div>
              </div>
              <div style={{fontWeight:800}}>₹{(p.price||0).toLocaleString()}</div>
            </Link>
          ))}
          {q && results.length===0 && <div className="small">No results.</div>}
        </div>
      </section>
    </main>
  );
}
