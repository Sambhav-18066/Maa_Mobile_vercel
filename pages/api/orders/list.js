// pages/api/orders/list.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey  = process.env.SUPABASE_SERVICE_ROLE;
if (!supabaseUrl) throw new Error("ENV NEXT_PUBLIC_SUPABASE_URL missing");
if (!serviceKey)  throw new Error("ENV SUPABASE_SERVICE_ROLE missing");
const supabase = createClient(supabaseUrl, serviceKey);

// tiny response helpers
function send(res, status, data) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify(data));
}
const ok = (res, data) => send(res, 200, data);
const serverError = (res, message) => send(res, 500, { code: "SERVER_ERROR", message });

export default async function handler(req, res) {
  try {
    // Accept both GET (query) and POST (body)
    const src = req.method === "GET"
      ? req.query
      : (typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {}));

    const status = typeof src.status === "string" ? src.status : undefined;
    const before = typeof src.before === "string" ? src.before : undefined;
    let limit = parseInt(src.limit, 10);
    limit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 200) : 50;

    // Join address and items
    const selectCols = `
      id,status,payment_status,subtotal_paise,discount_paise,shipping_paise,total_paise,created_at,status_timestamps,
      address:address_id ( id, name, phone, line1, city, state, pincode ),
      items:order_items ( id, name_snapshot, qty, price_paise, image_url )
    `;

    let q = supabase
      .from("orders")
      .select(selectCols)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status) q = q.eq("status", status);
    if (before) q = q.lt("created_at", before);

    const { data, error } = await q;
    if (error) return serverError(res, error.message || String(error));

    // Provide flat fields for easy rendering
    const hydrated = (data || []).map(o => {
      const itemCount = Array.isArray(o.items) ? o.items.reduce((s,i)=>s + (i.qty||0), 0) : 0;
      return {
        ...o,
        address_name:  o.address?.name  || null,
        address_phone: o.address?.phone || null,
        address_line1: o.address?.line1 || null,
        item_count: itemCount,
        total_rupees: typeof o.total_paise === "number" ? (o.total_paise / 100) : null
      };
    });

    return ok(res, { orders: hydrated });
  } catch (e) {
    return serverError(res, e?.message || String(e));
  }
}
