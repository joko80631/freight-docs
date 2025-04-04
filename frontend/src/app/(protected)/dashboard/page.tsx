'use client';

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  Package, 
  FileText, 
  DollarSign, 
  Clock, 
  Plus, 
  Upload, 
  Users,
  TrendingUp, 
  TrendingDown,
  LucideIcon
} from "lucide-react";
import { 
  FreightCard, 
  FreightBadge, 
  FreightButton,
  Timeline
} from "@/components/freight";
import { LoadingSkeleton } from "@/components/shared";
import { useRouter } from "next/navigation";

// Force dynamic rendering to prevent caching issues
export const dynamic = 'force-dynamic';

const ONBOARDING_STORAGE_KEY = "freightdocs_onboarding_status";

// Define types for our data
interface Metric {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: LucideIcon;
  description: string;
}

interface TimelineItem {
  title: string;
  description: string;
  metadata: { 
    time: string; 
    user: string; 
  };
  variant: "info" | "success" | "warning" | "error";
}

// Dashboard metrics data
const metrics: Metric[] = [
  {
    title: "Active Loads",
    value: "12",
    change: "+2",
    trend: "up",
    icon: Package,
    description: "Currently active shipments",
  },
  {
    title: "Pending Documents",
    value: "8",
    change: "-3",
    trend: "down",
    icon: FileText,
    description: "Documents awaiting upload",
  },
  {
    title: "Revenue",
    value: "$24,500",
    change: "+12%",
    trend: "up",
    icon: DollarSign,
    description: "This month's revenue",
  },
  {
    title: "Average Transit Time",
    value: "3.2 days",
    change: "-0.5",
    trend: "up",
    icon: Clock,
    description: "Average delivery time",
  },
];

// Quick actions data
const actions = [
  {
    title: "New Load",
    description: "Create a new load to track",
    icon: Package,
    path: "/loads/new",
  },
  {
    title: "Upload Document",
    description: "Upload a BOL, POD, or invoice",
    icon: Upload,
    path: "/upload",
  },
  {
    title: "Team Members",
    description: "Manage team access",
    icon: Users,
    path: "/teams",
  },
];

// Activity timeline data
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

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check onboarding status from localStorage
    const savedStatus = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (savedStatus) {
      const { dismissed } = JSON.parse(savedStatus);
      setIsNewUser(!dismissed);
    } else {
      // If no status is saved, user is new
      setIsNewUser(true);
    }

    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
      {/* 1. Page Header with proper typography hierarchy */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-gray-900">
          Welcome back, {isLoading ? <LoadingSkeleton className="h-6 w-32" /> : "John"}
        </h1>
        <p className="text-sm text-gray-500">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {/* Onboarding Checklist for New Users */}
      {isNewUser && (
        <FreightCard variant="subtle">
          <div className="p-4 md:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Welcome to FreightDocs</h2>
            <p className="text-sm text-gray-700 mb-4">
              Let's get you started with a few simple steps to set up your account.
            </p>
            {/* Onboarding checklist content would go here */}
          </div>
        </FreightCard>
      )}

      {/* 2. Metrics Grid - EACH metric in its OWN FreightCard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          // Loading skeletons for metrics
          Array.from({ length: 4 }).map((_, i) => (
            <FreightCard key={i} className="p-4 md:p-6">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500">
                  <LoadingSkeleton className="h-4 w-24" />
                </span>
                <span className="mt-1 text-2xl font-semibold text-gray-900">
                  <LoadingSkeleton className="h-8 w-16" />
                </span>
                <span className="mt-1 text-xs text-gray-500">
                  <LoadingSkeleton className="h-3 w-32" />
                </span>
              </div>
            </FreightCard>
          ))
        ) : (
          // Actual metrics
          metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <FreightCard key={metric.title} className="p-4 md:p-6">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{metric.title}</span>
                    <Icon className="h-4 w-4 text-gray-400" />
                  </div>
                  <span className="mt-1 text-2xl font-bold text-gray-900">{metric.value}</span>
                  <div className="mt-1 flex items-center text-xs">
                    {metric.trend === "up" ? (
                      <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
                    )}
                    <span className={metric.trend === "up" ? "text-green-500" : "text-red-500"}>
                      {metric.change}
                    </span>
                    <span className="ml-1 text-gray-500">{metric.description}</span>
                  </div>
                </div>
              </FreightCard>
            );
          })
        )}
      </div>

      {/* 3. Two-column Layout for Actions and Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FreightCard header={{ title: "Quick Actions" }}>
          <div className="p-4 md:p-6 space-y-3">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <FreightButton
                  key={action.title}
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => router.push(action.path)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <div className="flex flex-col items-start">
                    <span>{action.title}</span>
                    <span className="text-xs text-gray-500">{action.description}</span>
                  </div>
                </FreightButton>
              );
            })}
          </div>
        </FreightCard>

        <FreightCard header={{ title: "Recent Activity" }} className="lg:col-span-2">
          <Timeline items={timelineItems} />
        </FreightCard>
      </div>
    </div>
  );
} 