-- Supabase SQL: Orders schema & policies (secure)

create table if not exists public.orders (
  id text primary key,
  tracking_code text unique,
  name text,
  phone text,
  address text,
  whatsapp text,
  payment text,
  items jsonb,
  total numeric,
  status text default 'PLACED',
  status_timestamps jsonb default '{}'::jsonb,
  eta timestamptz,
  created_at timestamptz default now(),
  updatedAt timestamptz
);

-- Indexes
create index if not exists orders_phone_idx on public.orders (phone);
create index if not exists orders_created_at_idx on public.orders (created_at);

-- Enable RLS
alter table public.orders enable row level security;

-- Policies:
-- Allow anonymous INSERTs so customers can place orders via API (API uses service key anyway).
drop policy if exists "Allow anonymous insert" on public.orders;
create policy "Allow anonymous insert"
  on public.orders for insert
  to anon
  with check (true);

-- No anon SELECT/UPDATE/DELETE. Admin/API uses service role which bypasses RLS.
