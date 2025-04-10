import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { getConfidenceVariant, getConfidenceLabel } from '@/lib/classification';
import { Document, ClassificationHistory } from '@/types/document';

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  'POD': 'Proof of Delivery',
  'BOL': 'Bill of Lading',
  'INVOICE': 'Invoice'
};

interface ClassificationHistoryPanelProps {
  document: Document & { classification_history?: ClassificationHistory[] };
  className?: string;
}

export function ClassificationHistoryPanel({ document, className }: ClassificationHistoryPanelProps) {
  const history = document.classification_history || [];
  
  if (!history.length) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Classification History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((entry, index) => (
            <div key={entry.id} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={getConfidenceVariant(entry.confidence_score || 0) === 'error' ? 'destructive' : 'secondary'}>
                    {DOCUMENT_TYPE_LABELS[entry.new_type] || entry.new_type}
                  </Badge>
                  {entry.confidence_score != null ? (
                    <span className="text-sm text-muted-foreground">
                      {getConfidenceLabel(entry.confidence_score)} confidence
                    </span>
                  ) : (
                    <span className="text-xs italic text-muted-foreground">No confidence score</span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(entry.classified_at), { addSuffix: true })}
                </span>
              </div>
              {entry.reason && (
                <p className="text-sm text-muted-foreground italic">
                  {entry.reason}
                </p>
              )}
              {index < history.length - 1 && (
                <div className="h-px bg-border my-2" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 