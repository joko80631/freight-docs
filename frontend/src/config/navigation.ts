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
import { routes } from './routes';

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
    href: routes.dashboard,
    icon: LayoutDashboard,
    featureFlag: true,
  },
  {
    label: "Loads",
    href: routes.loads.index,
    icon: Truck,
    featureFlag: true,
  },
  {
    label: "Documents",
    href: routes.documents.index,
    icon: FileText,
    featureFlag: true,
  },
  {
    label: "Teams",
    href: routes.teams.index,
    icon: Building2,
    featureFlag: true,
  },
  {
    label: "Customers",
    href: routes.comingSoon('customers'),
    icon: Users,
    featureFlag: false,
    comingSoon: true,
  },
  {
    label: "Analytics",
    href: routes.comingSoon('analytics'),
    icon: BarChart3,
    featureFlag: false,
    comingSoon: true,
  },
  {
    label: "Fleet",
    href: routes.comingSoon('fleet'),
    icon: Truck,
    featureFlag: false,
    comingSoon: true,
  },
  {
    label: "Settings",
    href: routes.settings.index,
    icon: Settings,
    featureFlag: true,
  },
  {
    label: "Help",
    href: routes.support,
    icon: HelpCircle,
    featureFlag: true,
  },
]; 