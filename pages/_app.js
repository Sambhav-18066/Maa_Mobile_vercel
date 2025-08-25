import { useEffect } from "react";
import "../styles/globals.css";

function mmSend(type, meta){
  try{
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify({ type, meta })], { type: "application/json" });
      navigator.sendBeacon("/api/analytics/log", blob);
    } else {
      fetch("/api/analytics/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, meta })
      });
    }
  } catch {}
}

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    mmSend("pageview", { path: window.location.pathname });
  }, []);
  return <Component {...pageProps} />;
}
