'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useTeam } from '@/hooks/useTeam';
import UserProfileDropdown from './UserProfileDropdown';
import TeamSelector from './TeamSelector';

export default function AppHeader() {
  const [mounted, setMounted] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const { isLoading: teamLoading } = useTeam();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) return null;

  // Show loading state while auth or team data is loading
  if (authLoading || teamLoading) {
    return (
      <header className="sticky top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex h-full items-center justify-between">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-900">Freight</span>
            </div>
          </div>
        </nav>
      </header>
    );
  }

  // Don't show navigation for unauthenticated users
  if (!user) return null;

  return (
    <header className="sticky top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex h-full items-center justify-between">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-900">Freight</span>
            </Link>
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            <TeamSelector />
            <UserProfileDropdown />
          </div>
        </div>
      </nav>
    </header>
  );
} 