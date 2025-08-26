// pages/api/admin/orders/list.js
import { getAdminSupabase } from "../../../../lib/supabaseAdmin";
import { requireAdminKey, json } from "../../../../lib/adminAuth";
import { hydrateRow } from "../../../../lib/hydrateOrders";

export default async function handler(req, res) {
  if (!requireAdminKey(req, res)) return;
  try {
    const src = req.method === "GET" ? req.query
      : (typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {}));

    const id     = typeof src.id === "string" ? src.id : undefined;
    const status = typeof src.status === "string" ? src.status : undefined;
    const before = typeof src.before === "string" ? src.before : undefined;
    let limit = parseInt(src.limit, 10);
    limit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 200) : 50;

    const cols = `
      id,created_at,status,status_timestamps,user_id,address_id,payment_status,
      subtotal_paise,discount_paise,shipping_paise,total_paise,notes,updated_at,
      address:address_id ( name, phone, line1, city, state, pincode ),
      items:order_items ( qty, price_paise )
    `;

    const supabase = getAdminSupabase();
    let q = supabase.from("orders").select(cols);

    if (id) {
      q = q.eq("id", id).limit(1);
    } else {
      q = q.order("created_at", { ascending: false }).limit(limit);
      if (status) q = q.eq("status", status);
      if (before) q = q.lt("created_at", before);
    }

    const { data, error } = await q;
    if (error) return json(res, 500, { code: "SERVER_ERROR", message: error.message });

    const rows = (data || []).map(hydrateRow);
    return json(res, 200, { orders: rows });
  } catch (e) {
    return json(res, 500, { code: "SERVER_ERROR", message: e?.message || String(e) });
  }
}
