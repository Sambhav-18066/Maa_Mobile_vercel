import { supabaseAdmin as supabase } from "@/lib/server/supabaseAdmin";
import { ok, notAllowed, fromZodError, serverError } from "@/lib/server/http";
import { z, ZodError } from "zod";

/**
 * Backward-compatible create endpoint.
 * Accepts old shape: { name, phone, address, whatsapp, items: [{id,name,price,qty,image}], total }
 * Creates: address -> order -> order_items (COD only).
 */
const OldItem = z.object({
  id: z.any().optional(),
  name: z.string({ required_error: "item.name required" }).min(1),
  price: z.number({ required_error: "item.price required" }).nonnegative(),
  qty: z.number({ required_error: "item.qty required" }).int().positive(),
  image: z.string().optional()
});

const OldBody = z.object({
  name: z.string().min(1, "name required"),
  phone: z.string().regex(/^\d{10,12}$/, "phone must be 10–12 digits"),
  address: z.string().min(5, "address required"),
  whatsapp: z.string().optional(),
  items: z.array(OldItem).min(1, "at least 1 item"),
  total: z.number().nonnegative().optional()
});

export default async function handler(req, res) {
  if (req.method !== "POST") return notAllowed(res);
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const parsed = OldBody.parse(body);

    const phone = String(parsed.phone).replace(/[^0-9]/g, "");
    const line1 = parsed.address;
    const city = "";
    const state = "";
    const pincode = "";

    const { data: addrIns, error: addrErr } = await supabase
      .from("addresses")
      .insert([{
        user_id: null,
        name: parsed.name,
        phone,
        line1,
        line2: null,
        city,
        state,
        pincode,
        landmark: null
      }])
      .select()
      .limit(1);
    if (addrErr) return serverError(res, addrErr.message || String(addrErr));
    const address_id = addrIns?.[0]?.id;

    const computed = parsed.items.reduce((s, it) => s + Math.round(it.price*100) * it.qty, 0);
    const subtotal = computed;
    const total = typeof parsed.total === "number" ? Math.round(parsed.total*100) : computed;

    const id = "MMA" + Date.now();
    const nowIso = new Date().toISOString();

    const { error: oErr } = await supabase.from("orders").insert([{
      id,
      user_id: null,
      address_id,
      status: "PLACED",
      payment_status: "PENDING",
      subtotal_paise: subtotal,
      discount_paise: 0,
      shipping_paise: 0,
      total_paise: total,
      notes: null,
      status_timestamps: { PLACED: nowIso }
    }]);
    if (oErr) return serverError(res, oErr.message || String(oErr));

    const rows = parsed.items.map(it => ({
      order_id: id,
      variant_id: null,
      name_snapshot: it.name,
      sku_snapshot: null,
      image_url: it.image || null,
      price_paise: Math.round(it.price*100),
      qty: it.qty
    }));
    const { error: iErr } = await supabase.from("order_items").insert(rows);
    if (iErr) return serverError(res, iErr.message || String(iErr));

    return ok(res, { ok: true, id });
  } catch (e) {
    if (e instanceof ZodError) return fromZodError(res, e);
    return serverError(res, e?.message || String(e));
  }
}
