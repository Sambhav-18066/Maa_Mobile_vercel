"use client";
import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try { setItems(JSON.parse(localStorage.getItem("maa_cart_v1") || "[]")); }
    catch { setItems([]); }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("maa_cart_v1", JSON.stringify(items));
  }, [items]);

  const add = (product, qty=1) => {
    setItems(prev => {
      const i = prev.find(x=>x.id===product.id);
      if(i){ return prev.map(x=> x.id===product.id ? {...x, qty: Math.max(1, x.qty + qty)} : x); }
      return [...prev, { id: product.id, name: product.name, price: product.price, image: product.image, qty }];
    });
  };
  const addId = (id, d=1) => setItems(prev => prev.flatMap(x => x.id===id ? (x.qty + d < 1 ? [] : [{...x, qty: x.qty + d}]) : [x]));
  const removeId = (id) => setItems(prev => prev.filter(x=>x.id!==id));
  const clear = ()=> setItems([]);

  const count = items.reduce((n,i)=>n+i.qty,0);
  const subtotal = items.reduce((s,i)=>s+i.qty*i.price,0);

  return (
    <CartContext.Provider value={{items, add, addId, removeId, clear, count, subtotal}}>
      {children}
    </CartContext.Provider>
  );
}
export function useCart(){ return useContext(CartContext); }