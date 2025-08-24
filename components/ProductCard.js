import Link from "next/link";

export default function ProductCard({ product }) {
  return (
    <div className="bg-white p-4 shadow rounded">
      <img src={product.image} alt={product.name} className="h-40 mx-auto"/>
      <h2 className="text-lg font-semibold">{product.name}</h2>
      <p className="text-gray-600">₹{product.price}</p>
      <Link href={`/product/${product._id}`}>
        <button className="bg-primary text-white px-4 py-2 rounded mt-2">View</button>
      </Link>
    </div>
  );
}