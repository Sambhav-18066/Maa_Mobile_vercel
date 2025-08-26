// pages/admin/orders.jsx
import { useEffect, useMemo, useState } from "react";

function inr(n) {
  const v = Number.isFinite(n) ? n : 0;
  return `₹${v.toLocaleString("en-IN")}`;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState(""); // "", "PLACED", "CONFIRMED", ...
  const [limit, setLimit] = useState(50);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (limit) params.set("limit", String(limit));
      const res = await fetch(`/api/orders/list?${params.toString()}`, { method: "GET" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || JSON.stringify(json));
      setOrders(Array.isArray(json.orders) ? json.orders : []);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []); // initial load

  const rows = useMemo(() => orders.map(o => ({
    id: o.id,
    created_at: o.created_at,
    status: o.status,
    address_name: o.address_name || o.address?.name || "",
    address_phone: o.address_phone || o.address?.phone || "",
    address_line1: o.address_line1 || o.address?.line1 || "",
    item_count: Number.isFinite(o.item_count) ? o.item_count
               : (Array.isArray(o.items) ? o.items.reduce((s,i)=>s+(i?.qty||0), 0) : 0),
    total_rupees: (o.total_rupees ?? (o.total_paise ? o.total_paise/100 : 0)),
  })), [orders]);

  return (
    <div style={{padding: 16}}>
      <h1 style={{marginBottom: 12}}>Orders</h1>

      <div style={{display:"flex", gap: 8, alignItems:"center", marginBottom: 12}}>
        <label>Status:</label>
        <select value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="">All</option>
          {["PLACED","CONFIRMED","PACKED","OUT_FOR_DELIVERY","DELIVERED","RETURNED","CANCELLED"].map(s =>
            <option key={s} value={s}>{s}</option>
          )}
        </select>

        <label style={{marginLeft:12}}>Limit:</label>
        <input type="number" min={1} max={200} value={limit}
          onChange={e=>setLimit(Math.max(1, Math.min(200, Number(e.target.value)||50)))} style={{width:80}}/>

        <button onClick={load} disabled={loading}>
          {loading ? "Loading..." : "Reload"}
        </button>
      </div>

      {err ? <div style={{color:"crimson", marginBottom: 12}}>Error: {err}</div> : null}

      <OrdersTable rows={rows} />
    </div>
  );
}

function OrdersTable({ rows }) {
  if (!rows.length) return <div>No orders yet.</div>;
  return (
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%", borderCollapse:"collapse"}}>
        <thead>
          <tr>
            <Th>Order ID</Th>
            <Th>Created</Th>
            <Th>Status</Th>
            <Th>Name</Th>
            <Th>Phone</Th>
            <Th>Address</Th>
            <Th>Items</Th>
            <Th>Total</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <Td mono>{r.id}</Td>
              <Td>{new Date(r.created_at).toLocaleString("en-IN")}</Td>
              <Td>{r.status}</Td>
              <Td>{r.address_name || "-"}</Td>
              <Td>{r.address_phone || "-"}</Td>
              <Td>{r.address_line1 || "-"}</Td>
              <Td>{r.item_count}</Td>
              <Td strong>{inr(r.total_rupees)}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }) {
  return <th style={{textAlign:"left", padding:"8px 6px", borderBottom:"1px solid #ddd", fontWeight:600}}>{children}</th>;
}
function Td({ children, mono, strong }) {
  return <td style={{
    padding:"8px 6px",
    borderBottom:"1px solid #f0f0f0",
    fontFamily: mono ? "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" : "inherit",
    fontWeight: strong ? 600 : 400
  }}>{children}</td>;
}
