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

const STATUS_MAP = {
  "placed": "PLACED",
  "confirm": "CONFIRMED", "confirmed": "CONFIRMED",
  "pack": "PACKED", "packed": "PACKED",
  "out_for_delivery": "OUT_FOR_DELIVERY", "out for delivery": "OUT_FOR_DELIVERY", "ofd": "OUT_FOR_DELIVERY",
  "delivered": "DELIVERED",
  "returned": "RETURNED",
  "cancelled": "CANCELLED", "canceled": "CANCELLED"
};
const ENUMS = ["PLACED","CONFIRMED","PACKED","OUT_FOR_DELIVERY","DELIVERED","RETURNED","CANCELLED"];

function normalizeStatus(s){
  if (!s || typeof s !== "string") return null;
  const key = s.trim().toLowerCase().replace(/\s+/g, " ").replace(/\s/g, "_");
  if (STATUS_MAP[key]) return STATUS_MAP[key];
  const up = s.toUpperCase();
  return ENUMS.includes(up) ? up : null;
}

export default async function handler(req, res) {
  try {
    const src = req.method === "GET"
      ? req.query
      : (typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {}));

    const id = src.id || src.orderId;
    const status = normalizeStatus(src.status);
    const notes = typeof src.notes === "string" ? src.notes : undefined;
    const eta   = typeof src.eta === "string" ? src.eta   : undefined;

    const issues = [];
    if (!id) issues.push({ path: "id", message: "id (or orderId) is required" });
    if (!status) issues.push({ path: "status", message: "invalid status. Allowed: " + ENUMS.join(", ") });
    if (issues.length) return valErr(res, issues);

    const { data: row, error: getErr } = await supabase
      .from("orders")
      .select("status_timestamps")
      .eq("id", id)
      .single();
    if (getErr) return serverError(res, getErr.message || String(getErr));

    const st = row?.status_timestamps || {};
    st[status] = new Date().toISOString();

    const patch = { status, status_timestamps: st };
    if (notes !== undefined) patch.notes = notes;
    if (eta !== undefined) patch.eta = eta;

    const { error: updErr } = await supabase.from("orders").update(patch).eq("id", id);
    if (updErr) return serverError(res, updErr.message || String(updErr));

    return ok(res, { ok: true });
  } catch (e) {
    return serverError(res, e?.message || String(e));
  }
}
