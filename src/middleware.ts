import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  const { data: { session } } = await supabase.auth.getSession();

  // Protected routes pattern
  const protectedPaths = [
    '/dashboard',
    '/loads',
    '/documents',
    '/teams',
    '/fleet'
  ];
  
  const isProtectedRoute = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // Development mode warnings
  if (process.env.NODE_ENV === 'development') {
    const isUnhandledPath = !protectedPaths.some(path => 
      request.nextUrl.pathname.startsWith(path)
    );
    if (isUnhandledPath) {
      console.warn(`Unhandled path in middleware: ${request.nextUrl.pathname}`);
    }
  }

  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', request.url);
    // Preserve the original URL for post-login redirect
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 