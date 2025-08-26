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
  res.setHeader("cache-control", "no-store, max-age=0, must-revalidate");
  res.end(JSON.stringify(data));
}
const ok = (res, data) => send(res, 200, data);
const serverError = (res, message) => send(res, 500, { code: "SERVER_ERROR", message });

// Keep DB columns EXACTLY as your table expects,
// but also add safe scalar extras (name/phone/address/total_rupees).
export default async function handler(req, res) {
  try {
    const src = req.method === "GET"
      ? req.query
      : (typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {}));

    const id     = typeof src.id === "string" ? src.id : undefined;
    const status = typeof src.status === "string" ? src.status : undefined;
    const before = typeof src.before === "string" ? src.before : undefined;
    let limit = parseInt(src.limit, 10);
    limit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 200) : 50;

    const baseCols = [
      "id","created_at","status","status_timestamps","user_id","address_id",
      "payment_status","subtotal_paise","discount_paise","shipping_paise",
      "total_paise","notes","updated_at"
    ].join(",");

    // Join address + items, but we will only return **scalar** extras (no arrays/objects)
    const selectCols = `
      ${baseCols},
      address:address_id ( name, phone, line1, city, state, pincode ),
      items:order_items ( qty, price_paise )
    `;

    let q = supabase.from("orders").select(selectCols);
    if (id) {
      q = q.eq("id", id).limit(1);
    } else {
      q = q.order("created_at", { ascending: false }).limit(limit);
      if (status) q = q.eq("status", status);
      if (before) q = q.lt("created_at", before);
    }

    const { data, error } = await q;
    if (error) return serverError(res, error.message || String(error));

    const rows = (data || []).map(o => {
      // derive totals and address safely
      const items = Array.isArray(o.items) ? o.items : [];
      const computed_total_paise = items.reduce((s, it) => s + (Number(it.price_paise) || 0) * (Number(it.qty) || 0), 0);
      const item_count = items.reduce((s, it) => s + (Number(it.qty) || 0), 0);

      const addr = o.address || {};
      const cityStatePin = [addr.city, addr.state, addr.pincode].filter(Boolean).join(", ");
      const addressText = [addr.line1, cityStatePin].filter(Boolean).join(" — ");

      const total_rupees = Number.isFinite(o.total_paise) ? o.total_paise / 100 : null;
      const computed_total_rupees = computed_total_paise / 100;

      // Return ONLY the original DB columns + extra **scalar** fields
      return {
        // original columns your table renders:
        id: o.id,
        created_at: o.created_at,
        status: o.status,
        status_timestamps: o.status_timestamps,
        user_id: o.user_id,
        address_id: o.address_id,
        payment_status: o.payment_status,
        subtotal_paise: o.subtotal_paise,
        discount_paise: o.discount_paise,
        shipping_paise: o.shipping_paise,
        total_paise: o.total_paise,
        notes: o.notes,
        updated_at: o.updated_at,

        // extras your header wants:
        name: addr.name || "",
        phone: addr.phone || "",
        address: addressText || "",
        item_count,
        total_rupees,
        computed_total_rupees
      };
    });

    return ok(res, { orders: rows });
  } catch (e) {
    return serverError(res, e?.message || String(e));
  }
}
