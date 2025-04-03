'use client';

import { FreightCard } from '@/components/freight/FreightCard';
import { FreightBadge } from '@/components/freight/FreightBadge';
import { Button } from '@/components/ui/button';
import { DownloadIcon, TrashIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Document } from '@/types/document';
import { 
  getConfidenceVariant, 
  getConfidenceLabel, 
  getStatusVariant 
} from '@/lib/documents';

interface DocumentDetailsProps {
  document: Document;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
  onViewLoad?: (loadId: string) => void;
}

export function DocumentDetails({ document, onDelete, onDownload, onViewLoad }: DocumentDetailsProps) {
  return (
    <FreightCard className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">{document.name}</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Uploaded {formatDistanceToNow(new Date(document.uploaded_at))} ago
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownload(document.id)}
          >
            <DownloadIcon className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-error-600 hover:text-error-700"
            onClick={() => onDelete(document.id)}
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Delete
          </Button>
          {document.load_id && onViewLoad && (
            <Button variant="outline" onClick={() => onViewLoad(document.load_id as string)}>
              View Load
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-neutral-500">Document Type</h3>
          <p className="mt-1">{document.type}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-neutral-500">Confidence</h3>
          <div className="mt-1">
            <FreightBadge variant={getConfidenceVariant(document.confidence)}>
              {getConfidenceLabel(document.confidence)}
            </FreightBadge>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-neutral-500">Load ID</h3>
          <p className="mt-1">{document.load_id || 'Not linked'}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-neutral-500">Status</h3>
          <div className="mt-1">
            <FreightBadge variant={getStatusVariant(document.status)}>
              {document.status}
            </FreightBadge>
          </div>
        </div>
      </div>
    </FreightCard>
  );
} 