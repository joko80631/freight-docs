import {
  LayoutDashboard,
  Package,
  Truck,
  Users,
  Settings,
  BarChart3,
  FileText,
  Bell,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface NavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
}

export const navigation: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Loads",
    href: "/loads",
    icon: Package,
  },
  {
    label: "Fleet",
    href: "/fleet",
    icon: Truck,
  },
  {
    label: "Customers",
    href: "/customers",
    icon: Users,
  },
  {
    label: "Documents",
    href: "/documents",
    icon: FileText,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
    badge: "3",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
]; 