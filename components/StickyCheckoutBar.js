"use client";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function StickyCheckoutBar(){
  const { count, subtotal } = useCart();
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  useEffect(()=>{
    // hide on checkout and success routes
    const hide = router.pathname.startsWith("/checkout") || router.pathname.startsWith("/success") || router.pathname.startsWith("/admin");
    setVisible(!hide);
  }, [router.pathname]);

  if (!visible || count === 0) return null;

  return (
    <div className="stickyCheckoutBar" role="region" aria-label="Cart summary and checkout">
      <div className="stickyCheckoutContent">
        <div className="stickyCheckoutText">
          <span className="count" aria-live="polite">{count} item{count>1?"s":""}</span>
          <span className="total">₹{subtotal.toLocaleString()}</span>
        </div>
        <Link href="/checkout" className="btn primary big" aria-label="Go to checkout">Checkout</Link>
      </div>
    </div>
  );
}