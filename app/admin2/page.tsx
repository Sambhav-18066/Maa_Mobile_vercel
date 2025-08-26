// app/admin2/page.tsx
'use client';

import useSWR from 'swr';
import { useState } from 'react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

type Order = {
  id: string;
  created_at: string;
  customer_name: string | null;
  phone: string | null;
  address: any;
  status: string;
  payment_status: string;
  total_amount: string;
  eta: string | null;
  line_items: Array<{ product_name: string; quantity: number; unit_price: number; line_total: number }>;
};

const STATUSES = ['pending','approved','packed','out_for_delivery','delivered','failed','cancelled'] as const;

export default function Admin2() {
  const { data, isLoading, mutate } = useSWR('/api/admin2/orders', fetcher, { revalidateOnFocus: false });
  const [busy, setBusy] = useState<string | null>(null);
  const orders: Order[] = data?.orders ?? [];

  async function approve(id: string) {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin2/orders/${id}/approve`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Approve failed');
      await mutate();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setBusy(null);
    }
  }

  async function updateStatus(id: string, next: string, eta?: string) {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin2/orders/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next, eta: eta || null })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Update failed');
      await mutate();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setBusy(null);
    }
  }

  if (isLoading) return <div style={{ padding: 16 }}>Loading orders…</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 22, marginBottom: 12 }}>Admin 2 • Orders</h1>
      {orders.map((o) => {
        const canApprove = o.status === 'pending';
        return (
          <div key={o.id} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12, marginBottom: 12, background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{o.customer_name || 'Unnamed'}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{o.phone}</div>
                <div style={{ fontSize: 12, opacity: 0.8, maxWidth: 520, overflowWrap: 'anywhere' }}>
                  {o.address ? JSON.stringify(o.address) : 'No address'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700 }}>₹ {o.total_amount}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Status: {o.status}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>ETA: {o.eta ? new Date(o.eta).toLocaleString() : '—'}</div>
                <div style={{ fontSize: 11, opacity: 0.6 }}>#{o.id.slice(0,8)}</div>
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              <details>
                <summary style={{ cursor: 'pointer' }}>Items ({o.line_items?.length ?? 0})</summary>
                <div style={{ marginTop: 8 }}>
                  {(o.line_items ?? []).map((li, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 120px 120px', gap: 8, fontSize: 14 }}>
                      <div>{li.product_name}</div>
                      <div>Qty: {li.quantity}</div>
                      <div>₹ {Number(li.unit_price ?? 0).toFixed(2)}</div>
                      <div style={{ fontWeight: 600 }}>₹ {Number(li.line_total ?? (li.unit_price * li.quantity)).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </details>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {canApprove && (
                <button onClick={() => approve(o.id)} disabled={busy === o.id} style={{ padding: '8px 12px', borderRadius: 8, background: '#004aad', color: 'white', border: 0 }}>
                  {busy === o.id ? 'Approving…' : 'Approve'}
                </button>
              )}
              <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} disabled={busy === o.id} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={() => {
                const mins = prompt('ETA in minutes from now? (leave blank to clear)');
                const eta = mins ? new Date(Date.now() + Number(mins) * 60000).toISOString() : null;
                updateStatus(o.id, o.status, eta ?? undefined);
              }} disabled={busy === o.id} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', background: 'white' }}>
                Set ETA
              </button>
              <button onClick={() => updateStatus(o.id, 'delivered')} disabled={busy === o.id || !['out_for_delivery'].includes(o.status)} style={{ padding: '8px 12px', borderRadius: 8, background: '#19d541', color: 'black', border: 0, opacity: !['out_for_delivery'].includes(o.status) ? 0.5 : 1 }} title="You can only mark delivered after Out for delivery">
                Mark Delivered
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
