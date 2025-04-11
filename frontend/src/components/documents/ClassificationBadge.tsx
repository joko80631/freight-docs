'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw } from 'lucide-react';
import { getConfidenceVariant, getConfidenceLabel } from '@/lib/classification';
import { useDocumentStore } from '@/store/documentStore';
import { toast } from 'sonner';

interface ClassificationBadgeProps {
  documentId: string;
  type: string | null;
  confidence: number | null;
  reason: string | null;
  status: 'pending' | 'classified' | 'error';
  onRetry?: () => void;
}

export function ClassificationBadge({
  documentId,
  type,
  confidence,
  reason,
  status,
  onRetry
}: ClassificationBadgeProps) {
  const { classifyDocument, isLoading } = useDocumentStore();

  const handleRetry = async () => {
    try {
      await classifyDocument(documentId);
      onRetry?.();
      toast.success('Classification retried successfully');
    } catch (error) {
      toast.error('Failed to retry classification');
    }
  };

  if (status === 'pending') {
    return (
      <Badge variant="outline" className="gap-2">
        <Loader2 className="h-3 w-3 animate-spin" />
        Classifying...
      </Badge>
    );
  }

  if (status === 'error' || !type || !confidence) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="destructive">Classification Failed</Badge>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2"
          onClick={handleRetry}
          disabled={isLoading}
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  const confidenceVariant = getConfidenceVariant(confidence * 100);
  const confidenceLabel = getConfidenceLabel(confidence * 100);

  return (
    <div className="flex items-center gap-2">
      <Badge variant={confidenceVariant}>
        {type} ({confidenceLabel})
      </Badge>
      {confidence < 0.6 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2"
          onClick={handleRetry}
          disabled={isLoading}
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
} 