"use client"

import { useRouter } from "next/navigation"
import { BarChart, Clock, DollarSign, FileText, Package, Truck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton"
import { useDashboardData } from "@/hooks/useDashboardData"

// Force dynamic rendering to prevent caching issues
export const dynamic = 'force-dynamic';

export default function Dashboard() {
  const router = useRouter();
  const { userName, metrics, activities, insights, isLoading } = useDashboardData();

  // Format current date: Saturday, April 5, 2025
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Quick actions data
  const quickActions = [
    {
      title: "Create New Load",
      description: "Start a new shipment",
      icon: Package,
      path: "/loads/new",
    },
    {
      title: "Upload Documents",
      description: "Add BOL, invoice, etc.",
      icon: FileText,
      path: "/documents/upload",
    },
    {
      title: "View Reports",
      description: "Analytics and insights",
      icon: BarChart,
      path: "/reports",
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-white">
      <main className="flex-1 p-6 md:p-8 lg:p-10">
        {/* Header Section */}
        <section className="mb-10">
          <h1 className="text-2xl font-bold md:text-3xl">
            Welcome back, {isLoading ? <LoadingSkeleton className="h-8 w-32 inline-block" /> : userName}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">{currentDate}</p>
        </section>

        {/* Metrics Section */}
        <section className="mb-10">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              // Loading skeletons for metrics
              Array(4).fill(0).map((_, index) => (
                <Card key={index} className="overflow-hidden border border-border/40 shadow-sm">
                  <CardContent className="p-6">
                    <LoadingSkeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : (
              // Actual metrics
              metrics.map((metric, index) => (
                <Card
                  key={index}
                  className="overflow-hidden border border-border/40 shadow-sm hover:shadow transition-shadow duration-200"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                        <p className="mt-2 text-3xl font-bold">{metric.value}</p>
                        <p
                          className={cn(
                            "mt-2 text-xs font-medium",
                            metric.trendDirection === "up" ? "text-green-600" : "text-red-600",
                          )}
                        >
                          {metric.trend} vs last month
                        </p>
                      </div>
                      <div className="rounded-full bg-muted/50 p-2">
                        <metric.icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Operations Section */}
        <section>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Quick Actions */}
            <Card className="border border-border/40 shadow-sm lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="flex h-auto w-full items-center justify-start gap-4 border border-border/60 p-4 text-left hover:bg-muted/50 hover:border-border transition-colors"
                    onClick={() => router.push(action.path)}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{action.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border border-border/40 shadow-sm lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates from your shipments</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  // Loading skeletons for activities
                  <div className="space-y-6">
                    {Array(3).fill(0).map((_, index) => (
                      <div key={index} className="relative flex gap-4">
                        <LoadingSkeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <LoadingSkeleton className="h-4 w-3/4" />
                          <LoadingSkeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Actual activities
                  <div className="space-y-6">
                    {activities.map((activity, index) => (
                      <div
                        key={index}
                        className={cn(
                          "relative flex gap-4",
                          index !== activities.length - 1 && "pb-6 border-b border-border/30",
                        )}
                      >
                        <div
                          className={cn(
                            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                            activity.type === "success" && "bg-green-100 text-green-600",
                            activity.type === "info" && "bg-blue-100 text-blue-600",
                            activity.type === "warning" && "bg-amber-100 text-amber-600",
                          )}
                        >
                          <activity.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between">
                            <p className="font-medium leading-none pt-1">{activity.title}</p>
                            <p className="text-xs text-muted-foreground whitespace-nowrap ml-4">{activity.timestamp}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
        
        {/* AI Insights Section */}
        {!isLoading && insights && (
          <section className="mt-10">
            <Card className="border border-border/40 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle>AI Insights</CardTitle>
                <CardDescription>Intelligent analysis of your freight operations</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{insights}</p>
              </CardContent>
            </Card>
          </section>
        )}
      </main>
    </div>
  )
} 