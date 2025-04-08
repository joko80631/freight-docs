"use client";

import { AuthProvider } from '@/providers/auth-provider';

export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
} 