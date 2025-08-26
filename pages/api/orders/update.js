import { supabaseAdmin as supabase } from "@/lib/server/supabaseAdmin";
import { z } from "zod";

const Patch = z.object({
  id: z.string(),
  status: z.enum(["PLACED","CONFIRMED","PACKED","OUT_FOR_DELIVERY","DELIVERED","RETURNED","CANCELLED"]),
  notes: z.string().optional(),
  eta: z.string().optional()
});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { id, status, notes, eta } = Patch.parse(typeof req.body === "string" ? JSON.parse(req.body) : req.body);
    const { data: row, error: getErr } = await supabase.from("orders").select("status_timestamps").eq("id", id).single();
    if (getErr) throw getErr;
    const st = row?.status_timestamps || {};
    st[status] = new Date().toISOString();

    const patch = { status, status_timestamps: st };
    if (notes) patch.notes = notes;
    if (eta) patch.eta = eta;

    const { error: updErr } = await supabase.from("orders").update(patch).eq("id", id);
    if (updErr) throw updErr;
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(400).json({ error: String(e) });
  }
}
