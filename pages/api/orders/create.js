import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const order = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const id = order.id || ("MMA" + Math.floor(100000 + Math.random()*900000));
    const now = new Date().toISOString();
    const record = { id, createdAt: now, status: "new", ...order };
    await kv.hset(`order:${id}`, record);
    await kv.zadd("orders:index", { score: Date.now(), member: id });
    return res.status(200).json({ ok: true, id });
  } catch (err) {
    return res.status(500).json({ error: "Failed to save order", detail: String(err) });
  }
}