'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface FreightCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'subtle' | 'filter' | 'elevated';
  className?: string;
  contentClassName?: string;
  onClick?: () => void;
  header?: {
    title: string;
    actions?: React.ReactNode;
  };
  footer?: React.ReactNode;
}

export function FreightCard({
  children,
  variant = 'default',
  className,
  contentClassName,
  onClick,
  header,
  footer,
}: FreightCardProps) {
  const Component = motion.div;

  return (
    <Component
      className={cn(
        'rounded-lg border border-gray-200 bg-white w-full',
        variant === 'subtle' && 'bg-gray-50',
        variant === 'filter' && 'border-gray-200',
        variant === 'elevated' && 'bg-white shadow-md rounded-2xl',
        !variant && 'shadow-sm',
        onClick && 'cursor-pointer hover:shadow-md transition-shadow duration-200',
        className
      )}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.01 } : undefined}
      whileTap={onClick ? { scale: 0.99 } : undefined}
    >
      {header && (
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">{header.title}</h3>
            {header.actions && <div className="flex items-center gap-2">{header.actions}</div>}
          </div>
        </div>
      )}
      <div className={cn("px-6 py-4 space-y-4", contentClassName)}>
        {children}
      </div>
      {footer && (
        <div className="border-t border-gray-200 px-6 py-4">
          {footer}
        </div>
      )}
    </Component>
  );
} 