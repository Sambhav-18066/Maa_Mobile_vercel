import { supabaseAdmin as supabase } from "@/lib/server/supabaseAdmin";
import { z } from "zod";
import { rateLimit } from "@/lib/server/rateLimit";

const allow = rateLimit({ windowMs: 60_000, max: 10 });

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
  whatsapp: z.string().optional(),
  payment: z.enum(["COD","UPI"]),
  items: z.array(Item).min(1),
  total: z.number().nonnegative()
});

export default async function handler(req, res){
  if(req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
  if(!allow(ip)) return res.status(429).json({ error: "Too many requests" });

  try{
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const parsed = OrderSchema.parse(body);
    const id = parsed.id || ("MMA" + Date.now());
    const nowIso = new Date().toISOString();
    const order = {
      id, ...parsed,
      phone: String(parsed.phone).replace(/[^0-9]/g, ""),
      whatsapp: parsed.whatsapp ? String(parsed.whatsapp).replace(/[^0-9]/g,"") : "",
      status: "PLACED",
      status_timestamps: { PLACED: nowIso },
      created_at: nowIso,
      updatedAt: nowIso
    };
    const { data, error } = await supabase.from("orders").insert([order]).select();
    if(error) throw error;
    return res.status(200).json({ ok:true, id, order: data?.[0] || order });
  }catch(e){
    return res.status(400).json({ error: String(e) });
  }
}
