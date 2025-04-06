"use client";

import * as React from "react";
import { Suspense, useEffect, useState, useRef } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { Sidebar } from "@/components/dashboard/sidebar";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useTeamInitializer } from "@/hooks/useTeamInitializer";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage(
    "sidebar-collapsed",
    false
  );
  const [isMobile, setIsMobile] = useState(false);
  const isMobileQuery = useMediaQuery("(max-width: 768px)");
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // Initialize team context but don't block the UI
  useTeamInitializer();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update mobile state when media query changes
  useEffect(() => {
    setIsMobile(isMobileQuery);
  }, [isMobileQuery]);

  // Handle escape key to close sidebar on mobile
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobile && !sidebarCollapsed) {
        setSidebarCollapsed(true);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isMobile, sidebarCollapsed, setSidebarCollapsed]);

  if (!mounted) {
    return null;
  }

  // Determine if sidebar should be rendered on mobile
  const shouldRenderSidebar = !isMobile || !sidebarCollapsed;

  return (
    <div className="min-h-screen bg-background" data-testid="dashboard-layout">
      {/* Sidebar is conditionally rendered on mobile */}
      {shouldRenderSidebar && (
        <Sidebar 
          collapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          isMobile={isMobile}
          ref={sidebarRef}
        />
      )}
      
      {/* Mobile overlay - only rendered when sidebar is expanded on mobile */}
      {isMobile && !sidebarCollapsed && (
        <div 
          data-testid="mobile-overlay"
          className="fixed inset-0 z-20 bg-background/80 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setSidebarCollapsed(true)}
          aria-hidden="true"
        />
      )}
      
      {/* Main content area - clean and full-width */}
      <main 
        data-testid="main-content"
        className={cn(
          "min-h-screen w-full transition-all duration-300 ease-in-out",
          // Desktop layout - push content based on sidebar width using padding
          !isMobile && (sidebarCollapsed ? "pl-16" : "pl-64")
        )}
      >
        {children}
      </main>
    </div>
  );
} 