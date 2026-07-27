import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
            // Ignored
          }
        },
      },
    }
  )

  await supabase.auth.signOut()

  const response = NextResponse.redirect(new URL('/admin/login', request.url), {
    status: 302,
  })

  response.cookies.set({
    name: 'wf_galaxy_admin_session',
    value: '',
    path: '/',
    maxAge: 0,
  })

  return response;
}
