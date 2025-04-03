'use client';

import { useState } from 'react';
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
import { getErrorMessage } from '@/lib/errors';

interface ReclassifyFormProps {
  document: Document;
  onReclassify: (updatedDoc: Document) => void;
}

export function ReclassifyForm({ document, onReclassify }: ReclassifyFormProps) {
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

  return (
    <div className="space-y-4">
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
  );
} 