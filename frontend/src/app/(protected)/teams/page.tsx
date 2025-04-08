"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { Search, Filter, Plus, Users, Loader2, Building2, PlusCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/ui/empty-state"
import { cn } from "@/lib/utils"
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton"
import { Skeleton } from '@/components/ui/skeleton'
import { useTeamStore } from '@/store/teamStore'
import Link from 'next/link'

// Force dynamic rendering to prevent caching issues
export const dynamic = 'force-dynamic';

// Define the Team type
interface Team {
  id: string;
  name: string;
  memberCount: number;
  createdAt: string;
  role: string;
}

export default function TeamsPage() {
  const router = useRouter();
  const { teams } = useTeamStore();

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Teams</h1>
          <p className="text-muted-foreground">
            View and manage your teams.
          </p>
        </div>
        <Button asChild>
          <Link href="/teams/new" className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Create Team
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Suspense fallback={<TeamCardsSkeleton />}>
          {teams.map((team) => (
            <Link key={team.id} href={`/teams/${team.id}`}>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-muted text-sm font-medium">
                      {team.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate">{team.name}</span>
                  </CardTitle>
                  <CardDescription>
                    {team.role === 'ADMIN' ? 'Admin' : 'Member'}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </Suspense>
      </div>
    </div>
  )
}

function TeamCardsSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-4 w-20 mt-2" />
          </CardHeader>
        </Card>
      ))}
    </>
  );
} 