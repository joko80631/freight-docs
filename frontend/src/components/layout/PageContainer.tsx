import React from 'react';
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface PageContainerProps {
  title: string;
  description?: string;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyState?: React.ReactNode;
  error?: string | null;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export function PageContainer({
  title,
  description,
  isLoading = false,
  isEmpty = false,
  emptyState,
  error,
  children,
  className,
  headerAction
}: PageContainerProps) {
  return (
    <div className={cn("max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6", className)}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {headerAction && (
          <div className="flex-shrink-0">
            {headerAction}
          </div>
        )}
      </div>

      {error ? (
        <Card className="p-6">
          <div className="text-center text-red-600">
            <p className="font-medium">Something went wrong</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </Card>
      ) : isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-[250px]" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : isEmpty && emptyState ? (
        emptyState
      ) : (
        children
      )}
    </div>
  );
} 