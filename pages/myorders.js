
"use client";
import { useState } from "react";

export default function MyOrders() {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchOrders() {
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/orders/byPhone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone })
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || "Failed");
      setOrders(j.orders);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 1000, margin: "20px auto", padding: "0 16px" }}>
      <h1>My Orders</h1>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="Enter your phone number"
          style={{ padding: 10, flex: 1, border: "1px solid #ddd", borderRadius: 8 }}
        />
        <button className="btn primary" onClick={fetchOrders} disabled={loading}>
          {loading ? "Loading..." : "Find Orders"}
        </button>
      </div>
      {error && <div style={{ color: "crimson" }}>{error}</div>}

      {orders.map(o => (
        <div key={o.id} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 10, padding: 12, marginBottom: 12 }}>
          <div style={{ fontWeight: 800 }}>Order {o.id} — {o.status}</div>
          <div className="small">Placed: {new Date(o.created_at).toLocaleString()}</div>
          <div className="small">Total: ₹{o.total}</div>
          <div style={{ marginTop: 6 }}>
            {o.items?.map(i => (
              <div key={i.id} className="small">- {i.name} × {i.qty}</div>
            ))}
          </div>
        </div>
      ))}

      {orders.length === 0 && !loading && <div className="small">No orders found for this number.</div>}
    </main>
  );
}
