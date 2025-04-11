"use client";

import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Handle auth state changes
  const handleAuthStateChange = async (session: any) => {
    let mounted = true;
    try {
      if (session) {
        setUser(session.user);
        // If we're on the login page, redirect to dashboard
        if (window.location.pathname.includes('/login')) {
          await router.push('/dashboard');
        }
      } else {
        setUser(null);
        // Only redirect to login if we're not already there and not in auth callback
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/auth/callback')) {
          await router.push('/login');
        }
      }
    } catch (error) {
      if (mounted) {
        setError(error instanceof Error ? error : new Error(String(error)));
      }
    } finally {
      if (mounted) {
        setIsLoading(false);
      }
    }
    return () => {
      mounted = false;
    };
  };

  const signIn = async (email: string, password: string) => {
    let mounted = true;
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      if (mounted) {
        setError(error instanceof Error ? error : new Error(String(error)));
      }
    } finally {
      if (mounted) {
        setIsLoading(false);
      }
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      router.push('/login');
    } catch (error) {
      setError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (mounted) {
          await handleAuthStateChange(session);
        }
      } catch (error) {
        if (mounted) {
          setError(error instanceof Error ? error : new Error(String(error)));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initialize();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (mounted) {
        await handleAuthStateChange(session);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, supabase, handleAuthStateChange]);

  const value = {
    isLoading,
    isAuthenticated: !!user,
    user,
    error,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 