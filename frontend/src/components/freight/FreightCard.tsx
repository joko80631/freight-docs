'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface FreightCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'bordered';
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

export function FreightCard({
  children,
  variant = 'default',
  hover = false,
  className,
  onClick,
}: FreightCardProps) {
  const Component = motion.div;

  return (
    <Component
      className={cn(
        'rounded-lg p-4',
        variant === 'bordered' && 'border border-border',
        hover && 'transition-colors hover:bg-muted/50',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      whileHover={hover ? { scale: 1.01 } : undefined}
      whileTap={hover ? { scale: 0.99 } : undefined}
    >
      {children}
    </Component>
  );
} 