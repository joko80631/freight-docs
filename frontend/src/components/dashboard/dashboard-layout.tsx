"use client";

import * as React from "react";
import { Suspense, useEffect, useState } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage";
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
    <div className="min-h-screen bg-background" data-testid="dashboard-layout">
      <div className="flex">
        <Sidebar 
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed} 
        />
        {/* Mobile overlay - z-20 to be below sidebar (z-30) but above content */}
        <div 
          data-testid="mobile-overlay"
          className={cn(
            "fixed inset-0 z-20 bg-background/80 backdrop-blur-sm transition-opacity duration-300",
            "md:hidden", // Only show on mobile
            sidebarCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
          onClick={() => setSidebarCollapsed(true)}
        />
        <main 
          data-testid="main-content"
          className={cn(
            "flex-1 transition-all duration-300 ease-in-out",
            "min-h-screen",
            sidebarCollapsed ? "ml-16" : "ml-64",
            "md:ml-0" // On mobile, sidebar is absolute positioned
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
} 