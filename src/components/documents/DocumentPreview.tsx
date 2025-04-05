import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FreightBadge } from '@/components/freight/FreightBadge';
import { Button } from '@/components/ui/button';
import { FileText, MoreVertical, Download, RefreshCw, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Document } from '@/types/document';
import { refreshDocumentUrl } from '@/lib/api/documents';
import { useToast } from '@/components/ui/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getConfidenceVariant, getConfidenceLabel } from '@/lib/classification';

interface DocumentPreviewProps {
  document: Document;
  onClick?: () => void;
  onDelete?: () => void;
}

export function DocumentPreview({ document, onClick, onDelete }: DocumentPreviewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const { toast } = useToast();
  const { canDelete } = usePermissions();

  const timeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
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

  const handleRetryPreview = async () => {
    try {
      setIsLoading(true);
      setPreviewError(null);
      const { url } = await refreshDocumentUrl(document.id);
      // Implement preview loading logic here
      toast({
        title: 'Success',
        description: 'Preview refreshed successfully',
      });
    } catch (error) {
      setPreviewError('Failed to load preview');
      toast({
        title: 'Error',
        description: 'Failed to refresh preview',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    // Implement download logic here
    window.open(`/api/documents/${document.id}/download`, '_blank');
  };

  return (
    <Card
      className="border-2 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-6">
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full p-1 hover:bg-muted">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                {canDelete && onDelete && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-wrap gap-2">
            <FreightBadge variant={getConfidenceVariant(document.confidence)}>
              {getConfidencePercent(document.confidence)}% AI Confidence
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

          {previewError && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-destructive">{previewError}</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetryPreview}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retry Preview
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Instead
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 