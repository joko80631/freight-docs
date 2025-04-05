'use client';

import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, XCircle, Info } from 'lucide-react';

export interface TimelineItemProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  metadata?: {
    time?: string;
    user?: string;
  };
  variant?: 'success' | 'warning' | 'error' | 'info';
}

export interface TimelineProps {
  items: TimelineItemProps[];
  className?: string;
}

const defaultIcons = {
  success: <CheckCircle2 className="h-5 w-5 text-green-600" />,
  warning: <AlertCircle className="h-5 w-5 text-amber-600" />,
  error: <XCircle className="h-5 w-5 text-red-600" />,
  info: <Info className="h-5 w-5 text-gray-600" />,
};

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {items.map((item, index) => (
        <div key={index} className="relative pl-6">
          {/* Connector line */}
          {index !== items.length - 1 && (
            <div className="absolute left-[0.5625rem] top-5 h-full w-px bg-gray-200" />
          )}
          
          {/* Icon circle */}
          <div className="absolute left-0 top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full border border-gray-200 bg-white">
            {item.icon || defaultIcons[item.variant || 'info']}
          </div>

          {/* Content */}
          <div className="space-y-1 pt-0.5">
            <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
            {item.description && (
              <p className="text-sm text-gray-600">{item.description}</p>
            )}
            {item.metadata && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {item.metadata.time && <span>{item.metadata.time}</span>}
                {item.metadata.user && (
                  <>
                    <span>•</span>
                    <span>{item.metadata.user}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
} 