import * as React from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Card } from "@/components/ui/containers/Card";

const metricCardVariants = cva("", {
  variants: {
    variant: {
      default: "bg-card",
      elevated: "bg-card shadow-md",
    },
    size: {
      default: "p-6",
      compact: "p-4",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface MetricCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof metricCardVariants> {
  title: string;
  value: string;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
}

export function MetricCard({
  title,
  value,
  description,
  trend,
  icon,
  variant,
  size,
  className,
  ...props
}: MetricCardProps) {
  return (
    <Card
      variant={variant}
      className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out hover:shadow-md",
        metricCardVariants({ variant, size, className })
      )}
      {...props}
    >
      <div className="flex items-center justify-between p-6">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
            {trend && (
              <div
                className={cn(
                  "flex items-center text-xs font-medium",
                  trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                )}
              >
                {trend.isPositive ? (
                  <ArrowUp className="h-3 w-3 mr-0.5" />
                ) : (
                  <ArrowDown className="h-3 w-3 mr-0.5" />
                )}
                <span>{trend.value}%</span>
              </div>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {icon && (
          <div className="rounded-full bg-secondary p-2 text-secondary-foreground">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
} 