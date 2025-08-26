// pages/api/orders/list.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey  = process.env.SUPABASE_SERVICE_ROLE;
if (!supabaseUrl) throw new Error("ENV NEXT_PUBLIC_SUPABASE_URL missing");
if (!serviceKey)  throw new Error("ENV SUPABASE_SERVICE_ROLE missing");
const supabase = createClient(supabaseUrl, serviceKey);

function send(res, status, data) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify(data));
}
const ok = (res, data) => send(res, 200, data);
const serverError = (res, message) => send(res, 500, { code: "SERVER_ERROR", message });

export default async function handler(req, res) {
  try {
    const src = req.method === "GET"
      ? req.query
      : (typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {}));

    const status = typeof src.status === "string" ? src.status : undefined;
    const before = typeof src.before === "string" ? src.before : undefined;
    let limit = parseInt(src.limit, 10);
    limit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 200) : 50;

    const selectCols = `
      id,status,payment_status,subtotal_paise,discount_paise,shipping_paise,total_paise,created_at,status_timestamps,
      address:address_id ( id, name, phone, line1, city, state, pincode ),
      items:order_items ( id, name_snapshot, qty, price_paise, image_url )
    `;

    let q = supabase.from("orders").select(selectCols).order("created_at", { ascending: false }).limit(limit);
    if (status) q = q.eq("status", status);
    if (before) q = q.lt("created_at", before);

    const { data, error } = await q;
    if (error) return serverError(res, error.message || String(error));

    const hydrated = (data || []).map(o => {
      const addr = o.address || {};
      const cityStatePin = [addr.city, addr.state, addr.pincode].filter(Boolean).join(", ");
      const address_text = [addr.line1, cityStatePin].filter(Boolean).join(" — ");

      const items = Array.isArray(o.items) ? o.items : [];
      const items_summary = items.map(it => ({
        id: it.id,
        name: it.name_snapshot,
        qty: it.qty,
        price_rupees: typeof it.price_paise === "number" ? it.price_paise / 100 : null,
        line_total_rupees: typeof it.price_paise === "number" ? (it.price_paise * (it.qty || 0)) / 100 : null,
        image_url: it.image_url || null,
      }));
      const item_count = items.reduce((s,i)=>s + (i.qty||0), 0);
      const total_rupees = typeof o.total_paise === "number" ? o.total_paise / 100 : null;

      return {
        ...o,

        // Back-compat fields your UI likely expects:
        address: address_text || "",
        name: addr.name || "",               // 👈 expose customer name as 'name'
        phone: addr.phone || "",             // (use if your table shows phone from 'phone')

        // Flat modern fields (optional, nice to have):
        address_name:  addr.name  || null,
        address_phone: addr.phone || null,
        address_line1: addr.line1 || null,
        item_count,
        total_rupees,
        items_summary,
      };
    });

    return ok(res, { orders: hydrated });
  } catch (e) {
    return serverError(res, e?.message || String(e));
  }
}
