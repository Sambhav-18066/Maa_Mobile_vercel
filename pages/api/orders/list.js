import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  const key = req.headers["x-admin-key"];
  if (!process.env.ADMIN_KEY) {
    return res.status(500).json({ error: "ADMIN_KEY not set in env" });
  }
  if (key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const ids = await kv.zrange("orders:index", 0, -1, { rev: true });
    const orders = [];
    for (const id of ids) {
      const o = await kv.hgetall(`order:${id}`);
      if (o) orders.push(o);
    }
    return res.status(200).json({ ok: true, orders });
  } catch (err) {
    return res.status(500).json({ error: "Failed to list orders", detail: String(err) });
  }
}