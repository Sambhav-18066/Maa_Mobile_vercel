import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE // server-only

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL not set")
}
if (!serviceKey) {
  console.warn("[warn] SUPABASE_SERVICE_ROLE is not set. API routes will fail on DB access.")
}

export const supabaseAdmin = createClient(supabaseUrl, serviceKey)
