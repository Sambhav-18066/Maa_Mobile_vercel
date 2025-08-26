import { supabase } from "@/lib/supabase"

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body
    const nowIso = new Date().toISOString()
    const id = body.id || ("MMA" + Math.floor(100000 + Math.random() * 900000))

    const order = {
      id,
      name: body.name || "",
      phone: String(body.phone || "").replace(/[^0-9]/g, ""),
      address: body.address || "",
      whatsapp: String(body.whatsapp || "").replace(/[^0-9]/g, ""),
      payment: body.payment || body.pay || "COD",
      items: body.items || [],
      total: body.total || 0,
      status: "PLACED",
      status_timestamps: { PLACED: nowIso },
      created_at: nowIso,
      updatedAt: nowIso
    }

    // Try inserting
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
