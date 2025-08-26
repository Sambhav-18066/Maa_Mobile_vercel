
# Maa Mobile with Supabase

This build keeps ALL Flipkart-clone features: hero banners, Flipkart-style success page, WhatsApp integration, and admin panel.

Now orders persist to **Supabase Postgres**.

## Setup

1. Create a Supabase project.
2. Create `orders` table:

```sql
create table orders (
  id text primary key,
  created_at timestamp default now(),
  name text,
  phone text,
  address text,
  payment text,
  whatsapp text,
  status text default 'new',
  items jsonb,
  total int
);
```

3. In Vercel → Project → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR.supabase.co
SUPABASE_SERVICE_ROLE=your-service-role-key
ADMIN_KEY=your-admin-password
```

4. Deploy → visit `/admin` with your ADMIN_KEY to manage orders.
