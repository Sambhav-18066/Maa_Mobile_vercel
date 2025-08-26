// pages/api/admin/orders/detail.js
import { getAdminSupabase } from "../../../../lib/supabaseAdmin";
import { requireAdminKey, json } from "../../../../lib/adminAuth";

export default async function handler(req, res) {
  if (!requireAdminKey(req, res)) return;
  try {
    const id = req.method === "GET" ? req.query.id : (typeof req.body === "string" ? JSON.parse(req.body || "{}").id : (req.body?.id));
    if (!id) return json(res, 422, { code:"VALIDATION_ERROR", issues:[{ path:"id", message:"id required" }]});

    const supabase = getAdminSupabase();
    const { data, error } = await supabase.from("orders").select(`
      id,created_at,status,status_timestamps,user_id,address_id,payment_status,
      subtotal_paise,discount_paise,shipping_paise,total_paise,notes,updated_at,
      address:address_id ( id, name, phone, line1, city, state, pincode ),
      items:order_items ( id, product_id, name_snapshot, qty, price_paise, image_url )
    `).eq("id", id).single();
    if (error) return json(res, 500, { code:"SERVER_ERROR", message:error.message });

    return json(res, 200, { order: data });
  } catch (e) {
    return json(res, 500, { code:"SERVER_ERROR", message: e?.message || String(e) });
  }
}
