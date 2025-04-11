'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Users } from 'lucide-react';
import { useTeamStore } from '@/store/teamStore';
import { routes } from '@/config/routes';

export function Navigation() {
  const pathname = usePathname();
  const { role } = useTeamStore();

  const isActive = (path) => pathname === path;

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <Link
        href={routes.dashboard}
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          isActive(routes.dashboard) ? "text-primary" : "text-muted-foreground"
        )}
      >
        Dashboard
      </Link>
      <Link
        href={routes.loads.index}
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          isActive(routes.loads.index) ? "text-primary" : "text-muted-foreground"
        )}
      >
        Loads
      </Link>
      <Link
        href={routes.documents.index}
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          isActive(routes.documents.index) ? "text-primary" : "text-muted-foreground"
        )}
      >
        Documents
      </Link>
      {role === 'ADMIN' && (
        <Link
          href={routes.teams.index}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            isActive(routes.teams.index) ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Users className="h-4 w-4 mr-1 inline-block" />
          Team
        </Link>
      )}
    </nav>
  );
} 