'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Users } from 'lucide-react';
import { useTeamStore } from '@/store/teamStore';

export function Navigation() {
  const pathname = usePathname();
  const { role } = useTeamStore();

  const isActive = (path) => pathname === path;

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <Link
        href="/"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          isActive('/') ? "text-primary" : "text-muted-foreground"
        )}
      >
        Dashboard
      </Link>
      <Link
        href="/loads"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          isActive('/loads') ? "text-primary" : "text-muted-foreground"
        )}
      >
        Loads
      </Link>
      <Link
        href="/documents"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          isActive('/documents') ? "text-primary" : "text-muted-foreground"
        )}
      >
        Documents
      </Link>
      {role === 'ADMIN' && (
        <Link
          href="/team"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            isActive('/team') ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Users className="h-4 w-4 mr-1 inline-block" />
          Team
        </Link>
      )}
    </nav>
  );
} 