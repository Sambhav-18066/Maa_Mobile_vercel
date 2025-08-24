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
        <div className="actions">
          <button className="badge" onClick={onOpenCart}>
            🛒 Cart <span className="count">{count}</span>
          </button>
          <Link className="badge" href="/checkout">Checkout</Link>
        </div>
      </div>
      <nav className="nav" id="categoryNav"></nav>
    </header>
  );
}