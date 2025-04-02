import { Package, FileText, DollarSign, Clock } from "lucide-react";

export interface DashboardMetric {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: typeof Package | typeof FileText | typeof DollarSign | typeof Clock;
  description: string;
}

export const defaultMetrics: DashboardMetric[] = [
  {
    title: "Active Loads",
    value: "12",
    change: "+2",
    trend: "up",
    icon: Package,
    description: "Currently active shipments",
  },
  {
    title: "Pending Documents",
    value: "8",
    change: "-3",
    trend: "down",
    icon: FileText,
    description: "Documents awaiting upload",
  },
  {
    title: "Revenue",
    value: "$24,500",
    change: "+12%",
    trend: "up",
    icon: DollarSign,
    description: "This month's revenue",
  },
  {
    title: "Average Transit Time",
    value: "3.2 days",
    change: "-0.5",
    trend: "up",
    icon: Clock,
    description: "Average delivery time",
  },
]; 