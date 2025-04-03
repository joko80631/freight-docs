import { useState, useEffect } from 'react';
import { FreightCard } from '@/components/freight/FreightCard';
import { Loader2, FileText, Link, Unlink, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Document } from '@/types/document';
import { fetchDocumentEvents } from '@/lib/api/documents';
import { useToast } from '@/components/ui/use-toast';

interface DocumentTimelineProps {
  document: Document;
}

export function DocumentTimeline({ document }: DocumentTimelineProps) {
  const [events, setEvents] = useState<Document['events']>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true);
        const documentEvents = await fetchDocumentEvents(document.id);
        setEvents(documentEvents || []);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load document timeline',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [document.id, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!events.length) {
    return (
      <FreightCard variant="bordered">
        <div className="flex items-center justify-center h-[200px] text-muted-foreground">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>No timeline events yet</p>
            <p className="text-sm">This document has not been modified since upload</p>
          </div>
        </div>
      </FreightCard>
    );
  }

  // Group events by date
  const groupedEvents = events.reduce((groups, event) => {
    const date = new Date(event.timestamp).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {} as Record<string, Document['events']>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedEvents).map(([date, dateEvents]) => (
        <FreightCard key={date} variant="bordered">
          <h3 className="mb-4 font-medium">{date}</h3>
          <div className="space-y-4">
            {dateEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-primary/10">
                  {event.type === 'upload' && <FileText className="h-4 w-4" />}
                  {event.type === 'link' && <Link className="h-4 w-4" />}
                  {event.type === 'unlink' && <Unlink className="h-4 w-4" />}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </p>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {event.details || 'No additional details'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </FreightCard>
      ))}
    </div>
  );
} 