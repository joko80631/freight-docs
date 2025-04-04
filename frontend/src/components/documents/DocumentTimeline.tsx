'use client';

import React from 'react';
import { Document } from '@/types/document';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { getConfidenceVariant, getConfidenceLabel } from '@/lib/classification';
import { FreightBadge } from '@/components/freight/FreightBadge';
import ReactMarkdown from 'react-markdown';

interface DocumentTimelineProps {
  document: Document;
}

export function DocumentTimeline({ document }: DocumentTimelineProps) {
  if (!document.classification_history || document.classification_history.length === 0) {
    return (
      <Card className="bg-muted/50 p-4 text-center text-muted-foreground">
        <CardContent>
          No classification history
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="p-4">
      <CardContent>
        <h3 className="font-medium mb-4">Classification Timeline</h3>
        <div className="space-y-4">
          {document.classification_history.map((entry) => (
            <div key={entry.id} className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{entry.new_type}</span>
                  <FreightBadge variant={getConfidenceVariant(entry.confidence_score || 0)}>
                    {getConfidenceLabel(entry.confidence_score || 0)}
                  </FreightBadge>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(entry.classified_at), { addSuffix: true })}
                  </span>
                </div>
                {entry.reason && (
                  <div className="mt-2 text-sm prose prose-sm max-w-none">
                    <ReactMarkdown>{entry.reason}</ReactMarkdown>
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