
import { supabase } from "@/lib/supabase"

export default async function handler(req, res) {
  if (req.headers["x-admin-key"] !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) throw error

    return res.status(200).json({ ok: true, orders: data })
  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
}
