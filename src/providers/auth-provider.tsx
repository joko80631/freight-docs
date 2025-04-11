"use client";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/auth-helpers-nextjs';

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  isAuthenticated: false,
  user: null,
  error: null,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Handle auth state changes
  const handleAuthStateChange = useCallback(async (session: any) => {
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
  }, [router]);

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

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated: !!user,
        user,
        error,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 