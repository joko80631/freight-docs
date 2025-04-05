import * as React from "react";
import { format } from "date-fns";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/containers/Card";

const activityTimelineVariants = cva("", {
  variants: {
    variant: {
      default: "",
      compact: "space-y-2",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const activityItemVariants = cva(
  "flex items-start gap-4 rounded-lg p-4 transition-colors",
  {
    variants: {
      type: {
        default: "bg-muted/50",
        success: "bg-green-50 dark:bg-green-950/20",
        warning: "bg-yellow-50 dark:bg-yellow-950/20",
        error: "bg-red-50 dark:bg-red-950/20",
      },
    },
    defaultVariants: {
      type: "default",
    },
  }
);

export interface Activity {
  id: string;
  title: string;
  description?: string;
  timestamp: Date;
  type?: "success" | "warning" | "error" | "default";
  icon?: React.ReactNode;
}

export interface ActivityTimelineProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof activityTimelineVariants> {
  activities: Activity[];
}

export function ActivityTimeline({
  activities,
  variant,
  className,
  ...props
}: ActivityTimelineProps) {
  return (
    <Card title="Recent Activity" className={cn(activityTimelineVariants({ variant, className }))} {...props}>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className={cn(activityItemVariants({ type: activity.type }))}
          >
            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background">
              {activity.icon}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-xs text-muted-foreground">
                  {format(activity.timestamp, "MMM d, h:mm a")}
                </p>
              </div>
              {activity.description && (
                <p className="text-sm text-muted-foreground">
                  {activity.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
} 