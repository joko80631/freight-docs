"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navigationConfig } from "@/config/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SideNavProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export function SideNav({ isCollapsed, setIsCollapsed }: SideNavProps) {
  const pathname = usePathname();
  const navRef = React.useRef<HTMLElement>(null);
  
  // Focus management for sidebar collapse/expand
  React.useEffect(() => {
    if (navRef.current) {
      const focusableElements = navRef.current.querySelectorAll(
        'a[href], button, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        const firstElement = focusableElements[0] as HTMLElement;
        firstElement.focus({ preventScroll: true });
      }
    }
  }, [isCollapsed]);
  
  return (
    <aside
      ref={navRef}
      className={cn(
        "hidden w-[240px] flex-col border-r bg-muted/40 md:flex",
        isCollapsed && "w-[80px]"
      )}
    >
      <div className="flex h-14 items-center justify-between px-4">
        <span className={cn("font-semibold", isCollapsed && "hidden")}>
          Freight Dashboard
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
      <nav className="grid gap-1 p-2">
        {navigationConfig.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            aria-current={pathname === route.href ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
              pathname === route.href ? "bg-accent" : "transparent",
              isCollapsed && "justify-center"
            )}
          >
            <route.icon className="h-4 w-4" />
            {!isCollapsed && <span>{route.label}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
} 