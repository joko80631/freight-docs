"use client";

import { AuthProvider } from '@/providers/auth-provider';
import { Toaster } from '@/components/ui/toaster';

export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  );
} 