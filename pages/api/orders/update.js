// pages/api/orders/update.js
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
const valErr = (res, issues) => send(res, 422, { code: "VALIDATION_ERROR", issues });
const serverError = (res, message) => send(res, 500, { code: "SERVER_ERROR", message });

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
  try {
    const src = req.method === "GET" ? req.query
      : (typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {}));

    const id = src.id || src.orderId || src.order_id;
    const action = typeof src.action === "string" ? src.action.toLowerCase() : null;
    let status = norm(src.status);         // optional
    let eta = typeof src.eta === "string" ? src.eta : undefined;
    const notes = typeof src.notes === "string" ? src.notes : undefined;

    if (!id) return valErr(res, [{ path:"id", message:"id is required (accepted: id | orderId | order_id)" }]);

    const { data: row, error: getErr } = await supabase
      .from("orders").select("status,status_timestamps").eq("id", id).single();
    if (getErr) return serverError(res, getErr.message || String(getErr));

    if (!status && action) {
      if (action === "approve") { status = "CONFIRMED"; eta = addMinutes(new Date(), 120); }
      else if (["ofd","out_for_delivery","out for delivery"].includes(action)) {
        status = "OUT_FOR_DELIVERY"; eta = addMinutes(new Date(), 60);
      }
    }

    const newStatus = status || next(row?.status);
    if (!ORDER_STATUSES.includes(newStatus)) {
      return valErr(res, [{ path:"status", message:`invalid status. Allowed: ${ORDER_STATUSES.join(", ")}` }]);
    }

    const st = row?.status_timestamps || {};
    st[newStatus] = new Date().toISOString();

    // ✅ also bump updated_at so your table shows the change
    const patch = { status: newStatus, status_timestamps: st, updated_at: new Date().toISOString() };
    if (notes !== undefined) patch.notes = notes;
    if (eta !== undefined) patch.eta = eta;

    const { data: updData, error: updErr } = await supabase
      .from("orders").update(patch).eq("id", id).select().single();
    if (updErr) return serverError(res, updErr.message || String(updErr));

    return ok(res, { ok:true, order: updData });
  } catch (e) {
    return serverError(res, e?.message || String(e));
  }
}
