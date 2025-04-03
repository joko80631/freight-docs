'use client';

import { useState, useEffect } from 'react';
import { FreightCard } from '@/components/freight/FreightCard';
import { Loader2, FileText, Link, Unlink, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Document } from '@/types/document';
import { safeArray } from '@/lib/array-utils';

interface DocumentTimelineProps {
  document: Document;
}

export function DocumentTimeline({ document }: DocumentTimelineProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'upload':
        return <FileText className="h-4 w-4" />;
      case 'link':
        return <Link className="h-4 w-4" />;
      case 'unlink':
        return <Unlink className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'upload':
        return 'text-primary';
      case 'link':
        return 'text-success';
      case 'unlink':
        return 'text-warning';
      case 'error':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <FreightCard variant="bordered" className="p-4 text-center text-error">
        <AlertCircle className="mx-auto h-8 w-8" />
        <p className="mt-2">{error}</p>
      </FreightCard>
    );
  }

  if (!document.events || document.events.length === 0) {
    return (
      <FreightCard variant="bordered" className="p-4 text-center text-muted-foreground">
        No activity recorded
      </FreightCard>
    );
  }

  // Group events by date
  const groupedEvents = safeArray(document.events).reduce((groups, event) => {
    const date = new Date(event.timestamp).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {} as Record<string, typeof document.events>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedEvents).map(([date, events]) => (
        <div key={date}>
          <h3 className="mb-4 font-medium">{date}</h3>
          <div className="space-y-4">
            {safeArray(events).map((event) => (
              <div key={event.id} className="flex gap-4">
                <div className={`mt-1 ${getEventColor(event.type)}`}>
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium capitalize">{event.type}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">{event.details}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 