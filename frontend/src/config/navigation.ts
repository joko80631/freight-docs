import {
  LayoutDashboard,
  Truck,
  FileText,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
  Building2,
} from "lucide-react";

export interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  featureFlag?: boolean;
  comingSoon?: boolean;
  badge?: string | number;
}

export const navigationConfig: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    featureFlag: true,
  },
  {
    label: "Loads",
    href: "/loads",
    icon: Truck,
    featureFlag: true,
  },
  {
    label: "Documents",
    href: "/documents",
    icon: FileText,
    featureFlag: true,
  },
  {
    label: "Teams",
    href: "/teams",
    icon: Building2,
    featureFlag: true,
  },
  {
    label: "Customers",
    href: "/customers",
    icon: Users,
    featureFlag: false,
    comingSoon: true,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    featureFlag: false,
    comingSoon: true,
  },
  {
    label: "Fleet",
    href: "/fleet",
    icon: Truck,
    featureFlag: false,
    comingSoon: true,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    featureFlag: true,
  },
  {
    label: "Help",
    href: "/help",
    icon: HelpCircle,
    featureFlag: true,
  },
]; 