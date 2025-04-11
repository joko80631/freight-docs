'use client';

import { PropsWithChildren } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export function Providers({ children }: PropsWithChildren) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return (
    <>
      {children}
    </>
  );
} 