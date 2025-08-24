
import { supabase } from "@/lib/supabase"

export default async function handler(req, res) {
  if (req.headers["x-admin-key"] !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" })
  }
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  try {
    const { id, patch } = typeof req.body === "string" ? JSON.parse(req.body) : req.body
    const { data, error } = await supabase.from("orders").update(patch).eq("id", id).select()
    if (error) throw error

    return res.status(200).json({ ok: true, order: data[0] })
  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
}
