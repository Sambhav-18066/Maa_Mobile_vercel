import "@/styles/globals.css";
import { CartProvider } from "@/context/CartContext";
import StickyCheckoutBar from "@/components/StickyCheckoutBar";
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

  useEffect(()=>{
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(()=>{});
    }
  }, []);

  return (
    <CartProvider>
      <StickyCheckoutBar />
      <Component {...pageProps} />
    </CartProvider>
  );
}