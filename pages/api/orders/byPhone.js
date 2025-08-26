import { supabaseAdmin as supabase } from "@/lib/server/supabaseAdmin";
import { ok, notAllowed, fromZodError, validationError, serverError } from "@/lib/server/http";
import { z, ZodError } from "zod";

export default async function handler(req, res) {
  if (req.method !== "POST") return notAllowed(res);
  try {
    const { phone } = z.object({ phone: z.string() })
      .parse(typeof req.body === "string" ? JSON.parse(req.body) : req.body);

    // Accept +91, spaces, dashes — normalize to digits and enforce length
    const normalized = String(phone).replace(/[^0-9]/g, "");
    if (normalized.length < 10 || normalized.length > 12) {
      return validationError(res, [{ path: "phone", message: "phone must be 10–12 digits after removing + and spaces" }]);
    }

    const { data: addrs, error: aErr } = await supabase
      .from("addresses")
      .select("id")
      .eq("phone", normalized);
    if (aErr) return serverError(res, aErr.message || String(aErr));

    const addrIds = (addrs || []).map(a => a.id);
    if (!addrIds.length) return ok(res, { orders: [] });

    const { data: orders, error: oErr } = await supabase
      .from("orders")
      .select("id,status,payment_status,total_paise,created_at,status_timestamps,address_id")
      .in("address_id", addrIds)
      .order("created_at", { ascending: false })
      .limit(20);
    if (oErr) return serverError(res, oErr.message || String(oErr));

    return ok(res, { orders });
  } catch (e) {
    if (e instanceof ZodError) return fromZodError(res, e);
    return serverError(res, e?.message || String(e));
  }
}
