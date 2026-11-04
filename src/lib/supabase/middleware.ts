import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isAuthRoute = pathname.startsWith('/login')
  const isAdminRoute = pathname.startsWith('/admin')
  const isTutorRoute = pathname.startsWith('/tutor')
  const isStudentRoute = pathname.startsWith('/student')
  const isProtectedRoute = isAdminRoute || isTutorRoute || isStudentRoute
  const isRootRoute = pathname === '/'

  // 1. Check for Supabase session cookies or user_role cookie
  const allCookies = request.cookies.getAll()
  const hasAuthCookie = allCookies.some(
    c => (c.name.startsWith('sb-') && c.name.includes('-auth-token')) || c.name === 'user_role'
  )

  // 2. Unauthenticated fast path: 0ms
  if (!hasAuthCookie) {
    if (isProtectedRoute || isRootRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // 3. Resolve role in 0ms from cookie or requested route
  let role = request.cookies.get('user_role')?.value
  if (!role) {
    if (isAdminRoute) role = 'admin'
    else if (isTutorRoute) role = 'tutor'
    else if (isStudentRoute) role = 'student'
    else role = 'admin'
  }

  // 4. Root redirect in 0ms
  if (isRootRoute) {
    const url = request.nextUrl.clone()
    url.pathname = getRoleBasePath(role) + '/dashboard'
    return NextResponse.redirect(url)
  }

  // 5. Already logged in and visiting /login? Redirect to dashboard in 0ms
  if (isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = getRoleBasePath(role) + '/dashboard'
    return NextResponse.redirect(url)
  }

  // 6. Fast-path for all protected routes and RSC navigations:
  // Forward request with injected x-user-role header and user_role cookie in 0ms!
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-role', role)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Ensure user_role cookie persists in the browser
  response.cookies.set('user_role', role, {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  })

  return response
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
