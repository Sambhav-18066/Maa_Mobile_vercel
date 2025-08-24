import clientPromise from "../../lib/db";

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("maamobile");
  const products = await db.collection("products").find({}).toArray();
  res.json(products);
}