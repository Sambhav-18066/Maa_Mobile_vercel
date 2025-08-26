// pages/api/orders/status.js
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE; // server-side only
const supabase = createClient(url, key);

function send(res, status, data) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.setHeader("cache-control", "no-store, max-age=0, must-revalidate");
  res.end(JSON.stringify(data));
}
const ok = (res, d) => send(res, 200, d);
const bad = (res, m) => send(res, 400, { error: m });
const err = (res, m) => send(res, 500, { error: m });

export default async function handler(req, res) {
  try {
    const id = (req.query.id || (typeof req.body === "string" ? JSON.parse(req.body||"{}").id : req.body?.id))?.toString();
    if (!id) return bad(res, "id required");

    const { data, error } = await supabase.from("orders").select(`
      id, created_at, status, status_timestamps, eta, total_paise,
      address:address_id ( name, phone, city, state, pincode ),
      items:order_items ( name_snapshot, qty, price_paise )
    `).eq("id", id).single();

    if (error) return err(res, error.message);

    const items = Array.isArray(data.items) ? data.items : [];
    const total_rupees = Number.isFinite(data.total_paise) ? data.total_paise/100 : null;
    const computed_total_rupees = items.reduce((s,it)=>s+(Number(it.price_paise)||0)*(Number(it.qty)||0),0)/100;

    return ok(res, {
      id: data.id,
      placed_at: data.created_at,
      status: data.status,
      status_timestamps: data.status_timestamps,
      eta: data.eta ?? null,
      amount_rupees: total_rupees ?? computed_total_rupees,
      address: {
        name: data.address?.name || "",
        phone: data.address?.phone || "",
        city: data.address?.city || "",
        state: data.address?.state || "",
        pincode: data.address?.pincode || ""
      },
      items: items.map(it => ({
        name: it.name_snapshot || "",
        qty: Number(it.qty)||0,
        price_rupees: Number(it.price_paise||0)/100
      }))
    });
  } catch (e) {
    return err(res, e?.message || String(e));
  }
}
