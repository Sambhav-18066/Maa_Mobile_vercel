export default async function handler(req, res){
  try{
    const { type, meta } = req.body || {};
    console.log("analytics", { type, meta, at: new Date().toISOString() });
    return res.status(200).json({ ok: true });
  }catch(e){
    return res.status(200).json({ ok: true });
  }
}