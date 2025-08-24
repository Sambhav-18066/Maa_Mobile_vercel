export default function ProductCard({ product }) {
  return (
    <div className="bg-white p-4 shadow rounded hover:shadow-lg transition">
      <img src={product.image || "/logo.png"} alt={product.name} className="h-40 mx-auto"/>
      <h2 className="text-lg font-semibold mt-2">{product.name}</h2>
      <p className="text-gray-600">₹{product.price}</p>
      <button className="bg-primary text-white px-4 py-2 rounded mt-2">Add to Cart</button>
    </div>
  );
}