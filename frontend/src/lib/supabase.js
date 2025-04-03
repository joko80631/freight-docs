import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// These are statically injected by Next.js at build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClientComponentClient() 