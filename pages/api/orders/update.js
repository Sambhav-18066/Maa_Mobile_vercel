import { supabaseAdmin as supabase } from "@/lib/server/supabaseAdmin";
import { ok, notAllowed, fromZodError, serverError } from "@/lib/server/http";
import { z, ZodError } from "zod";

const Patch = z.object({
  id: z.string().min(1, "id required"),
  status: z.enum(["PLACED","CONFIRMED","PACKED","OUT_FOR_DELIVERY","DELIVERED","RETURNED","CANCELLED"]),
  notes: z.string().optional(),
  eta: z.string().optional()
});

export default async function handler(req, res) {
  if (req.method !== "POST") return notAllowed(res);
  try {
    const { id, status, notes, eta } = Patch.parse(typeof req.body === "string" ? JSON.parse(req.body) : req.body);
    const { data: row, error: getErr } = await supabase.from("orders").select("status_timestamps").eq("id", id).single();
    if (getErr) return serverError(res, getErr.message || String(getErr));
    const st = row?.status_timestamps || {};
    st[status] = new Date().toISOString();

    const patch = { status, status_timestamps: st };
    if (notes) patch.notes = notes;
    if (eta) patch.eta = eta;

    const { error: updErr } = await supabase.from("orders").update(patch).eq("id", id);
    if (updErr) return serverError(res, updErr.message || String(updErr));
    return ok(res, { ok: true });
  } catch (e) {
    if (e instanceof ZodError) return fromZodError(res, e);
    return serverError(res, e?.message || String(e));
  }
}
