"use client";

import * as React from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Section } from "@/components/ui/containers/Section";
import { Card } from "@/components/ui/containers/Card";
import { MetricCard } from "@/components/ui/data-display/MetricCard";
import { ActivityTimeline } from "@/components/ui/data-display/ActivityTimeline";
import { ActionButton } from "@/components/ui/actions/ActionButton";
import { mockMetrics, mockActivities, mockQuickActions } from "@/mocks/dashboard-data";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { useCustomSWR } from "@/hooks/use-custom-swr";
import Link from "next/link";
import { PageContainer } from "@/components/common/page-container";
import { PageHeader } from "@/components/common/page-header";
import { Package, Truck, DollarSign, TrendingUp } from "lucide-react";

interface DashboardMetric {
  title: string;
  value: string;
  description: string;
  trend: {
    value: number;
    isPositive: boolean;
  };
  icon: string;
}

type ActivityType = "error" | "default" | "success" | "warning";

interface DashboardActivity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date;
}

interface DashboardQuickAction {
  label: string;
  icon: string;
  href: string;
}

interface DashboardData {
  metrics: DashboardMetric[];
  activities: DashboardActivity[];
  quickActions: DashboardQuickAction[];
}

async function fetchDashboardData(): Promise<DashboardData> {
  // In a real app, this would be an API call
  return {
    metrics: [
      {
        title: "Total Shipments",
        value: "1,234",
        description: "Last 30 days",
        trend: {
          value: 12.5,
          isPositive: true,
        },
        icon: "package",
      },
      {
        title: "Active Fleet",
        value: "45",
        description: "Available vehicles",
        trend: {
          value: 2.3,
          isPositive: true,
        },
        icon: "truck",
      },
      {
        title: "Customer Satisfaction",
        value: "98%",
        description: "Based on reviews",
        trend: {
          value: 0.5,
          isPositive: true,
        },
        icon: "users",
      },
      {
        title: "Revenue",
        value: "$45,678",
        description: "Last 30 days",
        trend: {
          value: 8.2,
          isPositive: true,
        },
        icon: "dollar-sign",
      },
    ],
    activities: [
      {
        id: "1",
        type: "success",
        title: "New shipment created",
        description: "Shipment #1234 from NYC to LA",
        timestamp: new Date("2024-03-20T10:00:00Z"),
      },
      {
        id: "2",
        type: "success",
        title: "Delivery completed",
        description: "Shipment #1233 delivered to customer",
        timestamp: new Date("2024-03-20T09:30:00Z"),
      },
      {
        id: "3",
        type: "warning",
        title: "Vehicle maintenance required",
        description: "Truck #789 due for service",
        timestamp: new Date("2024-03-20T09:00:00Z"),
      },
    ],
    quickActions: [
      {
        label: "New Shipment",
        icon: "plus",
        href: "/dashboard/shipments/new",
      },
      {
        label: "Add Vehicle",
        icon: "truck",
        href: "/dashboard/fleet/new",
      },
      {
        label: "Create Report",
        icon: "file-text",
        href: "/dashboard/reports/new",
      },
    ],
  };
}

function DashboardContent() {
  const { data, error, isLoading } = useCustomSWR<DashboardData>(
    "dashboard-data",
    fetchDashboardData
  );

  if (error) {
    throw error;
  }

  if (isLoading || !data) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6 p-6">
      <Section title="Overview">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {data.metrics.map((metric) => (
            <MetricCard key={metric.title} {...metric} />
          ))}
        </div>
      </Section>

      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Quick Actions">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              {data.quickActions.map((action) => (
                <Link key={action.label} href={action.href}>
                  <ActionButton
                    variant="outline"
                    className="h-24 w-full"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-2xl">{action.icon}</span>
                      <span>{action.label}</span>
                    </div>
                  </ActionButton>
                </Link>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Recent Activity">
          <div className="space-y-4">
            <ActivityTimeline activities={data.activities} />
          </div>
        </Section>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Overview of your freight operations"
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Loads"
          value="1,234"
          description="Active freight loads"
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 12, isPositive: true }}
        />
        <MetricCard
          title="Fleet Size"
          value="56"
          description="Available vehicles"
          icon={<Truck className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 8, isPositive: true }}
        />
        <MetricCard
          title="Revenue"
          value="$45,678"
          description="This month"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 15, isPositive: true }}
        />
        <MetricCard
          title="Efficiency"
          value="92%"
          description="On-time delivery rate"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 5, isPositive: true }}
        />
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <Suspense fallback={<div>Loading activity...</div>}>
          <div className="rounded-lg border p-6">
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Activity timeline would be displayed here
            </div>
          </div>
        </Suspense>
      </div>
    </PageContainer>
  );
} 