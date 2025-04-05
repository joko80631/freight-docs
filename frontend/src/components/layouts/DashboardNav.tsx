"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Truck,
  Users,
  Settings,
  BarChart,
} from "lucide-react";

interface DashboardNavProps {
  isCollapsed: boolean;
}

export function DashboardNav({ isCollapsed }: DashboardNavProps) {
  const pathname = usePathname();

  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/documents",
      label: "Documents",
      icon: FileText,
    },
    {
      href: "/loads",
      label: "Loads",
      icon: Truck,
    },
    {
      href: "/teams",
      label: "Teams",
      icon: Users,
    },
    {
      href: "/reports",
      label: "Reports",
      icon: BarChart,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  return (
    <nav className="grid gap-1 p-2">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
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
  );
} 