"use client";
import Link from "next/link";
import Image from "next/image";
import STORE_CONFIG from "@/lib/storeConfig";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

export default function Header({ onSearch, onOpenCart }){
  const { count } = useCart();
  const [q, setQ] = useState("");

  return (
    <header className="header">
      <div className="bar">
        <Link className="logo" href="/">
          <Image src="/assets/logo.svg" alt="Maa Mobile" width={36} height={36}/>
          <div className="title">{STORE_CONFIG.NAME}</div>
        </Link>
        <div className="search">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search for mobiles, TVs, ACs, LPG…"/>
          <button onClick={()=>onSearch?.(q)}>Search</button>
        </div>
        <div className="actions"><button id="a2hs" className="badge" style={{display:"none"}} onClick={()=>window.__maa_a2hs?.()}>Add to Home</button>
          <button className="badge" onClick={onOpenCart}>
            🛒 Cart <span className="count">{count}</span>
          </button>
          <Link className="badge" href="/myorders">My Orders</Link>
          <Link className="badge" href="/checkout">Checkout</Link>
        </div>
      </div>
      <nav className="nav" id="categoryNav"></nav>
    
        <script dangerouslySetInnerHTML={{__html:`
          (function(){
            let deferredPrompt;
            window.addEventListener('beforeinstallprompt', (e)=>{ e.preventDefault(); deferredPrompt = e; 
              const btn = document.getElementById('a2hs'); if (btn) btn.style.display='inline-flex';
            });
            window.__maa_a2hs = function(){ if (deferredPrompt){ deferredPrompt.prompt(); deferredPrompt.userChoice.finally(()=>{ const btn = document.getElementById('a2hs'); if (btn) btn.style.display='none'; deferredPrompt=null; }); } };
          })();
        `}} />
        </header>
        
  );
}