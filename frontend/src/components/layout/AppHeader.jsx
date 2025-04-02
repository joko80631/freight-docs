'use client';

import React from 'react';
import Link from 'next/link';
import { useTeamStore } from '@/store/teamStore';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import TeamSelector from '@/components/teams/TeamSelector';
import UserProfileDropdown from '@/components/user/UserProfileDropdown';

const AppHeader = () => {
  const { currentTeam } = useTeamStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Freight</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="flex items-center gap-4">
            {currentTeam && (
              <div className="hidden md:flex items-center">
                <span className="text-sm text-muted-foreground">
                  Team: {currentTeam.name}
                </span>
              </div>
            )}
            <TeamSelector />
            <Link href="/teams/new">
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Team
              </Button>
            </Link>
            <UserProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader; 