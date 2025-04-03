'use client';

import { cn } from '@/lib/utils';

export interface FreightBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

export function FreightBadge({
  children,
  variant = 'default',
  className,
}: FreightBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        {
          'bg-primary/10 text-primary': variant === 'default',
          'bg-success/10 text-success': variant === 'success',
          'bg-warning/10 text-warning': variant === 'warning',
          'bg-error/10 text-error': variant === 'error',
          'bg-info/10 text-info': variant === 'info',
        },
        className
      )}
    >
      {children}
    </span>
  );
} 