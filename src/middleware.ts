import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { routes } from '@/config/routes';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Handle root path redirect
  if (req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Auth routes are in the (auth) group
  const isAuthRoute = req.nextUrl.pathname.startsWith("/(auth)");
  // Protected routes are in the (protected) group
  const isProtectedRoute = req.nextUrl.pathname.startsWith("/(protected)");

  // Redirect authenticated users away from auth routes
  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Redirect unauthenticated users to login
  if (!session && isProtectedRoute) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Handle email verification
  if (req.nextUrl.pathname === '/verify-email') {
    const token = req.nextUrl.searchParams.get('token');
    const type = req.nextUrl.searchParams.get('type');

    if (!token || type !== 'email_verification') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/dashboard', '/loads', '/fleet', '/documents'],
}; 