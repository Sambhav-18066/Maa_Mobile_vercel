import { supabaseAdmin as supabase } from "@/lib/server/supabaseAdmin";
import { z } from "zod";

/**
 * Backward-compatible create endpoint.
 * Accepts old shape: { name, phone, address, whatsapp, items: [{id,name,price,qty,image}], total }
 * Creates: address -> order -> order_items (COD only).
 */
const OldItem = z.object({
  id: z.any().optional(),
  name: z.string(),
  price: z.number().nonnegative(),
  qty: z.number().int().positive(),
  image: z.string().optional()
});

const OldBody = z.object({
  name: z.string(),
  phone: z.string(),
  address: z.string(),
  whatsapp: z.string().optional(),
  items: z.array(OldItem).min(1),
  total: z.number().nonnegative().optional()
});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
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
    if (addrErr) throw addrErr;
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
    if (oErr) throw oErr;

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
    if (iErr) throw iErr;

    return res.status(200).json({ ok: true, id });
  } catch (e) {
    return res.status(400).json({ error: String(e) });
  }
}
