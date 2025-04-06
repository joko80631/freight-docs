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
  const [isMobile, setIsMobile] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar 
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed} 
        />
        {isMobile && !sidebarCollapsed && (
          <div 
            className="fixed inset-0 z-20 bg-background/80 backdrop-blur-sm"
            onClick={() => setSidebarCollapsed(true)}
          />
        )}
        <main className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "ml-16" : "ml-64",
          isMobile && "ml-0" // On mobile, sidebar is absolute positioned
        )}>
          {children}
        </main>
      </div>
    </div>
  );
} 