'use client';

import { useState } from 'react';
import { FreightCard } from '@/components/freight/FreightCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Document } from '@/types/document';
import { formatDistanceToNow } from 'date-fns';
import { getErrorMessage } from '@/lib/errors';

interface ClassificationDetailsProps {
  document: Document;
  onReclassify: (updatedDoc: Document) => void;
}

export function ClassificationDetails({
  document,
  onReclassify,
}: ClassificationDetailsProps) {
  const [newType, setNewType] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleReclassify = async () => {
    if (!newType || !reason) return;

    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/documents/${document.id}/reclassify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: newType,
          reason,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reclassify document');
      }

      const updatedDocument = await response.json();

      toast({
        title: 'Success',
        description: 'Document reclassified successfully',
      });

      onReclassify(updatedDocument);
      setNewType('');
      setReason('');
    } catch (error) {
      toast({
        title: 'Error',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getConfidenceVariant = (confidence: number): 'success' | 'warning' | 'error' => {
    if (confidence > 0.8) return 'success';
    if (confidence > 0.6) return 'warning';
    return 'error';
  };

  const getConfidencePercent = (confidence: number) => {
    return Math.round(confidence * 100);
  };

  return (
    <div className="space-y-6">
      <FreightCard variant="bordered">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Current Classification</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <div className="rounded-md bg-primary/10 px-3 py-1 text-sm">
                {document.type}
              </div>
              <div className="rounded-md bg-primary/10 px-3 py-1 text-sm">
                {getConfidencePercent(document.confidence)}% confidence
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium">Reclassify Document</h3>
            <div className="mt-2 space-y-4">
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="bill_of_lading">Bill of Lading</SelectItem>
                  <SelectItem value="proof_of_delivery">Proof of Delivery</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Reason for reclassification"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />

              <Button
                onClick={handleReclassify}
                disabled={!newType || !reason || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reclassifying...
                  </>
                ) : (
                  'Reclassify Document'
                )}
              </Button>
            </div>
          </div>
        </div>
      </FreightCard>

      {document.classification_history && document.classification_history.length > 0 && (
        <FreightCard variant="bordered">
          <h3 className="mb-4 font-medium">Classification History</h3>
          <div className="space-y-4">
            {document.classification_history.map((history) => (
              <div key={history.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{history.type}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(history.timestamp), { addSuffix: true })}
                  </div>
                </div>
                {history.reason && (
                  <div className="text-sm text-muted-foreground">{history.reason}</div>
                )}
                <div className="text-sm">
                  Confidence: {getConfidencePercent(history.confidence)}%
                </div>
              </div>
            ))}
          </div>
        </FreightCard>
      )}
    </div>
  );
} 