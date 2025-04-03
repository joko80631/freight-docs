'use client';

import React from 'react';
import { Document } from '@/types/document';
import { FreightCard } from '@/components/freight/FreightCard';
import { formatDistanceToNow } from 'date-fns';
import { getConfidenceVariant, getConfidenceLabel } from '@/lib/documents';
import { FreightBadge } from '@/components/freight/FreightBadge';
import ReactMarkdown from 'react-markdown';

interface DocumentTimelineProps {
  document: Document;
}

export function DocumentTimeline({ document }: DocumentTimelineProps) {
  if (!document.classification_history || document.classification_history.length === 0) {
    return (
      <FreightCard variant="bordered" className="p-4 text-center text-muted-foreground">
        No classification history
      </FreightCard>
    );
  }
  
  return (
    <FreightCard variant="bordered" className="p-4">
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
    </FreightCard>
  );
} 