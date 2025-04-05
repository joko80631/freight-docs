import * as React from "react";
import { cn } from "@/lib/utils";

interface PageSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rows?: number;
}

export function PageSkeleton({
  className,
  rows = 3,
  ...props
}: PageSkeletonProps) {
  return (
    <div
      className={cn("animate-pulse space-y-6 p-6", className)}
      {...props}
    >
      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border bg-card p-6 shadow-sm"
          >
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="mt-2 h-8 w-32 rounded bg-muted" />
            <div className="mt-2 h-4 w-40 rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="h-6 w-32 rounded bg-muted" />
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex h-24 items-center justify-center rounded-lg border bg-muted"
              />
            ))}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="h-6 w-32 rounded bg-muted" />
          <div className="mt-4 space-y-4">
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-4 w-1/2 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 