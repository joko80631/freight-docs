'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface FreightCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'subtle' | 'filter';
  className?: string;
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
  onClick,
  header,
  footer,
}: FreightCardProps) {
  const Component = motion.div;

  return (
    <Component
      className={cn(
        'rounded-md border border-gray-200 bg-white',
        variant === 'subtle' && 'bg-gray-50',
        variant === 'filter' && 'border-gray-200',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.01 } : undefined}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      data-testid="freight-card"
    >
      {header && (
        <div className="border-b border-gray-200 p-4" data-testid="freight-card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">{header.title}</h3>
            {header.actions && <div className="flex items-center gap-2">{header.actions}</div>}
          </div>
        </div>
      )}
      <div className="p-4" data-testid="freight-card-content">{children}</div>
      {footer && (
        <div className="border-t border-gray-200 p-4" data-testid="freight-card-footer">
          {footer}
        </div>
      )}
    </Component>
  );
} 