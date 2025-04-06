"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { navigationConfig } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { UserNav } from "@/components/dashboard/user-nav";
import { forwardRef, useEffect, useRef } from "react";

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

  // Split navigation items into active and secondary sections
  const activePages = navigationConfig.filter(item => item.featureFlag !== false).slice(0, 3); // First 3 active items
  const secondaryPages = navigationConfig.filter(item => item.featureFlag !== false).slice(3); // Remaining active items
  const disabledPages = navigationConfig.filter(item => item.featureFlag === false); // Disabled items

  return (
    <aside
      ref={sidebarRef}
      id="main-sidebar"
      data-testid="sidebar"
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex h-full flex-col border-r border-border/80 bg-background/95 transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64",
        // Mobile behavior - no transform, just conditional rendering
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
          size="sm"
          className="ml-auto"
          onClick={() => setSidebarCollapsed(!collapsed)}
          data-testid="sidebar-toggle"
          aria-expanded={!collapsed}
          aria-controls="main-sidebar"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
          <span className="sr-only">
            {collapsed ? "Expand sidebar" : "Collapse sidebar"}
          </span>
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto">
        {/* Active Pages Section */}
        <div className="space-y-1 px-2 py-4">
          {activePages.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  collapsed && "justify-center"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {item.icon ? (
                  <item.icon
                    className={cn(
                      "h-5 w-5",
                      collapsed ? "mr-0" : "mr-3"
                    )}
                    aria-hidden="true"
                  />
                ) : (
                  <span className="h-5 w-5 mr-3" aria-hidden="true" />
                )}
                {!collapsed && <span>{item.label}</span>}
                {collapsed && (
                  <span className="sr-only">{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        {!collapsed && (
          <div className="px-4 py-2">
            <div className="h-px bg-border" />
          </div>
        )}

        {/* Secondary Pages Section */}
        <div className="space-y-1 px-2 py-4">
          {secondaryPages.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  collapsed && "justify-center"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {item.icon ? (
                  <item.icon
                    className={cn(
                      "h-5 w-5",
                      collapsed ? "mr-0" : "mr-3"
                    )}
                    aria-hidden="true"
                  />
                ) : (
                  <span className="h-5 w-5 mr-3" aria-hidden="true" />
                )}
                {!collapsed && <span>{item.label}</span>}
                {collapsed && (
                  <span className="sr-only">{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Disabled/Coming Soon Pages Section */}
        {disabledPages.length > 0 && (
          <>
            {/* Divider */}
            {!collapsed && (
              <div className="px-4 py-2">
                <div className="h-px bg-border" />
              </div>
            )}

            <div className="space-y-1 px-2 py-4">
              {disabledPages.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      collapsed && "justify-center",
                      "opacity-50 cursor-not-allowed"
                    )}
                    aria-current={isActive ? "page" : undefined}
                    onClick={(e) => e.preventDefault()}
                  >
                    {item.icon ? (
                      <item.icon
                        className={cn(
                          "h-5 w-5",
                          collapsed ? "mr-0" : "mr-3"
                        )}
                        aria-hidden="true"
                      />
                    ) : (
                      <span className="h-5 w-5 mr-3" aria-hidden="true" />
                    )}
                    {!collapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span>{item.label}</span>
                        {item.comingSoon && (
                          <span className="text-xs text-muted-foreground">Coming Soon</span>
                        )}
                      </div>
                    )}
                    {collapsed && (
                      <span className="sr-only">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </nav>
      
      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          {!collapsed && <span className="text-sm font-medium">Account</span>}
          <UserNav />
        </div>
      </div>
    </aside>
  );
});

Sidebar.displayName = "Sidebar"; 