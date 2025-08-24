import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("/api/products").then(res => res.json()).then(setProducts);
  }, []);

  return (
    <div className="bg-gradient-purple min-h-screen">
      <header className="bg-white shadow p-4 flex justify-between">
        <h1 className="text-2xl font-bold text-primary">MaaMobile</h1>
        <input type="text" placeholder="Search..." className="border rounded px-4 py-2"/>
      </header>
      <main className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p._id} product={p}/>
        ))}
      </main>
    </div>
  );
}