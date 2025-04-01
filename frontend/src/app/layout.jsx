'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { TeamSelector } from "@/components/TeamSelector";
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from '@/components/Navigation';
import { UserProfile } from '@/components/UserProfile';
import { useOnboarding } from '@/hooks/useOnboarding';
import { RequireTeam } from '@/components/RequireTeam';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ["latin"] });

const PUBLIC_PATHS = ['/', '/login', '/signup', '/verify-email'];

export const metadata = {
  title: "Freight Management System",
  description: "Manage your freight operations efficiently",
};

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const { isLoading } = useOnboarding();

  // Don't wrap public paths with RequireTeam
  if (PUBLIC_PATHS.includes(pathname)) {
    return (
      <html lang="en">
        <body className={inter.className}>
          {children}
          <Toaster />
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className={inter.className}>
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
        </div>
        <Toaster />
      </body>
    </html>
  );
} 