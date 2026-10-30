import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from './admin'

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isAuthRoute = pathname.startsWith('/login')
  const isAdminRoute = pathname.startsWith('/admin')
  const isTutorRoute = pathname.startsWith('/tutor')
  const isStudentRoute = pathname.startsWith('/student')
  const isProtectedRoute = isAdminRoute || isTutorRoute || isStudentRoute
  const isRootRoute = pathname === '/'

  // Quick check: does the request even carry a Supabase auth token cookie?
  const allCookies = request.cookies.getAll()
  const hasAuthCookie = allCookies.some(
    c => (c.name.startsWith('sb-') && c.name.includes('-auth-token')) || c.name === 'user_role'
  )

  // 1. FAST PATH for unauthenticated users: 0ms, zero network calls to Supabase
  if (!hasAuthCookie) {
    if (isProtectedRoute || isRootRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    // Static assets or /login without session: pass immediately
    return NextResponse.next()
  }

  // 2. FAST PATH for root route redirect:
  if (isRootRoute) {
    const role = request.cookies.get('user_role')?.value || 'admin'
    const url = request.nextUrl.clone()
    url.pathname = getRoleBasePath(role) + '/dashboard'
    return NextResponse.redirect(url)
  }

  // 3. Authenticated session validation
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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

  const { data: { user } } = await supabase.auth.getUser()

  // Not logged in? Redirect to login
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Logged in and trying to access login page? Redirect to their dashboard
  if (user && isAuthRoute) {
    let role = request.cookies.get('user_role')?.value
    if (!role) {
      const adminClient = createAdminClient()
      const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single()
      role = profile?.role || 'student'
      supabaseResponse.cookies.set('user_role', role, { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 })
    }
    const url = request.nextUrl.clone()
    url.pathname = getRoleBasePath(role) + '/dashboard'
    return NextResponse.redirect(url)
  }

  // Logged in and accessing a protected route? Enforce correct role routing
  if (user && isProtectedRoute) {
    let role = request.cookies.get('user_role')?.value
    if (!role) {
      const adminClient = createAdminClient()
      const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single()
      role = profile?.role || 'student'
      supabaseResponse.cookies.set('user_role', role, { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 })
    }
    const correctBasePath = getRoleBasePath(role)

    // Check if user is on the wrong section
    if (isAdminRoute && correctBasePath !== '/admin') {
      const url = request.nextUrl.clone()
      url.pathname = correctBasePath + '/dashboard'
      return NextResponse.redirect(url)
    }
    if (isTutorRoute && correctBasePath !== '/tutor') {
      const url = request.nextUrl.clone()
      url.pathname = correctBasePath + '/dashboard'
      return NextResponse.redirect(url)
    }
    if (isStudentRoute && correctBasePath !== '/student') {
      const url = request.nextUrl.clone()
      url.pathname = correctBasePath + '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

function getRoleBasePath(role: string): string {
  switch (role) {
    case 'super_admin': 
    case 'admin': 
      return '/admin'
    case 'tutor': 
      return '/tutor'
    case 'student': 
    default:
      return '/student'
  }
}
