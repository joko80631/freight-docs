import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Define protected routes
  const protectedRoutes = [
    '/dashboard',
    '/loads',
    '/upload',
    '/documents',
    '/settings',
    '/teams'
  ]

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/login',
    '/signup',
    '/verify-email',
    '/forgot-password',
    '/test-auth'
  ]

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  // If accessing a protected route without a session
  if (isProtectedRoute && !session) {
    // Store the original URL for redirect after login
    const redirectUrl = req.nextUrl.pathname + req.nextUrl.search
    const redirectTo = new URL('/login', req.url)
    redirectTo.searchParams.set('redirectTo', redirectUrl)

    return NextResponse.redirect(redirectTo)
  }

  // If accessing auth pages while logged in, redirect to dashboard
  if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/loads', req.url))
  }

  // Handle email verification
  if (req.nextUrl.pathname === '/verify-email') {
    const token = req.nextUrl.searchParams.get('token')
    const type = req.nextUrl.searchParams.get('type')

    if (!token || type !== 'email_verification') {
      return NextResponse.redirect(new URL('/login', req.url))
    }
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