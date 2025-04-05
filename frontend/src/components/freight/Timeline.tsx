import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface TimelineItemProps {
  title: string;
  description?: string;
  metadata?: Record<string, string>;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  icon?: React.ReactNode;
}

interface TimelineProps {
  items: TimelineItemProps[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <Card className={cn('border-2', className)}>
      <CardContent className="p-6">
        <div className="space-y-6">
          {items.map((item, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full',
                item.variant === 'success' && 'bg-green-100 text-green-600',
                item.variant === 'warning' && 'bg-yellow-100 text-yellow-600',
                item.variant === 'error' && 'bg-red-100 text-red-600',
                item.variant === 'info' && 'bg-blue-100 text-blue-600',
                !item.variant && 'bg-gray-100 text-gray-600'
              )}>
                {item.icon || (
                  <div className="h-2 w-2 rounded-full bg-current" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-medium">{item.title}</p>
                {item.description && (
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                )}
                {item.metadata && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(item.metadata).map(([key, value]) => (
                      <div key={key} className="text-xs text-muted-foreground">
                        <span className="font-medium">{key}:</span> {value}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 