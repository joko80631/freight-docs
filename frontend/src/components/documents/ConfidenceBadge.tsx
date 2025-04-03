import React from 'react';
import { cn } from '@/lib/utils';

interface ConfidenceBadgeProps {
  confidence: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ConfidenceBadge({
  confidence,
  showLabel = true,
  size = 'md',
  className
}: ConfidenceBadgeProps) {
  const confidencePercent = Math.round((confidence || 0) * 100);
  
  let colors = '';
  let label = '';
  
  if (confidencePercent >= 85) {
    colors = 'bg-green-100 text-green-800 border-green-200';
    label = 'High';
  } else if (confidencePercent >= 60) {
    colors = 'bg-yellow-100 text-yellow-800 border-yellow-200';
    label = 'Medium';
  } else {
    colors = 'bg-red-100 text-red-800 border-red-200';
    label = 'Low';
  }
  
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-2.5 py-1.5'
  };
  
  return (
    <span 
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        colors,
        sizeClasses[size],
        className
      )}
    >
      {showLabel ? (
        <>
          <span>{label}</span>
          <span className="mx-1">•</span>
        </>
      ) : null}
      <span>{confidencePercent}%</span>
    </span>
  );
} 