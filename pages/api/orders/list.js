import { supabaseAdmin as supabase } from "@/lib/server/supabaseAdmin";
import { z } from "zod";

/**
 * Admin-only list endpoint (server-side). Uses service role via supabaseAdmin.
 * Query params (POST body):
 *  - status?: string
 *  - limit?: number (default 50)
 *  - before?: ISO timestamp for pagination (fetch older than)
 */
const Body = z.object({
  status: z.string().optional(),
  limit: z.number().int().positive().max(200).optional(),
  before: z.string().optional()
});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { status, limit, before } = Body.parse(typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {}));
    let q = supabase.from("orders")
      .select("id,status,payment_status,total_paise,created_at,status_timestamps,address_id")
      .order("created_at", { ascending: false })
      .limit(limit || 50);

    if (status) q = q.eq("status", status);
    if (before) q = q.lt("created_at", before);

    const { data, error } = await q;
    if (error) throw error;
    return res.status(200).json({ orders: data });
  } catch (e) {
    return res.status(400).json({ error: String(e) });
  }
}
