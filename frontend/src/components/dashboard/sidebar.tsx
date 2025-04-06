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

      <nav className="flex-1 overflow-y-auto py-4" role="navigation">
        <ul className="space-y-1 px-2">
          {navigationConfig.map((item) => {
            // Defensive check for required properties
            if (!item.href || !item.label) {
              console.error("Navigation item missing required properties:", item);
              return null;
            }
            
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
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
              </li>
            );
          })}
        </ul>
      </nav>

      {!collapsed && (
        <div className="border-t p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">Freight SaaS</p>
              <p className="text-xs text-muted-foreground">
                Version 1.0.0
              </p>
            </div>
          </div>
        </div>
      )}
      
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