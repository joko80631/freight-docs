import { Card, CardContent } from '@/components/ui/card';
import { Document } from '@/types/document';

interface ClassificationSummaryProps {
  document: Document;
}

export function ClassificationSummary({ document }: ClassificationSummaryProps) {
  const getConfidencePercent = (confidence: number) => {
    return Math.round(confidence * 100);
  };

  return (
    <Card className="border-2">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Current Classification</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <div className="rounded-md bg-primary/10 px-3 py-1 text-sm">
                {document.type}
              </div>
              <div className="rounded-md bg-primary/10 px-3 py-1 text-sm">
                {getConfidencePercent(document.confidence)}% AI Confidence
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 