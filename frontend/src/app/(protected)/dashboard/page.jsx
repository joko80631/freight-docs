'use client';

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  OnboardingChecklist,
  MetricsGrid,
  ActivityFeed,
  QuickActions,
} from "@/components/dashboard";
import { LoadingSkeleton } from "@/components/shared";

const ONBOARDING_STORAGE_KEY = "freightdocs_onboarding_status";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

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
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {isLoading ? <LoadingSkeleton className="h-8 w-32" /> : "John"}
        </h1>
        <p className="text-muted-foreground">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {/* Onboarding Checklist for New Users */}
      {isNewUser && <OnboardingChecklist />}

      {/* Metrics Grid */}
      <MetricsGrid isLoading={isLoading} />

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <QuickActions />

        {/* Recent Activity */}
        <ActivityFeed isLoading={isLoading} />
      </div>
    </div>
  );
} 