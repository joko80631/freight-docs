"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Filter, Plus, Truck, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/ui/empty-state"
import { cn } from "@/lib/utils"
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton"

// Force dynamic rendering to prevent caching issues
export const dynamic = 'force-dynamic';

export default function LoadsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [loads, setLoads] = useState([]);
  
  // Simulate loading data
  useState(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50/50">
      <main className="flex-1 p-6 md:p-8 lg:p-10">
        {/* Header Section with Primary CTA */}
        <section className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold md:text-2xl">Loads</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage your freight shipments</p>
          </div>
          <Button 
            size="lg" 
            className="flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow"
            onClick={() => router.push('/loads/new')}
          >
            <Plus className="h-4 w-4" />
            Create New Load
          </Button>
        </section>

        {/* Search and Filter Section */}
        <section className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search loads by ID, origin, destination..." 
                className="pl-9"
                disabled={isLoading}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" disabled={isLoading} className="gap-2">
                <Filter className="h-4 w-4" />
                Status
              </Button>
              <Button variant="outline" disabled={isLoading} className="gap-2">
                <Filter className="h-4 w-4" />
                Date
              </Button>
            </div>
          </div>
        </section>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Loading your loads...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && loads.length === 0 && (
          <EmptyState
            icon={Truck}
            title="No Loads Found"
            description="You haven't created any shipments yet. Create your first load to get started."
            action={{
              label: "Create Your First Load",
              onClick: () => router.push('/loads/new')
            }}
          />
        )}

        {/* Loads Grid */}
        {!isLoading && loads.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {loads.map((load, index) => (
              <Card 
                key={index}
                className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                onClick={() => router.push(`/loads/${load.id}`)}
              >
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-lg font-semibold">Load #{load.id}</CardTitle>
                  <CardDescription>{load.status}</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Origin</span>
                      <span className="text-sm font-medium">{load.origin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Destination</span>
                      <span className="text-sm font-medium">{load.destination}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Created</span>
                      <span className="text-sm font-medium">{load.createdAt}</span>
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
                  <LoadingSkeleton className="h-6 w-24" />
                  <LoadingSkeleton className="mt-2 h-4 w-16" />
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <LoadingSkeleton className="h-4 w-16" />
                      <LoadingSkeleton className="h-4 w-24" />
                    </div>
                    <div className="flex justify-between">
                      <LoadingSkeleton className="h-4 w-20" />
                      <LoadingSkeleton className="h-4 w-28" />
                    </div>
                    <div className="flex justify-between">
                      <LoadingSkeleton className="h-4 w-16" />
                      <LoadingSkeleton className="h-4 w-20" />
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