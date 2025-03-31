import { createClient as createClientBase } from '@supabase/supabase-js';

export function createClient(cookieStore) {
  return createClientBase(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          cookie: cookieStore.toString(),
        },
      },
    }
  );
} 