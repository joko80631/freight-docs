import { useState, useEffect, useContext } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User } from '@supabase/auth-helpers-nextjs';
import { AuthContext } from '@/providers/auth-provider';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Try to get auth context first
  const context = useContext(AuthContext);

  // Throw error if used outside of AuthProvider
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  useEffect(() => {
    // If we have a context, use that instead of Supabase directly
    if (context) {
      setUser(context.user);
      setIsLoading(context.isLoading);
      setError(context.error);
      return;
    }

    // Otherwise, use Supabase directly
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setError(error);
        setIsLoading(false);
        return;
      }
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [context]);

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
  };
} 