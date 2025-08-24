
import { supabase } from "@/lib/supabase"

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  try {
    const order = typeof req.body === "string" ? JSON.parse(req.body) : req.body
    order.id = order.id || "MMA" + Math.floor(100000 + Math.random() * 900000)

    const { error } = await supabase.from("orders").insert([order])
    if (error) throw error

    return res.status(200).json({ ok: true, id: order.id })
  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
}
