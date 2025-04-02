'use client';

import { TrendingUp, TrendingDown, Package, FileText, DollarSign, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/shared";

const metrics = [
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

export function MetricsGrid({ isLoading }) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <LoadingSkeleton className="h-4 w-24" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <LoadingSkeleton className="h-8 w-16" />
              </div>
              <p className="text-xs text-muted-foreground">
                <LoadingSkeleton className="h-3 w-32" />
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center text-xs">
                {metric.trend === "up" ? (
                  <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
                )}
                <span
                  className={
                    metric.trend === "up" ? "text-green-500" : "text-red-500"
                  }
                >
                  {metric.change}
                </span>
                <span className="ml-1 text-muted-foreground">
                  {metric.description}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 