import { NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest } from 'next/server';
import { routes } from '@/config/routes';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  const protectedPaths = ['/dashboard', '/loads', '/fleet', '/documents'];
  const isProtected = protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path));

  // Protected routes pattern
  const protectedPathsPattern = [
    routes.dashboard,
    routes.loads.index,
    routes.documents.index,
    routes.teams.index,
    routes.fleet.index
  ];
  
  const isProtectedRoute = protectedPathsPattern.some(path => 
    req.nextUrl.pathname.startsWith(path)
  );

  // Development mode warnings
  if (process.env.NODE_ENV === 'development') {
    const isUnhandledPath = !protectedPathsPattern.some(path => 
      req.nextUrl.pathname.startsWith(path)
    );
    if (isUnhandledPath) {
      // Log to development error tracking service if needed
      // For now, silently ignore unhandled paths in development
    }
  }

  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', req.url);
    // Preserve the original URL for post-login redirect
    redirectUrl.searchParams.set('redirect', req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ['/dashboard', '/loads', '/fleet', '/documents'],
}; 