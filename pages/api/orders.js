import clientPromise from "../../lib/db";

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("maamobile");

  if (req.method === "POST") {
    const order = req.body;
    const result = await db.collection("orders").insertOne(order);
    return res.json({ success: true, id: result.insertedId });
  }

  if (req.method === "GET") {
    const orders = await db.collection("orders").find({}).toArray();
    return res.json(orders);
  }
}