'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Document } from '@/types/document';
import { formatDistanceToNow } from 'date-fns';
import { getErrorMessage } from '@/lib/errors';
import { safeArray } from '@/lib/array-utils';
import ReactMarkdown from 'react-markdown';

interface ClassificationDetailsProps {
  document: Document;
  onReclassify: () => void;
}

export function ClassificationDetails({ document, onReclassify }: ClassificationDetailsProps) {
  const { toast } = useToast();
  
  const getConfidencePercent = (score: number) => {
    return Math.round(score * 100);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Classification Details</h3>
          <div className="mt-1 flex items-center gap-2">
            <div className="rounded-md bg-primary/10 px-3 py-1 text-sm">
              {document.type?.toUpperCase() || 'UNCLASSIFIED'}
            </div>
            <div className="rounded-md bg-primary/10 px-3 py-1 text-sm">
              {getConfidencePercent(document.confidence_score || 0)}% confidence
            </div>
          </div>
        </div>
        <Button onClick={onReclassify}>Reclassify</Button>
      </div>
      
      {document.classification_reason && (
        <div className="rounded-lg border p-4">
          <h4 className="font-medium mb-2">Classification Reason</h4>
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{document.classification_reason}</ReactMarkdown>
          </div>
        </div>
      )}
      
      {document.classification_history && document.classification_history.length > 0 && (
        <div className="rounded-lg border p-4">
          <h4 className="font-medium mb-4">Classification History</h4>
          <div className="space-y-4">
            {safeArray(document.classification_history).map((entry) => (
              <div key={entry.id} className="flex items-start gap-4 py-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{entry.new_type}</span>
                    <span className="text-muted-foreground">
                      {formatDistanceToNow(new Date(entry.classified_at), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Confidence: {getConfidencePercent(entry.confidence_score || 0)}%
                  </div>
                  {entry.reason && (
                    <div className="mt-2 text-sm">
                      <ReactMarkdown>{entry.reason}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 