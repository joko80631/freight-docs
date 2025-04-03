'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const DOCUMENT_TYPES = [
  'BOL',
  'POD',
  'Invoice',
  'Rate Confirmation',
  'Insurance',
  'Other',
];

const getConfidenceColor = (confidence) => {
  if (confidence >= 0.9) return 'bg-green-100 text-green-800';
  if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

export default function ClassificationDetails({ document }) {
  const [selectedType, setSelectedType] = useState(document.document_type);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleReclassify = async () => {
    try {
      setIsSubmitting(true);
      // TODO: Implement reclassification API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      toast({
        title: 'Success',
        description: 'Document reclassified successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reclassify document',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Classification */}
      <Card>
        <CardHeader>
          <CardTitle>Current Classification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Document Type</p>
              <Badge
                variant="secondary"
                className={cn(
                  getConfidenceColor(document.classification_confidence),
                  "font-medium mt-1"
                )}
              >
                {document.document_type}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium">Confidence Score</p>
              <p className="text-sm text-muted-foreground mt-1">
                {Math.round(document.classification_confidence * 100)}%
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">Classification Details</p>
            <pre className="mt-2 p-4 bg-muted rounded-lg overflow-auto text-sm">
              {JSON.stringify(document.classification_details, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Reclassification */}
      <Card>
        <CardHeader>
          <CardTitle>Reclassify Document</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Document Type</Label>
            <Select
              value={selectedType}
              onValueChange={setSelectedType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type.toLowerCase()}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Reason for Change</Label>
            <Textarea
              placeholder="Explain why you're changing the classification..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <Button
            className="w-full"
            onClick={handleReclassify}
            disabled={isSubmitting || !reason}
          >
            {isSubmitting ? 'Reclassifying...' : 'Reclassify Document'}
          </Button>
        </CardContent>
      </Card>

      {/* Classification History */}
      <Card>
        <CardHeader>
          <CardTitle>Classification History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {document.classification_history?.map((history, index) => (
              <div
                key={index}
                className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={cn(
                        getConfidenceColor(history.confidence),
                        "font-medium"
                      )}
                    >
                      {history.document_type}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(history.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {history.reason && (
                    <p className="text-sm text-muted-foreground">
                      {history.reason}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 