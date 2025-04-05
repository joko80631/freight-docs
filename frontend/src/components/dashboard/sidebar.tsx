"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { navigationConfig } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarProps {
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean) => void;
  className?: string;
}

export function Sidebar({ 
  collapsed = false, 
  setCollapsed,
  className 
}: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  
  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (setCollapsed) {
      setCollapsed(newState);
    }
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex h-full flex-col border-r border-border/80 bg-background/95 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-4">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Freight</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          onClick={handleToggle}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
          <span className="sr-only">
            {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          </span>
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navigationConfig.map((item) => {
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
                    isCollapsed && "justify-center"
                  )}
                >
                  {item.icon && (
                    <item.icon
                      className={cn(
                        "h-5 w-5",
                        isCollapsed ? "mr-0" : "mr-3"
                      )}
                    />
                  )}
                  {!isCollapsed && <span>{item.label}</span>}
                  {isCollapsed && (
                    <span className="sr-only">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {!isCollapsed && (
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
    </aside>
  );
} 