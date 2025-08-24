# Maa Mobile – Next.js shop (Flipkart-style)

A minimal Next.js app that serves a Flipkart-style storefront for **Mobiles, Electronics, Home Appliances, LPG** with **white–purple–gold** theme.

## Quick start
```bash
npm i
npm run dev
# http://localhost:3000
```

## Deploy to Vercel
Connect this repo in Vercel. It will auto-detect Next.js and build.

## Configure
Edit `lib/storeConfig.js`:
- `ADMIN_WHATSAPP_NUMBER` (e.g., "91XXXXXXXXXX")
- `UPI_ID`, `UPI_NAME`
- Colors or categories

Products are in `/public/products.json`. Images live under `/public/assets/*`.