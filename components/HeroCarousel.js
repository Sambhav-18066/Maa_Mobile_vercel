
"use client";
import { useEffect, useState } from "react";

const slides = [
  { img: "/assets/mobiles.svg", caption: "Mobiles & Tablets" },
  { img: "/assets/electronics.svg", caption: "Best of Electronics" },
  { img: "/assets/appliances.svg", caption: "Home Appliances Offers" },
  { img: "/assets/lpg.svg", caption: "LPG Booking & Accessories" },
];

export default function HeroCarousel(){
  const [i, setI] = useState(0);
  useEffect(()=>{
    const t = setInterval(()=> setI(p => (p+1)%slides.length), 4000);
    return ()=> clearInterval(t);
  }, []);
  const prev = ()=> setI(i => (i-1+slides.length)%slides.length);
  const next = ()=> setI(i => (i+1)%slides.length);

  return (
    <section style={{maxWidth:1200, margin:"12px auto 0", position:"relative"}}>
      <div style={{overflow:"hidden", borderRadius:12, border:"1px solid #f1eaff"}}>
        <img src={slides[i].img} alt={slides[i].caption}
             style={{width:"100%", height:"320px", objectFit:"cover", background:"#fafafa"}}/>
      </div>
      <button onClick={prev} style={{position:"absolute", left:12, top:"45%", fontSize:28, lineHeight:1, padding:"4px 10px", border:"none", borderRadius:6, background:"rgba(0,0,0,.35)", color:"#fff", cursor:"pointer"}}>‹</button>
      <button onClick={next} style={{position:"absolute", right:12, top:"45%", fontSize:28, lineHeight:1, padding:"4px 10px", border:"none", borderRadius:6, background:"rgba(0,0,0,.35)", color:"#fff", cursor:"pointer"}}>›</button>
      <div style={{position:"absolute", bottom:10, left:"50%", transform:"translateX(-50%)", display:"flex", gap:8}}>
        {slides.map((_,idx)=>(
          <span key={idx} onClick={()=>setI(idx)} style={{width:10, height:10, borderRadius:"50%", background: idx===i ? "#fff":"#888", opacity:.9, cursor:"pointer"}}/>
        ))}
      </div>
    </section>
  );
}
