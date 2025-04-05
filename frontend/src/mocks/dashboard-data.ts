import { 
  BarChart, 
  Truck, 
  FileText, 
  DollarSign,
  Users,
  Plus
} from "lucide-react";
import { ReactNode } from "react";

export interface Metric {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: ReactNode;
}

export interface Activity {
  id: string;
  title: string;
  description?: string;
  timestamp: Date;
  type?: "success" | "warning" | "error" | "default";
  icon?: ReactNode;
}

export interface QuickAction {
  label: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
}

export const mockMetrics: Metric[] = [
  {
    title: "Total Loads",
    value: "245",
    description: "Active freight loads",
    trend: { value: 12, isPositive: true },
    icon: <Truck className="h-4 w-4" />,
  },
  {
    title: "Documents",
    value: "1,234",
    description: "Processed this month",
    trend: { value: 8, isPositive: true },
    icon: <FileText className="h-4 w-4" />,
  },
  {
    title: "Revenue",
    value: "$45,231",
    description: "This month",
    trend: { value: 15, isPositive: true },
    icon: <DollarSign className="h-4 w-4" />,
  },
  {
    title: "Team Members",
    value: "12",
    description: "Active users",
    trend: { value: 2, isPositive: true },
    icon: <Users className="h-4 w-4" />,
  },
];

export const mockActivities: Activity[] = [
  {
    id: "1",
    title: "New load created",
    description: "Load #1234 from LA to NYC",
    timestamp: new Date(),
    type: "success",
    icon: <Truck className="h-4 w-4" />,
  },
  {
    id: "2",
    title: "Document processed",
    description: "BOL for Load #1234",
    timestamp: new Date(Date.now() - 3600000),
    type: "default",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: "3",
    title: "Payment received",
    description: "$1,234 for Load #1234",
    timestamp: new Date(Date.now() - 7200000),
    type: "success",
    icon: <DollarSign className="h-4 w-4" />,
  },
];

export const mockQuickActions: QuickAction[] = [
  {
    label: "Create Load",
    icon: <Plus className="h-4 w-4" />,
    href: "/loads/new",
  },
  {
    label: "Upload Document",
    icon: <FileText className="h-4 w-4" />,
    href: "/documents/upload",
  },
  {
    label: "View Reports",
    icon: <BarChart className="h-4 w-4" />,
    href: "/reports",
  },
]; 