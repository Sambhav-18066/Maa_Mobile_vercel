import { supabaseAdmin as supabase } from "@/lib/server/supabaseAdmin";
import { z } from "zod";
import { rateLimit } from "@/lib/server/rateLimit";

const allow = rateLimit({ windowMs: 60_000, max: 10 });
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
  const Item = z.object({
    id: z.string(),
    name: z.string(),
    price: z.number().nonnegative(),
    qty: z.number().int().positive(),
    image: z.string().optional()
  });
  const OrderSchema = z.object({
    id: z.string().optional(),
    name: z.string().default(""),
    phone: z.string().regex(/^\d{10,12}$/),
    address: z.string().min(8),
    payment: z.enum(["COD","UPI"]),
    items: z.array(Item).min(1),
    total: z.number().nonnegative()
  });

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body
        // Try inserting
    
    const parsed = OrderSchema.parse(body);
    const id = parsed.id || ("MMA" + Date.now());
    const order = { id, ...parsed, status: "PLACED", status_timestamps: { PLACED: new Date().toISOString() }, created_at: new Date().toISOString() };

    const { data, error } = await supabase.from("orders").insert([order]).select()

    if (error) {
      console.error("Supabase insert error:", error)   // <-- This will appear in Vercel logs
      return res.status(500).json({ error: error.message || String(error) })
    }

    console.log("Order inserted:", data)               // <-- See what actually went in
    return res.status(200).json({ ok: true, id })
  } catch (err) {
    console.error("Order insert failed:", err)         // <-- This will show the real stack
    return res.status(500).json({ error: String(err) })
  }
}
