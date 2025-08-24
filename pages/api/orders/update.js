import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  const key = req.headers["x-admin-key"];
  if (!process.env.ADMIN_KEY) return res.status(500).json({ error: "ADMIN_KEY not set" });
  if (key !== process.env.ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { id, patch } = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (!id || !patch) return res.status(400).json({ error: "id and patch required" });
    const existed = await kv.hgetall(`order:${id}`);
    if (!existed) return res.status(404).json({ error: "Order not found" });
    const updated = { ...existed, ...patch, updatedAt: new Date().toISOString() };
    await kv.hset(`order:${id}`, updated);
    return res.status(200).json({ ok: true, order: updated });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update order", detail: String(err) });
  }
}