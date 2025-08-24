import { useEffect, useState } from "react";

export default function Admin() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("/api/orders").then(res => res.json()).then(setOrders);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <table className="w-full border">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Items</th>
            <th>Payment</th>
            <th>Address</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o, i) => (
            <tr key={i} className="border-t">
              <td>{o.customer}</td>
              <td>{o.items.map(i => i.name).join(", ")}</td>
              <td>{o.payment}</td>
              <td>{o.address}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}