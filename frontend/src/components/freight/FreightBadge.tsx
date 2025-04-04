'use client';

import { cn } from '@/lib/utils';
import { getConfidenceVariant } from '@/lib/classification';

export interface FreightBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'neutral' | 'confidence';
  confidence?: number;
  className?: string;
}

export function FreightBadge({
  children,
  variant = 'default',
  confidence,
  className,
}: FreightBadgeProps) {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-600',
    success: 'bg-green-200 text-green-600',
    warning: 'bg-amber-200 text-amber-600',
    error: 'bg-red-200 text-red-600',
    neutral: 'bg-gray-100 text-gray-600',
    confidence: confidence ? {
      success: 'bg-green-200 text-green-600',
      warning: 'bg-amber-200 text-amber-600',
      error: 'bg-red-200 text-red-600',
    }[getConfidenceVariant(confidence)] : 'bg-gray-100 text-gray-600',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        variant === 'confidence' ? variantStyles.confidence : variantStyles[variant],
        className
      )}
      data-testid={`freight-badge-${variant}${confidence ? `-${confidence}` : ''}`}
    >
      {children}
      {variant === 'confidence' && confidence !== undefined && (
        <span className="ml-1" data-testid="freight-badge-confidence-value">({confidence}%)</span>
      )}
    </span>
  );
}

FreightBadge.displayName = 'FreightBadge'; 