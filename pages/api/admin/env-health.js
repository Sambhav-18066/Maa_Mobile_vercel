// pages/api/admin/env-health.js
export default function handler(req, res) {
  res.status(200).json({
    NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    SUPABASE_SERVICE_ROLE: Boolean(process.env.SUPABASE_SERVICE_ROLE),
  });
}
