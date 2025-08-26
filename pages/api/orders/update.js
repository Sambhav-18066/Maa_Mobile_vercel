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
  res.end(JSON.stringify(data));
}
const ok = (res, data) => send(res, 200, data);
const valErr = (res, issues) => send(res, 422, { code: "VALIDATION_ERROR", issues });
const serverError = (res, message) => send(res, 500, { code: "SERVER_ERROR", message });

const ORDER_STATUSES = ["PLACED","CONFIRMED","PACKED","OUT_FOR_DELIVERY","DELIVERED","RETURNED","CANCELLED"];
const STATUS_MAP = {
  "placed":"PLACED",
  "confirm":"CONFIRMED","confirmed":"CONFIRMED",
  "pack":"PACKED","packed":"PACKED",
  "ofd":"OUT_FOR_DELIVERY","out for delivery":"OUT_FOR_DELIVERY","out_for_delivery":"OUT_FOR_DELIVERY",
  "delivered":"DELIVERED",
  "returned":"RETURNED",
  "cancelled":"CANCELLED","canceled":"CANCELLED",
};

function normalizeStatus(s){
  if (!s || typeof s !== "string") return null;
  const key = s.trim().toLowerCase().replace(/\s+/g, " ").replace(/\s/g, "_");
  if (STATUS_MAP[key]) return STATUS_MAP[key];
  const up = s.toUpperCase();
  return ORDER_STATUSES.includes(up) ? up : null;
}

function nextStatus(curr){
  const i = ORDER_STATUSES.indexOf(curr || "PLACED");
  if (i === -1) return "PLACED";
  if (curr === "DELIVERED" || curr === "RETURNED" || curr === "CANCELLED") return curr; // terminal
  return ORDER_STATUSES[i+1] || curr;
}

export default async function handler(req, res) {
  try {
    const src = req.method === "GET"
      ? req.query
      : (typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {}));

    const id = src.id || src.orderId;
    let status = normalizeStatus(src.status);     // may be null -> auto-advance
    const notes = typeof src.notes === "string" ? src.notes : undefined;
    const eta   = typeof src.eta === "string" ? src.eta   : undefined;

    if (!id) return valErr(res, [{ path: "id", message: "id (or orderId) is required" }]);

    // get current status & timestamps
    const { data: row, error: getErr } = await supabase
      .from("orders")
      .select("status,status_timestamps")
      .eq("id", id)
      .single();
    if (getErr) return serverError(res, getErr.message || String(getErr));

    // auto-advance if status not provided
    const newStatus = status || nextStatus(row?.status);
    if (!ORDER_STATUSES.includes(newStatus)) {
      return valErr(res, [{ path: "status", message: "invalid status. Allowed: " + ORDER_STATUSES.join(", ") }]);
    }

    const st = row?.status_timestamps || {};
    st[newStatus] = new Date().toISOString();

    const patch = { status: newStatus, status_timestamps: st };
    if (notes !== undefined) patch.notes = notes;
    if (eta !== undefined) patch.eta = eta;

    const { error: updErr } = await supabase.from("orders").update(patch).eq("id", id);
    if (updErr) return serverError(res, updErr.message || String(updErr));

    return ok(res, { ok: true, id, status: newStatus, status_timestamps: st });
  } catch (e) {
    return serverError(res, e?.message || String(e));
  }
}
