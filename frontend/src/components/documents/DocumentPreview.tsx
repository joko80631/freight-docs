'use client';

import { FreightCard } from '@/components/freight/FreightCard';
import { FreightBadge } from '@/components/freight/FreightBadge';
import { formatDistanceToNow } from 'date-fns';
import { FileText, MoreVertical } from 'lucide-react';
import { Document } from '@/types/document';

export interface DocumentPreviewProps {
  document: Document;
  onClick: () => void;
}

export function DocumentPreview({ document, onClick }: DocumentPreviewProps) {
  const timeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const getConfidenceVariant = (confidence: number): 'success' | 'warning' | 'error' => {
    if (confidence > 0.8) return 'success';
    if (confidence > 0.6) return 'warning';
    return 'error';
  };

  const getConfidencePercent = (confidence: number) => {
    return Math.round(confidence * 100);
  };

  const getStatusVariant = (status: Document['status']): 'success' | 'warning' | 'error' | 'info' => {
    switch (status) {
      case 'processed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  };

  return (
    <FreightCard
      variant="bordered"
      hover
      onClick={onClick}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium line-clamp-1">{document.name}</h3>
              <p className="text-sm text-muted-foreground">
                Uploaded {timeAgo(document.uploaded_at)}
              </p>
            </div>
          </div>
          <button className="rounded-full p-1 hover:bg-muted">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <FreightBadge variant={getConfidenceVariant(document.confidence)}>
            {getConfidencePercent(document.confidence)}%
          </FreightBadge>
          <FreightBadge variant="info">
            {document.type}
          </FreightBadge>
          <FreightBadge variant={getStatusVariant(document.status)}>
            {document.status}
          </FreightBadge>
          {document.load_id && (
            <FreightBadge variant="success">
              Load #{document.load?.reference_number || document.load_id}
            </FreightBadge>
          )}
        </div>
      </div>
    </FreightCard>
  );
} 