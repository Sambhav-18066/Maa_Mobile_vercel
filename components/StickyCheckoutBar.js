"use client";
import Link from "next/link";
import { useMemo } from "react";
import { useCart } from "@/context/CartContext";

export default function StickyCheckoutBar(){
  const { items } = useCart();
  const subtotal = useMemo(()=> items.reduce((s,i)=>s+i.qty*i.price,0), [items]);
  const count = useMemo(()=> items.reduce((n,i)=>n+i.qty,0), [items]);
  if(!count) return null;
  return (
    <div style={{
      position:"fixed", left:0, right:0, bottom:0, zIndex:999,
      background:"var(--primary,#0b59ff)", color:"#fff", display:"flex", alignItems:"center",
      justifyContent:"space-between", padding:"12px 14px", boxShadow:"0 -6px 20px rgba(0,0,0,.18)"
    }}>
      <div style={{fontWeight:700, fontSize:16}}>
        🛒 {count} item{count>1?"s":""} · ₹{subtotal.toLocaleString("en-IN")}
      </div>
      <Link href="/checkout" className="btn"
        style={{background:"#fff", color:"var(--primary,#0b59ff)", padding:"10px 16px", borderRadius:10, fontWeight:700}}>
        Checkout
      </Link>
    </div>
  );
}
