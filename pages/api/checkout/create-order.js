import { supabaseAdmin as supabase } from "@/lib/server/supabaseAdmin";
import { ok, notAllowed, fromZodError, validationError, serverError } from "@/lib/server/http";
import { z, ZodError } from "zod";

const Item = z.object({
  name: z.string({ required_error: "item.name required" }).min(1),
  sku: z.string().optional(),
  price_paise: z.number({ required_error: "item.price_paise required" }).int().nonnegative(),
  qty: z.number({ required_error: "item.qty required" }).int().positive(),
  image_url: z.string().optional(),
  variant_id: z.string().uuid().optional()
});

const Address = z.object({
  user_id: z.string().uuid().optional(),
  name: z.string().min(1, "customer.name required"),
  phone: z.string().regex(/^\d{10,12}$/, "phone must be 10–12 digits"),
  line1: z.string().min(3, "address line1 required"),
  line2: z.string().optional(),
  city: z.string().min(2, "city required"),
  state: z.string().min(2, "state required"),
  pincode: z.string().min(4, "pincode required"),
  landmark: z.string().optional()
});

const Body = z.object({
  customer: Address,
  items: z.array(Item).min(1, "at least 1 item"),
  notes: z.string().optional(),
  payment_mode: z.literal("COD", { invalid_type_error: "payment_mode must be COD" })
});

export default async function handler(req, res) {
  if (req.method !== "POST") return notAllowed(res);
  try {
    const parsed = Body.parse(typeof req.body === "string" ? JSON.parse(req.body) : req.body);
    const { customer, items, notes } = parsed;

    const phone = String(customer.phone).replace(/[^0-9]/g, "");
    const user_id = customer.user_id || null;

    const { data: addrIns, error: addrErr } = await supabase
      .from("addresses")
      .insert([{
        user_id,
        name: customer.name,
        phone,
        line1: customer.line1,
        line2: customer.line2 || null,
        city: customer.city,
        state: customer.state,
        pincode: customer.pincode,
        landmark: customer.landmark || null
      }])
      .select()
      .limit(1);

    if (addrErr) return serverError(res, addrErr.message || String(addrErr));
    const address_id = addrIns?.[0]?.id;

    const subtotal = items.reduce((s, it) => s + it.price_paise * it.qty, 0);
    const shipping = 0;
    const discount = 0;
    const total = subtotal + shipping - discount;

    const id = "MMA" + Date.now();
    const nowIso = new Date().toISOString();

    const { error: oErr } = await supabase.from("orders").insert([{
      id,
      user_id,
      address_id,
      status: "PLACED",
      payment_status: "PENDING",
      subtotal_paise: subtotal,
      discount_paise: discount,
      shipping_paise: shipping,
      total_paise: total,
      notes: notes || null,
      status_timestamps: { PLACED: nowIso }
    }]);
    if (oErr) return serverError(res, oErr.message || String(oErr));

    const rows = items.map(it => ({
      order_id: id,
      variant_id: it.variant_id || null,
      name_snapshot: it.name,
      sku_snapshot: it.sku || null,
      image_url: it.image_url || null,
      price_paise: it.price_paise,
      qty: it.qty
    }));
    const { error: iErr } = await supabase.from("order_items").insert(rows);
    if (iErr) return serverError(res, iErr.message || String(iErr));

    return ok(res, { ok: true, id, total_paise: total });
  } catch (e) {
    if (e instanceof ZodError) return fromZodError(res, e);
    return serverError(res, e?.message || String(e));
  }
}
