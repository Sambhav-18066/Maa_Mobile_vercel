// pages/api/orders/create.js
import { z, ZodError } from "zod";
import { createClient } from "@supabase/supabase-js";

// --- server-only Supabase (service role) ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey  = process.env.SUPABASE_SERVICE_ROLE;
if (!supabaseUrl) throw new Error("ENV NEXT_PUBLIC_SUPABASE_URL missing");
if (!serviceKey)  throw new Error("ENV SUPABASE_SERVICE_ROLE missing");
const supabase = createClient(supabaseUrl, serviceKey);

// --- tiny response helpers (inline so this file is standalone) ---
function send(res, status, data) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify(data));
}
const ok  = (res, data) => send(res, 200, data);
const notAllowed = (res) => send(res, 405, { code: "METHOD_NOT_ALLOWED" });
const serverError = (res, message) => send(res, 500, { code: "SERVER_ERROR", message });
const validationError = (res, issues) =>
  send(res, 422, { code: "VALIDATION_ERROR", issues });

// --- schema for the *legacy* body you were using ---
const OldItem = z.object({
  id: z.any().optional(),
  name: z.string({ required_error: "item.name required" }).min(1, "item.name required"),
  price: z.number({ required_error: "item.price required" }).nonnegative(),
  qty: z.number({ required_error: "item.qty required" }).int().positive(),
  image: z.string().optional()
});

const OldBody = z.object({
  name: z.string().min(1, "name required"),
  phone: z.string().min(1, "phone required"),
  address: z.string().min(5, "address required"),
  whatsapp: z.string().optional(),
  items: z.array(OldItem).min(1, "at least 1 item"),
  total: z.number().nonnegative().optional()
});

// --- handler ---
export default async function handler(req, res) {
  if (req.method !== "POST") return notAllowed(res);

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const parsed = OldBody.parse(body);

    // Normalize phone to digits, but accept +91, spaces, dashes in input
    const phone = String(parsed.phone).replace(/[^0-9]/g, "");
    if (phone.length < 10 || phone.length > 12) {
      return validationError(res, [{ path: "phone", message: "phone must be 10–12 digits after removing + and spaces" }]);
    }

    // We only have a single freeform address in legacy flow; store it in line1 for now
    const line1 = parsed.address;
    const city = "";
    const state = "";
    const pincode = "";

    // 1) create address row (anonymous user)
    const { data: addrIns, error: addrErr } = await supabase
      .from("addresses")
      .insert([{
        user_id: null,
        name: parsed.name,
        phone,
        line1,
        line2: null,
        city, state, pincode,
        landmark: null
      }])
      .select()
      .limit(1);

    if (addrErr) return serverError(res, addrErr.message || String(addrErr));
    const address_id = addrIns?.[0]?.id;
    if (!address_id) return serverError(res, "address insert returned no id");

    // 2) totals (use provided total if present, else compute)
    const computed = parsed.items.reduce((s, it) => s + Math.round(it.price * 100) * it.qty, 0);
    const subtotal = computed;
    const total = typeof parsed.total === "number" ? Math.round(parsed.total * 100) : computed;

    // 3) create order
    const id = "MMA" + Date.now();
    const nowIso = new Date().toISOString();

    const { error: oErr } = await supabase.from("orders").insert([{
      id,
      user_id: null,
      address_id,
      status: "PLACED",
      payment_status: "PENDING",     // COD only
      subtotal_paise: subtotal,
      discount_paise: 0,
      shipping_paise: 0,
      total_paise: total,
      notes: null,
      status_timestamps: { PLACED: nowIso }
    }]);
    if (oErr) return serverError(res, oErr.message || String(oErr));

    // 4) items
    const rows = parsed.items.map(it => ({
      order_id: id,
      variant_id: null,
      name_snapshot: it.name,
      sku_snapshot: null,
      image_url: it.image || null,
      price_paise: Math.round(it.price * 100),
      qty: it.qty
    }));
    const { error: iErr } = await supabase.from("order_items").insert(rows);
    if (iErr) return serverError(res, iErr.message || String(iErr));

    return ok(res, { ok: true, id });
  } catch (e) {
    if (e instanceof ZodError) {
      const issues = (e.issues || []).map(i => ({ path: i.path.join("."), message: i.message }));
      return validationError(res, issues);
    }
    return serverError(res, e?.message || String(e));
  }
}
