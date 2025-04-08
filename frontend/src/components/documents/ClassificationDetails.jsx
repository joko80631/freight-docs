'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const DOCUMENT_TYPES = [
  'BOL',
  'POD',
  'Invoice',
  'Rate Confirmation',
  'Customs Declaration',
  'Other'
];

const getConfidenceColor = (confidence) => {
  if (confidence >= 0.9) return 'bg-green-100 text-green-800';
  if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

// Helper function to normalize confidence values
const getConfidencePercent = (val) => {
  if (val === null || val === undefined) return 0;
  return val >= 1 ? val : Math.round(val * 100);
};

export default function ClassificationDetails({ document, onReclassified }) {
  const [isReclassifying, setIsReclassifying] = useState(false);
  const [newType, setNewType] = useState(document.document_type);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReclassify = async () => {
    if (!reason || newType === document.document_type) return;
    
    try {
      setIsSubmitting(true);
      
      // Store the old type for audit purposes
      const oldType = document.document_type;
      
      const response = await fetch(`/api/documents/${document.id}/reclassify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_type: newType,
          reason: reason,
          old_type: oldType, // Include old type for audit logging
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reclassify document');
      }
      
      const updatedDocument = await response.json();
      
      toast.success('Document reclassified successfully');
      
      setIsReclassifying(false);
      setReason('');
      
      // Call the callback to update parent state
      if (onReclassified) {
        onReclassified(updatedDocument);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to reclassify document');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Classification */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Current Classification</h3>
          <Button
            variant="outline"
            onClick={() => setIsReclassifying(!isReclassifying)}
            disabled={isSubmitting}
          >
            {isReclassifying ? 'Cancel' : 'Reclassify'}
          </Button>
        </div>

        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Document Type</p>
              <Badge
                variant="outline"
                className={cn(
                  getConfidenceColor(document.classification_confidence),
                  "mt-1"
                )}
              >
                {document.document_type}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium">Confidence Score</p>
              <p className="text-sm text-muted-foreground">
                {getConfidencePercent(document.classification_confidence)}%
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Classified By</p>
            <p className="text-sm text-muted-foreground">
              {document.classified_by} • {formatDistanceToNow(new Date(document.classified_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>

      {/* Reclassification Form */}
      {isReclassifying && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="documentType">Document Type</Label>
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Reclassification</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a reason for reclassifying this document..."
                className="h-24"
              />
            </div>

            <Button
              className="w-full"
              onClick={handleReclassify}
              disabled={!reason || newType === document.document_type || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reclassifying...
                </>
              ) : (
                'Confirm Reclassification'
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Classification History */}
      {document.classification_history?.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Classification History</h3>
          <div className="space-y-4">
            {document.classification_history.map((history, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{history.document_type}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(history.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {history.reason}
                    </p>
                    <p className="text-sm">
                      Changed by {history.changed_by}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 