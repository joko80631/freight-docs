import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes that require authentication
  const protectedRoutes = ['/loads', '/upload']
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  // Auth routes that should redirect to dashboard if already logged in
  const authRoutes = ['/login', '/signup']
  const isAuthRoute = authRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/loads', req.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
} 