
"use client";
import { useEffect, useState } from "react";

const slides = [
  { tag: "White · Purple · Gold", title: "Shop Mobiles", img: "/assets/mobiles.svg" },
  { tag: "Electronics", title: "Soundbars, TVs & more", img: "/assets/electronics.svg" },
  { tag: "Home Appliances", title: "Fridges, ACs", img: "/assets/appliances.svg" },
  { tag: "LPG", title: "Cylinders & Accessories", img: "/assets/lpg.svg" },
];

export default function HeroCarousel(){
  const [i, setI] = useState(0);
  useEffect(()=>{
    const t = setInterval(()=> setI(p => (p+1)%slides.length), 4000);
    return ()=> clearInterval(t);
  }, []);
  const s = slides[i];
  return (
    <section className="hero">
      <div>
        <span className="tag">{s.tag}</span>
        <h1>{s.title}</h1>
        <p>Your friendly neighborhood store.</p>
      </div>
      <img src={s.img} alt={s.title} style={{width:"100%", height:180, objectFit:"contain"}}/>
    </section>
  );
}
