import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kwbdtacmwtiuoktrojkh.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_nilp-PnTGtpNmwJAi5DQ5Q_zK07iXCB'

// Public read-only client for fast storefront queries (does NOT touch cookies)
export function createPublicClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

// Auth-aware server client (for Admin auth & cookie management)
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignored when called from Server Component
          }
        },
      },
    }
  )
}
