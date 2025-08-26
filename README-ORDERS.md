# Orders & Tracking Setup

1) Create a Supabase project → copy **Project URL** and **Service Role Key**.
2) In Vercel → Project → Settings → Environment Variables, set:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `SUPABASE_SERVICE_ROLE` = **Service Role Key** (server only; never expose in client)
   - `ADMIN_KEY` = any strong string for admin panel access
3) In Supabase SQL Editor, run `supabase/schema.sql` from this repo.
4) Deploy. Open `/admin` → enter your `ADMIN_KEY` once. You can see, filter, and update orders & ETA.
5) Customers can check `/myorders`, enter their phone, and see live status with timestamps and expected delivery.
