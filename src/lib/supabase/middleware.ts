import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin/login') {
      if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/admin/login'
        return NextResponse.redirect(url)
      }

      // Query admins table for authorization
      const { data: adminRecord } = await supabase
        .from('admins')
        .select('email')
        .eq('email', user.email)
        .single()

      if (!adminRecord) {
        const url = request.nextUrl.clone()
        url.pathname = '/unauthorized'
        return NextResponse.redirect(url)
      }
    }
  } catch (err) {
    console.error('Supabase middleware error:', err)
  }

  return supabaseResponse
}
