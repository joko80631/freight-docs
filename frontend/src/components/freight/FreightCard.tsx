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
        'rounded-lg border border-gray-200 bg-white w-full transition-all duration-200',
        // Variant styles
        variant === 'subtle' && 'bg-gray-50 border-gray-100',
        variant === 'filter' && 'border-gray-200 bg-white',
        variant === 'elevated' && 'bg-white shadow-lg hover:shadow-xl border-gray-100',
        variant === 'default' && 'shadow-sm hover:shadow-md',
        // Interactive styles
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
            <h3 className="text-lg font-medium text-gray-900 tracking-tight">{header.title}</h3>
            {header.actions && <div className="flex items-center gap-2">{header.actions}</div>}
          </div>
        </div>
      )}
      <div className={cn(
        "px-6 py-5",
        !header && !footer && "rounded-lg",
        contentClassName
      )}>
        {children}
      </div>
      {footer && (
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50/50">
          {footer}
        </div>
      )}
    </Component>
  );
} 