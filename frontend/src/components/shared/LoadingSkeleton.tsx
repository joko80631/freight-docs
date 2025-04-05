import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
}

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200 dark:bg-gray-800',
        className
      )}
    />
  );
}

export function CardSkeleton() {
  return <LoadingSkeleton className="h-32 w-full" />;
}

export function ListSkeleton() {
  return <LoadingSkeleton className="h-6 w-full my-2" />;
}

export function TableSkeleton() {
  return <LoadingSkeleton className="h-48 w-full" />;
} 