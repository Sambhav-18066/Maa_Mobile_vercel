import "@/styles/globals.css";
import { CartProvider } from "@/context/CartContext";
import STORE_CONFIG from "@/lib/storeConfig";
import { useEffect } from "react";

export default function App({ Component, pageProps }) {
  useEffect(()=>{
    const r = document.documentElement.style;
    r.setProperty("--primary", STORE_CONFIG.BRAND.primary);
    r.setProperty("--accent",  STORE_CONFIG.BRAND.accent);
    r.setProperty("--bg",      STORE_CONFIG.BRAND.bg);
    r.setProperty("--text",    STORE_CONFIG.BRAND.text);
    r.setProperty("--faint",   STORE_CONFIG.BRAND.faint);
  }, []);

  return (
    <CartProvider>
      <Component {...pageProps} />
    </CartProvider>
  );
}
<style jsx global>{`
  .skeleton{ position:relative; overflow:hidden; background:#f2f4f7; }
  .skeleton::after{ content:""; position:absolute; inset:0;
    background:linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.6) 50%, rgba(255,255,255,0) 100%);
    transform:translateX(-100%); animation:shimmer 1.2s infinite; }
  @keyframes shimmer { 100% { transform:translateX(100%); } }
`}</style>
