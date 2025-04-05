import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navigation } from "@/config/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ActionButton } from "@/components/ui/actions/ActionButton";

interface SideNavProps {
  collapsed?: boolean;
  className?: string;
}

export function SideNav({ collapsed = false, className }: SideNavProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex h-full flex-col transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Freight</span>
          </Link>
        )}
        <ActionButton
          variant="ghost"
          size="sm"
          className="ml-auto"
          onClick={() => {
            // This will be handled by the parent component
            // The actual toggle is in DashboardLayout
          }}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
          <span className="sr-only">
            {collapsed ? "Expand sidebar" : "Collapse sidebar"}
          </span>
        </ActionButton>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md px-3 py-3 text-sm font-medium transition-colors",
                    "min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    collapsed && "justify-center"
                  )}
                >
                  {item.icon && (
                    <item.icon
                      className={cn(
                        "h-5 w-5",
                        collapsed ? "mr-0" : "mr-3"
                      )}
                    />
                  )}
                  {!collapsed && <span>{item.label}</span>}
                  {collapsed && (
                    <span className="sr-only">{item.label}</span>
                  )}
                  {item.badge && !collapsed && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                      {item.badge}
                    </span>
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
    </aside>
  );
} 