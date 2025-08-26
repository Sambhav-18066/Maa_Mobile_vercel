import { createClient } from '@supabase/supabase-js'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE
if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL not set")
export const supabaseAdmin = createClient(supabaseUrl, serviceKey)
