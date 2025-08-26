import { supabaseAdmin as supabase } from "@/lib/server/supabaseAdmin";
import { z } from "zod";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { phone } = z.object({ phone: z.string().regex(/^\d{10,12}$/) })
      .parse(typeof req.body === "string" ? JSON.parse(req.body) : req.body);

    const normalized = String(phone).replace(/[^0-9]/g, "");

    const { data: addrs, error: aErr } = await supabase
      .from("addresses")
      .select("id")
      .eq("phone", normalized);
    if (aErr) throw aErr;

    const addrIds = (addrs || []).map(a => a.id);
    if (!addrIds.length) return res.status(200).json({ orders: [] });

    const { data: orders, error: oErr } = await supabase
      .from("orders")
      .select("id,status,payment_status,total_paise,created_at,status_timestamps,address_id")
      .in("address_id", addrIds)
      .order("created_at", { ascending: false })
      .limit(20);
    if (oErr) throw oErr;

    return res.status(200).json({ orders });
  } catch (e) {
    return res.status(400).json({ error: String(e) });
  }
}
