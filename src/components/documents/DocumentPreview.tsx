import { FileText, MoreVertical, Download, RefreshCw, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Document, DocumentStatus } from '@/types/document';
import { refreshDocumentUrl } from '@/lib/api/documents';
import { useToast } from '@/components/ui/use-toast';
import { FreightBadge } from '@/components/ui/freight-badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getConfidenceVariant } from '@/lib/utils/classification';

interface DocumentPreviewProps {
  document: Document;
  onRefresh?: () => void;
  onDelete?: () => void;
  canReclassify?: boolean;
  canDelete?: boolean;
}

export function DocumentPreview({ document, onRefresh, onDelete, canReclassify = false, canDelete = false }: DocumentPreviewProps) {
  const { toast } = useToast();

  const handleRefresh = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!onRefresh) return;

    try {
      await refreshDocumentUrl(document.id);
      onRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh document URL',
        variant: 'destructive',
      });
    }
  };

  const getStatusVariant = (status: DocumentStatus): 'success' | 'warning' | 'error' | 'info' => {
    switch (status) {
      case 'CLASSIFIED':
        return 'success';
      case 'PENDING':
        return 'info';
      case 'REJECTED':
        return 'error';
      case 'INVALID':
        return 'error';
      case 'MISSING':
        return 'warning';
      case 'RECEIVED':
        return 'info';
      default:
        return 'info';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-4">
        <FileText className="w-8 h-8 text-gray-400" />
        <div>
          <h3 className="font-medium">{document.name}</h3>
          <p className="text-sm text-gray-500">
            Uploaded {formatDistanceToNow(new Date(document.uploaded_at), { addSuffix: true })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <FreightBadge variant={getStatusVariant(document.status)}>
          {document.status}
        </FreightBadge>

        {document.confidence_score !== undefined && document.confidence_score !== null && (
          <FreightBadge variant={getConfidenceVariant(document.confidence_score)}>
            {Math.round(document.confidence_score * 100)}% Confidence
          </FreightBadge>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger>
            <MoreVertical className="w-5 h-5 text-gray-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {document.url && (
              <DropdownMenuItem asChild>
                <a href={document.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </DropdownMenuItem>
            )}
            {onRefresh && (
              <DropdownMenuItem onClick={handleRefresh} className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh URL
              </DropdownMenuItem>
            )}
            {canDelete && onDelete && (
              <DropdownMenuItem onClick={onDelete} className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-4 h-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
} 