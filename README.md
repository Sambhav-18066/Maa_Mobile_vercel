# Maa Mobile – Flipkart‑style static shop

A lightweight, client‑side shop for **Mobiles, Electronics, Home Appliances and LPG** with **white‑purple‑gold** theme. 
Features search, category filters, cart, checkout with **COD or UPI**, and WhatsApp order sharing.

## Files
- `index.html` — Home with product grid, search, cart drawer
- `checkout.html` — Delivery form + UPI/COD + WhatsApp order
- `success.html` — Order confirmation
- `products.json` — Sample products (edit freely)
- `config.js` — Store name, colors, WhatsApp number, UPI settings
- `styles.css`, `app.js`, `cart.js`, `checkout.js`
- `assets/*` — Logo and placeholder SVGs

## Quick edit
Open `config.js` and set:
```js
ADMIN_WHATSAPP_NUMBER: "91XXXXXXXXXX",
UPI_ID: "yourupi@bank",
UPI_NAME: "Maa Mobile"
```

## Run locally
Just open `index.html` in a simple server (because `fetch` needs http):
```bash
# Python 3
python -m http.server 8080
# Then visit http://localhost:8080
```

## Deploy to Vercel (static)
1. Create a new GitHub repo and push these files (or upload the ZIP as a repo).
2. On Vercel, **New Project → Import** that repo.
3. **Framework Preset:** *Other* (no build), **Output Directory:** `/` (root).
4. Deploy. You’ll get a URL like `https://yourapp.vercel.app`.

> If you want a custom domain (e.g., `maamobile.in`), add it in Vercel → Domains and point your DNS (A/ALIAS/AAAA) as instructed.

## Notes
- All data is client‑side. For online payments or order storage, add a small backend later.
- The UPI deep link `upi://pay?...` works on most Android UPI apps.
- WhatsApp sharing opens the order summary with your configured number.