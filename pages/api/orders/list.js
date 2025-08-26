// pages/api/orders/list.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey  = process.env.SUPABASE_SERVICE_ROLE;
if (!supabaseUrl) throw new Error("ENV NEXT_PUBLIC_SUPABASE_URL missing");
if (!serviceKey)  throw new Error("ENV SUPABASE_SERVICE_ROLE missing");
const supabase = createClient(supabaseUrl, serviceKey);

// Tiny helpers so responses are explicit
function send(res, status, data) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify(data));
}
const ok = (res, data) => send(res, 200, data);
const notAllowed = (res) => send(res, 405, { code: "METHOD_NOT_ALLOWED" });
const serverError = (res, message) => send(res, 500, { code: "SERVER_ERROR", message });
const validationError = (res, issues) => send(res, 422, { code: "VALIDATION_ERROR", issues });

export default async function handler(req, res) {
  if (req.method !== "POST") return notAllowed(res);

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const status = typeof body.status === "string" ? body.status : undefined;
    const limit  = Number.isInteger(body.limit) ? Math.min(Math.max(body.limit, 1), 200) : 50;
    const before = typeof body.before === "string" ? body.before : undefined;

    let q = supabase
      .from("orders")
      .select("id,status,payment_status,total_paise,created_at,status_timestamps,address_id")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status) q = q.eq("status", status);
    if (before) q = q.lt("created_at", before);

    const { data, error } = await q;
    if (error) return serverError(res, error.message || String(error));

    return ok(res, { orders: data || [] });
  } catch (e) {
    return serverError(res, e?.message || String(e));
  }
}
