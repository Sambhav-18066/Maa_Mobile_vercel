"use client";
import { useEffect, useRef, useState } from "react";

const DEFAULT_SLIDES = [
  { src: "/assets/hero-1.jpg", alt: "Latest smartphones" },
  { src: "/assets/hero-2.jpg", alt: "Accessories deals" },
  { src: "/assets/hero-3.jpg", alt: "Home appliances" },
  { src: "/assets/hero-4.jpg", alt: "Electronics & more" },
];

export default function HeroCarousel() {
  const [idx, setIdx] = useState(0);
  const [slides, setSlides] = useState(DEFAULT_SLIDES);
  const [broken, setBroken] = useState({}); // index -> true when onError

  // auto-rotate
  const timer = useRef();
  useEffect(() => {
    timer.current = setInterval(() => setIdx(i => (i + 1) % slides.length), 4000);
    return () => clearInterval(timer.current);
  }, [slides.length]);

  const prev = () => setIdx(i => (i - 1 + slides.length) % slides.length);
  const next = () => setIdx(i => (i + 1) % slides.length);

  // Render
  return (
    <section style={{marginTop:10}}>
      <div
        onMouseEnter={()=> clearInterval(timer.current)}
        onMouseLeave={()=> timer.current = setInterval(()=> setIdx(i => (i + 1) % slides.length), 4000)}
        style={{position:"relative", overflow:"hidden", borderRadius:14, border:"1px solid #e5e7eb", background:"#fff"}}
      >
        <div
          style={{
            display:"grid",
            gridTemplateColumns:`repeat(${slides.length}, 100%)`,
            transform:`translateX(-${idx*100}%)`,
            transition:"transform .5s ease",
            width:`${slides.length*100}%`
          }}
        >
          {slides.map((s, i) => (
            <div key={i} style={{position:"relative", minHeight:260}}>
              {broken[i] ? (
                // graceful fallback panel
                <div style={{
                  height:260,
                  background:"linear-gradient(135deg,#f1f5f9, #e0f2fe)",
                  display:"grid", placeItems:"center", fontWeight:800, color:"#111827"
                }}>
                  {s.alt || "Maa Mobile"}
                </div>
              ) : (
                <img
                  src={s.src}
                  alt={s.alt || "slide"}
                  style={{width:"100%", height:260, objectFit:"cover", display:"block"}}
                  onError={()=> setBroken(b => ({...b, [i]: true}))}
                  loading={i===0 ? "eager" : "lazy"}
                />
              )}
            </div>
          ))}
        </div>

        {/* controls */}
        <button className="btn" aria-label="Previous"
          onClick={prev}
          style={{position:"absolute", left:10, top:"50%", transform:"translateY(-50%)"}}>‹</button>
        <button className="btn" aria-label="Next"
          onClick={next}
          style={{position:"absolute", right:10, top:"50%", transform:"translateY(-50%)"}}>›</button>

        {/* dots */}
        <div style={{position:"absolute", bottom:10, left:0, right:0, display:"flex", justifyContent:"center", gap:6}}>
          {slides.map((_, i) => (
            <button key={i} className="badge" onClick={()=> setIdx(i)} style={{opacity: i===idx ? 1 : .5}}>
              {i+1}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
