'use client';

import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardHeader({ user, team }) {
  if (!user || !team) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">
        Welcome back, {user.firstName}
      </h1>
      <p className="text-muted-foreground">
        You're viewing team: {team.name}
        {team.lastLogin && (
          <span className="ml-2">
            • Last login {formatDistanceToNow(new Date(team.lastLogin), { addSuffix: true })}
          </span>
        )}
      </p>
    </div>
  );
} 