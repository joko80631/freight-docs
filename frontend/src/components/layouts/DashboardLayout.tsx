"use client";

import * as React from "react";
import { Suspense } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { SideNav } from "@/components/layouts/SideNav";
import { TopBar } from "@/components/layouts/TopBar";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardLayout({
  children,
  className,
}: DashboardLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useLocalStorage(
    "sidebar-collapsed",
    false
  );
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  const handleSidebarToggle = React.useCallback(() => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  }, [isSidebarCollapsed, setIsSidebarCollapsed]);

  const handleMobileSidebarToggle = React.useCallback(() => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  }, [isMobileSidebarOpen]);

  // Close mobile sidebar when screen size changes to desktop
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground">
      <TopBar 
        className="border-b border-border/40 backdrop-blur-sm"
        onSidebarToggle={handleMobileSidebarToggle} 
        sidebarOpen={isMobileSidebarOpen} 
      />
      
      <div className="flex-1 flex">
        {/* Mobile overlay */}
        {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-20 md:hidden"
            onClick={handleMobileSidebarToggle}
            aria-hidden="true"
          />
        )}
        
        <SideNav 
          className={cn(
            "border-r border-border/80 bg-background/95",
            "md:translate-x-0 transition-transform duration-300 ease-in-out",
            isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
          collapsed={isSidebarCollapsed} 
        />
        
        <main className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "md:pl-16" : "md:pl-64",
          className
        )}>
          <ErrorBoundary>
            <Suspense fallback={<PageSkeleton />}>
              {children}
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
} 