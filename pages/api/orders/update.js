import { supabaseAdmin as supabase } from "@/lib/server/supabaseAdmin";
import { z } from "zod";

export default async function handler(req, res) {
  if (req.headers["x-admin-key"] !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" })
  }
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  try {
    const PatchSchema = z.object({
      id: z.string(),
      patch: z.object({
        status: z.enum(["PLACED","APPROVED","OUT_FOR_DELIVERY","DELIVERED"]).optional(),
        eta: z.string().optional(),
        notes: z.string().optional()
      })
    });
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { id, patch } = PatchSchema.parse(body)
    if(!id) return res.status(400).json({ error: "Missing order id" });

    // Fetch existing to update timeline
    const { data: existingRows, error: getErr } = await supabase.from("orders").select("*").eq("id", id).limit(1);
    if(getErr) throw getErr;
    const existing = existingRows && existingRows[0];

    const next = { ...patch, updatedAt: new Date().toISOString() };

    if (patch.status && existing) {
      const timeline = { ...(existing.status_timestamps || {}) };
      // only stamp when status changes
      if (existing.status !== patch.status && !timeline[patch.status]) {
        timeline[patch.status] = new Date().toISOString();
      }
      next.status_timestamps = timeline;
    }

    const { data, error } = await supabase.from("orders").update(next).eq("id", id).select()
    if (error) throw error

    return res.status(200).json({ ok: true, order: data[0] })
  } catch (err) {
    return res.status(500).json({ error: String(err) })
  }
}
