"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { navigationConfig } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { UserNav } from "@/components/dashboard/user-nav";
import { forwardRef, useEffect, useRef } from "react";
import { useTeamStore } from "@/store/team-store";
import TeamSwitcher from "@/components/team/TeamSwitcher";
import { Skeleton } from "@/components/ui/skeleton";

interface SidebarProps {
  collapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  className?: string;
  isMobile?: boolean;
}

export const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(({ 
  collapsed, 
  setSidebarCollapsed,
  className,
  isMobile = false
}, ref) => {
  const pathname = usePathname();
  const innerRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const { currentTeam, teams, isLoading } = useTeamStore();
  
  // Use the forwarded ref or the inner ref
  const sidebarRef = ref || innerRef;

  // Focus management when sidebar opens on mobile
  useEffect(() => {
    if (!collapsed && isMobile && innerRef.current) {
      // Focus the first focusable element
      const focusableElements = innerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  }, [collapsed, isMobile]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && isMobile) {
      // Get all focusable elements
      const focusableElements = innerRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (!focusableElements || focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      // If shift+tab on first element, trap focus
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } 
      // If tab on last element, trap focus
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  // Split navigation items into three groups with correct categorization
  const mainGroup = navigationConfig.filter(item => 
    ['Dashboard', 'Loads', 'Documents'].includes(item.label)
  );

  const systemGroup = navigationConfig.filter(item => 
    ['Teams', 'Settings', 'Help'].includes(item.label)
  );

  const comingSoonGroup = navigationConfig.filter(item => 
    ['Fleet', 'Customers', 'Analytics'].includes(item.label)
  );

  return (
    <aside
      ref={sidebarRef}
      id="main-sidebar"
      data-testid="sidebar"
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex h-full flex-col border-r border-border/80 bg-background/95 transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64",
        isMobile ? "translate-x-0" : "",
        className
      )}
      aria-label="Main navigation"
      onKeyDown={handleKeyDown}
      role="navigation"
    >
      <div className="flex h-14 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Freight</span>
          </Link>
        )}
        <Button
          ref={toggleButtonRef}
          variant="ghost"
          size="icon"
          onClick={() => setSidebarCollapsed(!collapsed)}
          className="h-8 w-8"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Team Switcher */}
      {!collapsed && (
        <div className="border-b p-4">
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <TeamSwitcher />
          )}
        </div>
      )}

      <nav className="flex-1 py-4">
        {/* Main Group */}
        <div className="space-y-1 px-2">
          {mainGroup.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                collapsed && "justify-center"
              )}
            >
              <item.icon className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </div>

        {/* Separator */}
        <div className="my-4 px-2">
          <div className="h-px bg-border/60" />
        </div>

        {/* System Group */}
        <div className="space-y-1 px-2">
          {systemGroup.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                collapsed && "justify-center"
              )}
            >
              <item.icon className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </div>

        {/* Separator */}
        <div className="my-4 px-2">
          <div className="h-px bg-border/60" />
        </div>

        {/* Coming Soon Group */}
        <div className="space-y-1 px-2">
          {comingSoonGroup.map((item) => (
            <div
              key={item.href}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground/50 cursor-not-allowed",
                collapsed && "justify-center"
              )}
              title={item.comingSoon ? "Coming soon" : "Not available"}
            >
              <item.icon className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
              {!collapsed && (
                <span className="flex items-center">
                  {item.label}
                  {item.comingSoon && (
                    <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      Soon
                    </span>
                  )}
                </span>
              )}
            </div>
          ))}
        </div>
      </nav>

      <div className="border-t p-4">
        <UserNav />
      </div>
    </aside>
  );
});

Sidebar.displayName = "Sidebar"; 