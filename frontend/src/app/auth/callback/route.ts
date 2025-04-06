import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';
  const origin = requestUrl.origin;

  if (code) {
    try {
      const supabase = createRouteHandlerClient({ cookies });
      await supabase.auth.exchangeCodeForSession(code);
      // Successful auth, redirect to next page
      return NextResponse.redirect(new URL(next, origin));
    } catch (error) {
      console.error('Auth callback error:', error);
      // Auth failed, redirect to login with error
      return NextResponse.redirect(
        new URL(`/login?error=Authentication failed`, origin)
      );
    }
  }

  // No code provided, redirect to login
  return NextResponse.redirect(new URL('/login', origin));
} 