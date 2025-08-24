"use client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Success(){
  const { query } = useRouter();
  const [oid, setOid] = useState("");
  const [wa, setWa] = useState("");

  useEffect(()=>{
    if(query){
      setOid(query.oid || "N/A");
      setWa(query.wa ? decodeURIComponent(query.wa) : "");
    }
  }, [query]);

  return (
    <main style={{maxWidth:720, margin:"48px auto", padding:"0 16px", textAlign:"center"}}>
      <img src="/assets/logo.svg" width="56" height="56" alt="logo" />
      <h1>Order placed 🎉</h1>
      <p className="small">Your order ID: <strong>{oid}</strong></p>
      <div style={{display:"flex", gap:10, justifyContent:"center", marginTop:10}}>
        <a className="btn primary" href="/">Continue shopping</a>
        {wa && <a className="btn gold" target="_blank" rel="noopener" href={wa}>Send details via WhatsApp</a>}
      </div>
    </main>
  );
}