
import { supabaseAdmin as supabase } from "@/lib/server/supabaseAdmin";
import { z } from "zod";
import { rateLimit } from "@/lib/server/rateLimit";

const allow = rateLimit({ windowMs: 60_000, max: 30 });
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
  if (!allow(ip)) return res.status(429).json({ error: "Too many requests" })

  try {
    const PhoneSchema = z.object({ phone: z.string().regex(/^\d{10,12}$/) });
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { phone } = PhoneSchema.parse(body)
    if (!phone) return res.status(400).json({ error: "Phone required" })

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("phone", phone)
      .order("created_at", { ascending: false })

    if (error) throw error
    return res.status(200).json({ ok: true, orders: data })
  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
}
