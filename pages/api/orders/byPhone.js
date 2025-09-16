
import { supabase } from "@/lib/supabase"

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  try {
    const { phone } = typeof req.body === "string" ? JSON.parse(req.body) : req.body
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
