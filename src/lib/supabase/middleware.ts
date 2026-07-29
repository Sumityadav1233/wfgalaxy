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

    const adminCookie = request.cookies.get('wf_galaxy_admin_session')?.value

    if (request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin/login') {
      if (adminCookie) {
        // Authenticated via direct email & password session cookie
        return supabaseResponse
      }

      if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/admin/login'
        return NextResponse.redirect(url)
      }

      // Check 1: Check admin table (singular)
      const { data: adminRecordSingular } = await supabase
        .from('admin')
        .select('email')
        .eq('email', user.email)
        .maybeSingle()

      // Check 2: Check admins table (plural)
      const { data: adminRecordPlural } = await supabase
        .from('admins')
        .select('email')
        .eq('email', user.email)
        .maybeSingle()

      // Check 3: Check profiles table (role = 'admin')
      const { data: profileRecord } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle()

      const allowedAdmins = ['wfgalaxy6977@gmail.com', 'mrgf7h@gmail.com', 'admin@wfgalaxy.com', 'owner@wfgalaxy.com', 'manager@wfgalaxy.com'];
      const isAllowedEmail = user.email ? allowedAdmins.includes(user.email.toLowerCase()) : false;

      const isAdmin = Boolean(
        isAllowedEmail ||
        adminRecordSingular ||
        adminRecordPlural || 
        (profileRecord && profileRecord.role === 'admin')
      )

      if (!isAdmin) {
        const url = request.nextUrl.clone()
        url.pathname = '/admin/login'
        return NextResponse.redirect(url)
      }
    }
  } catch (err) {
    console.error('Supabase middleware error:', err)
  }

  return supabaseResponse
}
