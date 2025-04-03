'use client';

import { cn } from "@/lib/utils";

export function LoadingSkeleton({
  variant = "default",
  className = "",
  count = 1,
  ...props
}) {
  const variants = {
    default: "h-4 w-full",
    card: "h-32 w-full rounded-lg",
    avatar: "h-10 w-10 rounded-full",
    text: "h-4 w-3/4",
    button: "h-10 w-24",
    table: "h-12 w-full",
  };

  return (
    <div className={cn("animate-pulse rounded-md bg-muted", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={variants[variant]}
          {...props}
        />
      ))}
    </div>
  );
}

// Pre-built loading states for common components
export function CardSkeleton({ className = "", ...props }) {
  return (
    <div className={`space-y-4 p-4 ${className}`}>
      <LoadingSkeleton variant="card" {...props} />
      <div className="space-y-2">
        <LoadingSkeleton variant="text" />
        <LoadingSkeleton variant="text" className="w-1/2" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, className = "", ...props }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <LoadingSkeleton key={i} variant="table" {...props} />
      ))}
    </div>
  );
}

export function ListSkeleton({ items = 3, className = "", ...props }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <LoadingSkeleton variant="avatar" />
          <div className="space-y-2">
            <LoadingSkeleton variant="text" />
            <LoadingSkeleton variant="text" className="w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default LoadingSkeleton; 