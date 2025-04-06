import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function LoadingSkeleton({ className, ...props }: LoadingSkeletonProps) {
  return (
    <Skeleton
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
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