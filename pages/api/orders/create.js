import { supabase } from "@/lib/supabase"

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body

    const nowIso = new Date().toISOString();
    const id = body.id || ("MMA" + Math.floor(100000 + Math.random() * 900000));
    const tracking_code = (Math.random().toString(36).slice(2, 6) + Math.random().toString(36).slice(2, 6)).toUpperCase();
    const phone = String(body.phone || "").replace(/[^0-9]/g,"");

    const order = {
      id,
      tracking_code,
      name: body.name || "",
      phone,
      address: body.address || "",
      whatsapp: String(body.whatsapp || "").replace(/[^0-9]/g,""),
      payment: body.payment || body.pay || "COD",
      items: body.items || [],
      total: body.total || 0,
      status: "PLACED",
      status_timestamps: { PLACED: nowIso },
      created_at: nowIso,
      eta: null,
      updatedAt: nowIso
    };

    const { error } = await supabase.from("orders").insert([order])
    if (error) throw error

    return res.status(200).json({ ok: true, id, tracking_code })
  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
}
