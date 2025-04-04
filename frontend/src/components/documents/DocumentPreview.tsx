'use client';

import React, { useState } from 'react';
import { Document } from '@/types/document';
import { Button } from '@/components/ui/button';
import { FreightBadge } from '@/components/freight/FreightBadge';
import { getConfidenceVariant, getConfidenceLabel } from '@/lib/classification';
import { formatDistanceToNow } from 'date-fns';
import { DownloadIcon, TrashIcon } from 'lucide-react';

interface DocumentPreviewProps {
  document: Document;
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
  onViewLoad?: (loadId: string) => void;
}

export function DocumentPreview({ document, onDelete, onDownload, onViewLoad }: DocumentPreviewProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(document.id);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium">{document.name}</h3>
          <p className="text-sm text-neutral-500">
            Uploaded {formatDistanceToNow(new Date(document.uploaded_at))} ago
          </p>
        </div>
        <div className="flex gap-2">
          {onDownload && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload(document.id)}
            >
              <DownloadIcon className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              className="text-error-600 hover:text-error-700"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          )}
          {document.load_id && onViewLoad && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewLoad(document.load_id as string)}
            >
              View Load
            </Button>
          )}
        </div>
      </div>
      
      <div className="mt-4 flex gap-4">
        <div>
          <span className="text-sm font-medium text-neutral-500">Type:</span>
          <span className="ml-2">{document.type || 'Unclassified'}</span>
        </div>
        <div>
          <span className="text-sm font-medium text-neutral-500">Confidence:</span>
          <span className="ml-2">
            <FreightBadge variant={getConfidenceVariant(document.confidence_score || 0)}>
              {getConfidenceLabel(document.confidence_score || 0)}
            </FreightBadge>
          </span>
        </div>
        {document.load_id && (
          <div>
            <span className="text-sm font-medium text-neutral-500">Load:</span>
            <span className="ml-2">{document.load_id}</span>
          </div>
        )}
      </div>
    </div>
  );
} 