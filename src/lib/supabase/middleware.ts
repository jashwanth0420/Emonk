import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
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

  const { data: { user } } = await supabase.auth.getUser()
  
  const pathname = request.nextUrl.pathname
  const isAuthRoute = pathname.startsWith('/login')
  const isAdminRoute = pathname.startsWith('/admin')
  const isTutorRoute = pathname.startsWith('/tutor')
  const isStudentRoute = pathname.startsWith('/student')
  const isProtectedRoute = isAdminRoute || isTutorRoute || isStudentRoute

  // Not logged in? Redirect to login
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Logged in and trying to access login page? Redirect to their dashboard
  if (user && isAuthRoute) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const role = profile?.role || 'student'
    const url = request.nextUrl.clone()
    url.pathname = getRoleBasePath(role) + '/dashboard'
    return NextResponse.redirect(url)
  }

  // Logged in and accessing a protected route? Enforce correct role routing
  if (user && isProtectedRoute) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const role = profile?.role || 'student'
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
    case 'super_admin': return '/admin'
    case 'tutor': return '/tutor'
    case 'student': return '/student'
    default: return '/student'
  }
}
