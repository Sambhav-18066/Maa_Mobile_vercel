// lib/adminAuth.js
export function requireAdminKey(req, res) {
  const expected = process.env.ADMIN_KEY;
  const key = req.headers["x-admin-key"];
  if (!expected) {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ code: "CONFIG_ERROR", message: "ADMIN_KEY env is missing" }));
    return false;
  }
  if (!key || key !== expected) {
    res.statusCode = 401;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ code: "UNAUTHORIZED", message: "Invalid admin key" }));
    return false;
  }
  return true;
}

export function json(res, status, data) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.setHeader("cache-control", "no-store, max-age=0, must-revalidate");
  res.end(JSON.stringify(data));
}
