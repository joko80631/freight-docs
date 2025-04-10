import { Badge } from '@/components/ui/badge';
import { Document } from '@/types/database';
import { getLoadCompletion } from '@/utils/getLoadCompletion';
import { formatDocumentType } from '@/lib/formatDocumentType';
import { cn } from '@/lib/utils';

interface LoadCompletionBadgeProps {
  documents: Document[];
  className?: string;
}

export function LoadCompletionBadge({ documents, className }: LoadCompletionBadgeProps) {
  const completion = getLoadCompletion(documents);
  
  const variant = completion.isComplete
    ? 'success'
    : completion.count > 0
    ? 'warning'
    : 'destructive';
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Badge variant={variant}>
        {completion.count}/{completion.total} Documents
      </Badge>
      {completion.missingTypes.length > 0 && (
        <span className="text-sm text-muted-foreground">
          Missing: {completion.missingTypes.map(formatDocumentType).join(', ')}
        </span>
      )}
    </div>
  );
} 