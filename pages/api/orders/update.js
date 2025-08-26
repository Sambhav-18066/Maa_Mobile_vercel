// pages/api/admin/orders/update.js
import { getAdminSupabase } from "../../../../lib/supabaseAdmin";
import { requireAdminKey, json } from "../../../../lib/adminAuth";
import { hydrateRow } from "../../../../lib/hydrateOrders";

const ORDER_STATUSES = ["PLACED","CONFIRMED","PACKED","OUT_FOR_DELIVERY","DELIVERED","RETURNED","CANCELLED"];
const STATUS_MAP = {
  placed:"PLACED",
  confirm:"CONFIRMED", confirmed:"CONFIRMED", approve:"CONFIRMED",
  pack:"PACKED", packed:"PACKED",
  ofd:"OUT_FOR_DELIVERY", "out for delivery":"OUT_FOR_DELIVERY", out_for_delivery:"OUT_FOR_DELIVERY",
  delivered:"DELIVERED",
  returned:"RETURNED",
  cancelled:"CANCELLED", canceled:"CANCELLED",
};
const norm = s => {
  if (!s || typeof s !== "string") return null;
  const k = s.trim().toLowerCase().replace(/\s+/g," ").replace(/\s/g,"_");
  if (STATUS_MAP[k]) return STATUS_MAP[k];
  const up = s.toUpperCase();
  return ORDER_STATUSES.includes(up) ? up : null;
};
const next = cur => {
  const i = ORDER_STATUSES.indexOf(cur || "PLACED");
  if (i < 0) return "PLACED";
  if (["DELIVERED","RETURNED","CANCELLED"].includes(cur)) return cur;
  return ORDER_STATUSES[i+1] || cur;
};
const addMinutes = (d,m) => new Date(d.getTime()+m*60000).toISOString();

export default async function handler(req, res) {
  if (!requireAdminKey(req, res)) return;
  try {
    const src = req.method === "GET" ? req.query
      : (typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {}));

    const id = src.id || src.orderId || src.order_id;
    let { action } = src;
    const statusParam = src.status;

    // accept misuse: status=approve/ofd/... acts like action
    if (!action && typeof statusParam === "string") {
      const s = statusParam.trim().toLowerCase();
      if (["approve","ofd","delivered","cancelled","canceled","returned","packed","confirm","confirmed"].includes(s)) action = s;
    }

    let status = norm(statusParam);
    let eta = typeof src.eta === "string" ? src.eta : undefined;
    const notes = typeof src.notes === "string" ? src.notes : undefined;

    if (!id) return json(res, 422, { code: "VALIDATION_ERROR", issues:[{ path:"id", message:"id (or orderId/order_id) required" }]});

    const supabase = getAdminSupabase();
    const { data: row, error: getErr } = await supabase.from("orders")
      .select("status,status_timestamps").eq("id", id).single();
    if (getErr) return json(res, 500, { code: "SERVER_ERROR", message: getErr.message });

    const prevStatus = row?.status || "PLACED";

    // Recognize more actions
    if (!status && action) {
      const a = String(action).toLowerCase();
      if (a === "approve" || a === "confirm" || a === "confirmed") {
        status = "CONFIRMED"; eta = addMinutes(new Date(), 120);
      } else if (a === "packed" || a === "pack") {
        status = "PACKED";
      } else if (a === "ofd" || a === "out_for_delivery" || a === "out for delivery") {
        status = "OUT_FOR_DELIVERY"; eta = addMinutes(new Date(), 60);
      } else if (a === "delivered") {
        status = "DELIVERED";
      } else if (a === "cancelled" || a === "canceled") {
        status = "CANCELLED";
      } else if (a === "returned") {
        status = "RETURNED";
      } else {
        return json(res, 422, { code:"VALIDATION_ERROR", issues:[{ path:"action", message:"unknown action" }] });
      }
    }

    if (!status) status = next(prevStatus);
    if (!ORDER_STATUSES.includes(status)) {
      return json(res, 422, { code: "VALIDATION_ERROR", issues:[{ path:"status", message:`invalid status (${ORDER_STATUSES.join(", ")})` }]});
    }

    const st = row?.status_timestamps || {};
    st[status] = new Date().toISOString();

    const patch = { status, status_timestamps: st, updated_at: new Date().toISOString() };
    if (notes !== undefined) patch.notes = notes;
    if (eta !== undefined)   patch.eta = eta; // only if you added the eta column

    const { data: upd, error: updErr } = await supabase.from("orders")
      .update(patch).eq("id", id).select(`
        id,created_at,status,status_timestamps,user_id,address_id,payment_status,
        subtotal_paise,discount_paise,shipping_paise,total_paise,notes,updated_at,
        address:address_id ( name, phone, line1, city, state, pincode ),
        items:order_items ( qty, price_paise )
      `).single();
    if (updErr) return json(res, 500, { code:"SERVER_ERROR", message: updErr.message });

    return json(res, 200, {
      ok:true,
      order: hydrateRow(upd),
      debug:{ prevStatus, decidedBy: action ? "action" : (statusParam ? "explicit-status" : "auto-advance"), action: action || null, statusParam: statusParam || null }
    });
  } catch (e) {
    return json(res, 500, { code: "SERVER_ERROR", message: e?.message || String(e) });
  }
}
