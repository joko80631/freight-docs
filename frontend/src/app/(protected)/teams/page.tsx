"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Filter, Plus, Users, Loader2, Building2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/ui/empty-state"
import { cn } from "@/lib/utils"
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton"

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
  const [isLoading, setIsLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  
  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50/50">
      <main className="flex-1 p-6 md:p-8 lg:p-10">
        {/* Header Section with Primary CTA */}
        <section className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold md:text-2xl">Teams</h1>
            <p className="mt-1 text-sm text-muted-foreground">Organize teams to streamline document handling and shipment management</p>
          </div>
          <Button 
            size="lg" 
            className="flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow"
            onClick={() => router.push('/teams/new')}
          >
            <Plus className="h-4 w-4" />
            Create Team
          </Button>
        </section>

        {/* Search and Filter Section */}
        <section className="mb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search teams by name..." 
                className="pl-9"
                disabled={isLoading}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" disabled={isLoading} className="gap-2">
                <Filter className="h-4 w-4" />
                Role
              </Button>
              <Button variant="outline" disabled={isLoading} className="gap-2">
                <Users className="h-4 w-4" />
                Members
              </Button>
            </div>
          </div>
        </section>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Loading your teams...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && teams.length === 0 && (
          <EmptyState
            icon={Users}
            title="No Teams Created"
            description="Create your first team to collaborate with members and manage freight efficiently."
            action={{
              label: "Create Your First Team",
              onClick: () => router.push('/teams/new')
            }}
          />
        )}

        {/* Teams Grid */}
        {!isLoading && teams.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {teams.map((team, index) => (
              <Card 
                key={index}
                className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                onClick={() => router.push(`/teams/${team.id}`)}
              >
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold truncate">{team.name}</CardTitle>
                      <CardDescription>{team.role}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Members</span>
                      <span className="text-sm font-medium">{team.memberCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Created</span>
                      <span className="text-sm font-medium">{team.createdAt}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Loading Skeletons (shown during initial load) */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array(8).fill(0).map((_, index) => (
              <Card key={index} className="overflow-hidden border border-border/40 shadow-sm">
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center gap-2">
                    <LoadingSkeleton className="h-8 w-8 rounded-full" />
                    <div>
                      <LoadingSkeleton className="h-6 w-32" />
                      <LoadingSkeleton className="mt-2 h-4 w-20" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <LoadingSkeleton className="h-4 w-16" />
                      <LoadingSkeleton className="h-4 w-8" />
                    </div>
                    <div className="flex justify-between">
                      <LoadingSkeleton className="h-4 w-16" />
                      <LoadingSkeleton className="h-4 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
} 