import { Suspense } from 'react';
import { TeamSwitcher } from '@/components/team/TeamSwitcher';
import { Skeleton } from '@/components/ui/skeleton';

interface TeamsLayoutProps {
  children: React.ReactNode;
}

export default function TeamsLayout({ children }: TeamsLayoutProps) {
  return (
    <div>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Suspense fallback={<TeamSwitcherSkeleton />}>
            <TeamSwitcher />
          </Suspense>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

function TeamSwitcherSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
} 