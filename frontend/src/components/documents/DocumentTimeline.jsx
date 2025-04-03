'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

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

export default function DocumentTimeline({ document }) {
  // Combine all events into a single timeline
  const timeline = [
    {
      type: 'UPLOAD',
      timestamp: document.created_at,
      details: {
        user: document.uploaded_by,
        file_name: document.name,
        file_size: document.file_size,
      },
    },
    {
      type: 'CLASSIFY',
      timestamp: document.classified_at,
      details: {
        document_type: document.document_type,
        confidence: document.classification_confidence,
      },
    },
    ...(document.classification_history || []).map((history) => ({
      type: 'RECLASSIFY',
      timestamp: history.timestamp,
      details: {
        document_type: history.document_type,
        confidence: history.confidence,
        reason: history.reason,
      },
    })),
    ...(document.load_history || []).map((history) => ({
      type: history.action === 'link' ? 'LINK' : 'UNLINK',
      timestamp: history.timestamp,
      details: {
        load_id: history.load_id,
        user: history.user,
      },
    })),
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="space-y-4">
      {timeline.map((event, index) => (
        <div
          key={index}
          className="flex gap-4 pb-4 border-b last:border-0 last:pb-0"
        >
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full bg-primary" />
            {index !== timeline.length - 1 && (
              <div className="w-0.5 h-full bg-border" />
            )}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={cn(
                  EVENT_TYPES[event.type].color,
                  "font-medium"
                )}
              >
                {EVENT_TYPES[event.type].label}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
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
        </div>
      ))}
    </div>
  );
} 