'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Upload,
  Download,
  FileText,
  RefreshCw,
  Link,
  Unlink,
  Trash2,
  User,
  Loader2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const EVENT_TYPES = {
  UPLOAD: {
    label: 'Uploaded',
    color: 'bg-blue-100 text-blue-800',
  },
  CLASSIFY: {
    label: 'Classified',
    color: 'bg-purple-100 text-purple-800',
  },
  RECLASSIFY: {
    label: 'Reclassified',
    color: 'bg-yellow-100 text-yellow-800',
  },
  LINK: {
    label: 'Linked to Load',
    color: 'bg-green-100 text-green-800',
  },
  UNLINK: {
    label: 'Unlinked from Load',
    color: 'bg-red-100 text-red-800',
  },
  DELETE: {
    label: 'Deleted',
    color: 'bg-red-100 text-red-800',
  },
};

const getEventIcon = (type) => {
  switch (type) {
    case 'upload':
      return <Upload className="h-4 w-4" />;
    case 'download':
      return <Download className="h-4 w-4" />;
    case 'classify':
      return <FileText className="h-4 w-4" />;
    case 'reclassify':
      return <RefreshCw className="h-4 w-4" />;
    case 'link':
      return <Link className="h-4 w-4" />;
    case 'unlink':
      return <Unlink className="h-4 w-4" />;
    case 'delete':
      return <Trash2 className="h-4 w-4" />;
    default:
      return <User className="h-4 w-4" />;
  }
};

const getEventColor = (type) => {
  switch (type) {
    case 'upload':
      return 'bg-blue-100 text-blue-800';
    case 'download':
      return 'bg-green-100 text-green-800';
    case 'classify':
    case 'reclassify':
      return 'bg-purple-100 text-purple-800';
    case 'link':
      return 'bg-yellow-100 text-yellow-800';
    case 'unlink':
      return 'bg-orange-100 text-orange-800';
    case 'delete':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function DocumentTimeline({ document }) {
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTimelineEvents();
  }, [document.id]);

  const fetchTimelineEvents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/documents/${document.id}/events`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch timeline events');
      }
      
      const data = await response.json();
      setTimelineEvents(data);
    } catch (error) {
      setError(error.message);
      toast({
        title: 'Error',
        description: 'Failed to load document timeline',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Group events by date
  const groupedEvents = timelineEvents.reduce((groups, event) => {
    const date = new Date(event.timestamp).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>Failed to load timeline: {error}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={fetchTimelineEvents}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!timelineEvents.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No activity recorded
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedEvents).map(([date, events]) => (
        <div key={date} className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            {new Date(date).toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h3>
          <div className="space-y-4">
            {events.map((event, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${getEventColor(event.type)}`}>
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{event.type.charAt(0).toUpperCase() + event.type.slice(1)}</p>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      {event.type === 'UPLOAD' && (
                        <>
                          Uploaded by {event.details.user} • {event.details.file_size}
                        </>
                      )}
                      {event.type === 'CLASSIFY' && (
                        <>
                          Classified as {event.details.document_type} with{' '}
                          {Math.round(event.details.confidence * 100)}% confidence
                        </>
                      )}
                      {event.type === 'RECLASSIFY' && (
                        <>
                          Changed to {event.details.document_type} with{' '}
                          {Math.round(event.details.confidence * 100)}% confidence
                          {event.details.reason && (
                            <> • Reason: {event.details.reason}</>
                          )}
                        </>
                      )}
                      {event.type === 'LINK' && (
                        <>
                          Linked to Load #{event.details.load_id} by {event.details.user}
                        </>
                      )}
                      {event.type === 'UNLINK' && (
                        <>
                          Unlinked from Load #{event.details.load_id} by {event.details.user}
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 