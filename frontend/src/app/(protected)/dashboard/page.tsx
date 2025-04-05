'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTeamStore } from '@/store/team-store';
import { FreightCard } from '@/components/freight/FreightCard';
import { FreightButton } from '@/components/freight/FreightButton';
import { DashboardSection } from '@/components/layout/DashboardSection';
import { Timeline } from '@/components/freight/Timeline';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

// Force dynamic rendering to prevent caching issues
export const dynamic = 'force-dynamic';

const ONBOARDING_STORAGE_KEY = "freightdocs_onboarding_status";

interface TimelineItem {
  title: string;
  description: string;
  metadata: { 
    time: string; 
    user: string; 
  };
  variant: "info" | "success" | "warning" | "error";
}

interface Metric {
  title: string;
  value: string;
  trend: "up" | "down";
  change: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface Action {
  title: string;
  description: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check onboarding status from localStorage
    const savedStatus = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (savedStatus) {
      const { dismissed } = JSON.parse(savedStatus);
      setIsLoading(!dismissed);
    } else {
      // If no status is saved, user is new
      setIsLoading(true);
    }
  }, []);

  // Example metrics data
  const metrics: Metric[] = [
    {
      title: "Total Loads",
      value: "1,234",
      trend: "up",
      change: "+12.5%",
      description: "vs last month",
      icon: ({ className }) => <div className={className}>📦</div>
    },
    {
      title: "Active Carriers",
      value: "45",
      trend: "up",
      change: "+5.2%",
      description: "vs last month",
      icon: ({ className }) => <div className={className}>🚛</div>
    },
    {
      title: "On-Time Delivery",
      value: "98.5%",
      trend: "up",
      change: "+2.1%",
      description: "vs last month",
      icon: ({ className }) => <div className={className}>⏱️</div>
    },
    {
      title: "Revenue",
      value: "$45.2K",
      trend: "down",
      change: "-3.4%",
      description: "vs last month",
      icon: ({ className }) => <div className={className}>💰</div>
    }
  ];

  // Example actions data
  const actions: Action[] = [
    {
      title: "Create New Load",
      description: "Start a new shipment",
      path: "/loads/new",
      icon: ({ className }) => <div className={className}>➕</div>
    },
    {
      title: "Upload Documents",
      description: "Add BOL, invoice, etc.",
      path: "/documents/upload",
      icon: ({ className }) => <div className={className}>📄</div>
    },
    {
      title: "View Reports",
      description: "Analytics and insights",
      path: "/reports",
      icon: ({ className }) => <div className={className}>📊</div>
    }
  ];

  // Example timeline data
  const timelineItems: TimelineItem[] = [
    {
      title: "New BOL uploaded",
      description: "Bill of Lading #12345 was uploaded for Load #789",
      metadata: { time: "5 minutes ago", user: "System" },
      variant: "info",
    },
    {
      title: "Load status updated",
      description: "Load #789 status changed to In Transit",
      metadata: { time: "15 minutes ago", user: "System" },
      variant: "success",
    },
    {
      title: "New team member",
      description: "Sarah Johnson joined the team",
      metadata: { time: "30 minutes ago", user: "Admin" },
      variant: "info",
    },
    {
      title: "Payment received",
      description: "Payment of $2,500 received for Load #789",
      metadata: { time: "1 hour ago", user: "System" },
      variant: "success",
    },
    {
      title: "Delay reported",
      description: "Load #789 delayed by 2 hours due to traffic",
      metadata: { time: "2 hours ago", user: "Carrier" },
      variant: "warning",
    },
  ];

  return (
    <div className="w-full max-w-screen-xl mx-auto px-6 md:px-10 py-10 space-y-12">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back, {isLoading ? <LoadingSkeleton className="h-6 w-32" /> : "John"}</h1>
        <p className="text-sm text-gray-500">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
      </header>

      <DashboardSection title="Metrics">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric) => (
            <FreightCard variant="elevated" key={metric.title}>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm text-gray-700">
                  <span className="font-medium">{metric.title}</span>
                  <metric.icon className="h-4 w-4 text-gray-400" />
                </div>
                <span className="text-2xl font-semibold text-gray-900">{metric.value}</span>
                <div className="flex items-center gap-1 text-xs">
                  {metric.trend === "up" ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
                  <span className={metric.trend === "up" ? "text-green-500" : "text-red-500"}>{metric.change}</span>
                  <span className="ml-1 text-gray-500">{metric.description}</span>
                </div>
              </div>
            </FreightCard>
          ))}
        </div>
      </DashboardSection>

      <DashboardSection title="Operations">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <FreightCard variant="elevated" header={{ title: "Quick Actions" }}>
            <div className="space-y-4">
              {actions.map((action) => (
                <FreightButton key={action.title} variant="secondary" className="w-full justify-start" onClick={() => router.push(action.path)}>
                  <action.icon className="mr-2 h-4 w-4" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-gray-900">{action.title}</span>
                    <span className="text-xs text-gray-500">{action.description}</span>
                  </div>
                </FreightButton>
              ))}
            </div>
          </FreightCard>

          <FreightCard variant="elevated" header={{ title: "Recent Activity" }} className="lg:col-span-2">
            <Timeline items={timelineItems} />
          </FreightCard>
        </div>
      </DashboardSection>
    </div>
  );
} 