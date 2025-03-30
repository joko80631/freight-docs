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
    '/loads',
    '/upload',
    '/documents',
    '/settings'
  ]

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
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