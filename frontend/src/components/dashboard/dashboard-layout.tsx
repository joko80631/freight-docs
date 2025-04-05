"use client";

import * as React from "react";
import { Suspense, useEffect, useState } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { TopBar } from "@/components/dashboard/top-bar";
import { Sidebar } from "@/components/dashboard/sidebar";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage(
    "sidebar-collapsed",
    false
  );

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <div className="flex">
        <Sidebar 
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed} 
        />
        <main className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "ml-16" : "ml-64",
          "md:ml-0" // On mobile, sidebar is absolute positioned
        )}>
          {children}
        </main>
      </div>
    </div>
  );
} 