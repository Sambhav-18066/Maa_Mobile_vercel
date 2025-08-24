
# Admin Setup

This build includes a password-protected admin at **/admin**.

## 1) Enable storage (Vercel KV)
- In Vercel → *Integrations* → add **Vercel KV** (Upstash).
- It will inject `KV_URL` and `KV_REST_API_TOKEN` automatically.

## 2) Add an admin key
- In Vercel → *Project → Settings → Environment Variables*:
  - `ADMIN_KEY`: set to a strong random string.

## 3) Deploy

## 4) Use the admin
- Visit `/admin` and paste the same `ADMIN_KEY` to load orders.
- You can change status (new → confirmed → packed → shipped → delivered).

Orders are created by the checkout page via `/api/orders/create`. They still
send a WhatsApp prefilled message to **918908884402** so you don't miss them.
