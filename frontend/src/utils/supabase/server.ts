import { createClient as createClientBase } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export function createClient(cookieStore: ReturnType<typeof cookies>) {
  return createClientBase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          cookie: cookieStore.toString(),
        },
      },
    }
  );
} 