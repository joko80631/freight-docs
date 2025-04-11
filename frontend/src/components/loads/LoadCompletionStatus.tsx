import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Document } from '@/types/database';

interface LoadCompletionStatusProps {
  documents: Document[];
}

export function LoadCompletionStatus({ documents }: LoadCompletionStatusProps) {
  const requiredTypes = ['bol', 'pod', 'invoice'];
  const hasDocument = (type: string) => documents.some(doc => doc.type === type);
  const missingTypes = requiredTypes.filter(type => !hasDocument(type));
  const isComplete = missingTypes.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Document Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={isComplete ? 'success' : 'warning'}>
              {isComplete ? 'Complete' : 'Incomplete'}
            </Badge>
          </div>

          <div className="space-y-2">
            {requiredTypes.map(type => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm font-medium">{type.toUpperCase()}</span>
                <Badge variant={hasDocument(type) ? 'outline' : 'destructive'}>
                  {hasDocument(type) ? 'Present' : 'Missing'}
                </Badge>
              </div>
            ))}
          </div>

          {!isComplete && (
            <p className="text-sm text-muted-foreground">
              Missing documents: {missingTypes.map(t => t.toUpperCase()).join(', ')}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 