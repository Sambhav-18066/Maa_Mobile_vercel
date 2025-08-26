import { createClient } from '@supabase/supabase-js'

// Use server-side service role key in API routes only. Do not expose in client code.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY  // set this to the *service role* key in your server env

export const supabase = createClient(supabaseUrl, supabaseKey)
