import { Card, CardContent } from '@/components/ui/card';
import { ClassificationHistoryEntry } from '@/types/document';
import { formatDistanceToNow } from 'date-fns';

interface ClassificationHistoryProps {
  history: ClassificationHistoryEntry[];
}

export function ClassificationHistory({ history }: ClassificationHistoryProps) {
  if (!history || history.length === 0) {
    return null;
  }

  const getConfidencePercent = (confidence: number) => {
    return Math.round(confidence * 100);
  };

  return (
    <Card className="border-2">
      <CardContent className="p-6">
        <h3 className="mb-4 font-medium">Classification History</h3>
        <div className="space-y-4">
          {history.map((entry) => (
            <div key={entry.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">{entry.type}</div>
                <div className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                </div>
              </div>
              {entry.reason && (
                <div className="text-sm text-muted-foreground">{entry.reason}</div>
              )}
              <div className="text-sm">
                AI Confidence: {getConfidencePercent(entry.confidence)}%
              </div>
              {entry.changed_by && (
                <div className="text-sm text-muted-foreground">
                  Changed by {entry.changed_by}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 