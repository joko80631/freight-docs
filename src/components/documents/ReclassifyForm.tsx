import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
import { reclassifyDocument } from '@/lib/api/documents';
import { DOCUMENT_TYPES } from '@/constants/documentTypes';

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
    
    // Prevent reclassifying to the same type
    if (newType.toLowerCase() === document.type.toLowerCase()) {
      toast({
        title: 'Invalid Selection',
        description: 'Please select a different document type',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Optimistic update
      const optimisticDoc = {
        ...document,
        type: newType,
        confidence: 0.0, // Override with 0 confidence for user changes
      };
      onReclassify(optimisticDoc);

      const updatedDocument = await reclassifyDocument(document.id, {
        type: newType,
        reason,
      });

      toast({
        title: 'Success',
        description: 'Document type updated successfully',
      });

      onReclassify(updatedDocument);
      setNewType('');
      setReason('');
    } catch (error) {
      // Roll back on failure
      onReclassify(document);
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update document type',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-2">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Update Document Type</h3>
            <div className="mt-2 space-y-4">
              <Select value={newType} onValueChange={setNewType}>
                <SelectTrigger aria-label="Select new document type">
                  <SelectValue placeholder="Select new type" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem 
                      key={type.value} 
                      value={type.value}
                      disabled={type.value.toLowerCase() === document.type.toLowerCase()}
                    >
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Why are you changing this?"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                aria-label="Reason for changing document type"
              />

              <Button
                onClick={handleReclassify}
                disabled={!newType || !reason || isSubmitting}
                className="w-full"
                aria-label="Update document type"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Document Type'
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 