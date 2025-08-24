
"use client";
import { useEffect, useState } from "react";

const slides = [
  { img: "/assets/mobiles.jpg", caption: "Mobiles & Tablets" },
  { img: "/assets/electronics.jpg", caption: "Best Electronics Deals" },
  { img: "/assets/appliances.jpg", caption: "Home Appliances Offers" },
  { img: "/assets/lpg.jpg", caption: "LPG Booking & Accessories" },
];

export default function HeroCarousel(){
  const [i, setI] = useState(0);
  useEffect(()=>{
    const t = setInterval(()=> setI(p => (p+1)%slides.length), 4000);
    return ()=> clearInterval(t);
  }, []);
  const prev = ()=> setI((i-1+slides.length)%slides.length);
  const next = ()=> setI((i+1)%slides.length);

  return (
    <div style={{position:"relative", overflow:"hidden"}}>
      <img src={slides[i].img} alt={slides[i].caption}
           style={{width:"100%", height:"320px", objectFit:"cover"}}/>
      <button onClick={prev} style={{position:"absolute", left:10, top:"45%", fontSize:24, background:"rgba(0,0,0,.3)", color:"#fff"}}>‹</button>
      <button onClick={next} style={{position:"absolute", right:10, top:"45%", fontSize:24, background:"rgba(0,0,0,.3)", color:"#fff"}}>›</button>
      <div style={{position:"absolute", bottom:10, left:"50%", transform:"translateX(-50%)", display:"flex", gap:6}}>
        {slides.map((_,idx)=>
          <div key={idx} onClick={()=>setI(idx)}
               style={{width:12, height:12, borderRadius:"50%", background: idx===i ? "#fff":"#888", cursor:"pointer"}}/>
        )}
      </div>
    </div>
  );
}
