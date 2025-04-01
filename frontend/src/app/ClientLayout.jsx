'use client';

import { usePathname } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { UserProfile } from '@/components/UserProfile';
import { useOnboarding } from '@/hooks/useOnboarding';
import { RequireTeam } from '@/components/RequireTeam';
import { Toaster } from "@/components/ui/toaster";

const PUBLIC_PATHS = ['/', '/login', '/signup', '/verify-email'];

export function ClientLayout({ children }) {
  const pathname = usePathname();
  const { isLoading } = useOnboarding();

  // Don't wrap public paths with RequireTeam
  if (PUBLIC_PATHS.includes(pathname)) {
    return (
      <>
        {children}
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Navigation />
          <div className="flex flex-1 items-center justify-end space-x-4">
            <UserProfile />
          </div>
        </div>
      </header>
      <main className="container py-6">
        <RequireTeam>
          {children}
        </RequireTeam>
      </main>
      <Toaster />
    </div>
  );
} 