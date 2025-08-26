// pages/admin2.jsx
import { useEffect, useMemo, useState } from "react";

function Inr({ v }) {
  const n = Number(v || 0);
  return <span>₹{n.toLocaleString("en-IN")}</span>;
}

export default function Admin2() {
  const [key, setKey] = useState("");
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("");
  const [limit, setLimit] = useState(50);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const hasKey = !!key?.trim();

  async function reload() {
    if (!hasKey) return;
    setLoading(true); setErr("");
    try {
      const p = new URLSearchParams();
      p.set("limit", String(limit));
      if (status) p.set("status", status);
      p.set("_", String(Date.now()));
      const res = await fetch(`/api/admin/orders/list?${p.toString()}`, {
        headers: { "x-admin-key": key },
        cache: "no-store"
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.message || JSON.stringify(j));
      setOrders(Array.isArray(j.orders) ? j.orders : []);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { /* no auto-load until key set */ }, []);

  async function doAction(id, action) {
    if (!hasKey) return;
    const p = new URLSearchParams({ id, action, "_": String(Date.now()) });
    const res = await fetch(`/api/admin/orders/update?${p.toString()}`, {
      headers: { "x-admin-key": key },
      cache: "no-store"
    });
    const j = await res.json();
    if (!res.ok || !j.ok) {
      alert("Update failed: " + (j?.message || res.status));
      return;
    }
    await reload();
  }

  return (
    <div style={{ padding: 16, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <h1 style={{ margin: "0 0 12px" }}>Admin 2 · Orders</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
        <input type="password" placeholder="Admin key" value={key} onChange={e=>setKey(e.target.value)} style={{ padding: 8, minWidth: 160 }} />
        <select value={status} onChange={e=>setStatus(e.target.value)} style={{ padding: 8 }}>
          <option value="">All statuses</option>
          {["PLACED","CONFIRMED","PACKED","OUT_FOR_DELIVERY","DELIVERED","RETURNED","CANCELLED"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input type="number" min={1} max={200} value={limit} onChange={e=>setLimit(Math.max(1, Math.min(200, Number(e.target.value)||50)))} style={{ width: 90, padding: 8 }} />
        <button onClick={reload} disabled={!hasKey || loading} style={{ padding: "8px 12px" }}>
          {loading ? "Loading..." : "Reload"}
        </button>
      </div>

      {err && <div style={{ color: "crimson", marginBottom: 12 }}>Error: {err}</div>}

      {!hasKey ? <div>Enter the admin key to load orders.</div> : null}

      <div style={{ display: "grid", gap: 12 }}>
        {orders.map(o => (
          <div key={o.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", gap: 8, alignItems:"baseline", flexWrap:"wrap" }}>
              <div style={{ fontWeight: 700 }}>{o.id}</div>
              <div style={{ fontSize: 12, color: "#666" }}>{new Date(o.created_at).toLocaleString("en-IN")}</div>
            </div>
            <div style={{ fontSize: 13, color:"#444", marginTop: 6 }}>
              <div><b>{o.name || "-"}</b> — {o.phone || ""}</div>
              <div>{o.address || ""}</div>
            </div>

            <div style={{ display:"flex", gap: 16, marginTop: 8, flexWrap:"wrap" }}>
              <div>Status: <b>{o.status}</b></div>
              <div>Items: <b>{o.item_count ?? 0}</b></div>
              <div>Total: <b><Inr v={o.total_rupees ?? o.computed_total_rupees ?? (o.total_paise/100)} /></b></div>
            </div>

            <div style={{ display:"flex", gap: 8, marginTop: 10, flexWrap:"wrap" }}>
              <button type="button" onClick={() => doAction(o.id, "approve")} style={btn()}>Approve (+2h)</button>
              <button type="button" onClick={() => doAction(o.id, "ofd")} style={btn()}>Out for delivery (+1h)</button>
              <button type="button" onClick={() => doAction(o.id, "delivered")} style={btn()}>Delivered</button>
              <button type="button" onClick={() => doAction(o.id, "cancelled")} style={btnWarn()}>Cancel</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function btn() { return ({ padding:"8px 10px", borderRadius: 8, border:"1px solid #ddd", background:"#fafafa", cursor:"pointer" }); }
function btnWarn() { return ({ padding:"8px 10px", borderRadius: 8, border:"1px solid #f5c2c7", background:"#fff5f5", color:"#b02a37", cursor:"pointer" }); }
