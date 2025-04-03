import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

const DOCUMENT_TYPES = [
  'Bill of Lading',
  'Commercial Invoice',
  'Packing List',
  'Certificate of Origin',
  'Other',
];

export default function ReclassifyModal({
  open,
  onOpenChange,
  onReclassify,
  isLoading,
  isBatch = false,
  document = null,
}) {
  const [documentType, setDocumentType] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!documentType) return;
    
    onReclassify(documentType, reason);
    setDocumentType('');
    setReason('');
  };

  const handleClose = () => {
    onOpenChange(false);
    setDocumentType('');
    setReason('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isBatch ? 'Reclassify Documents' : 'Reclassify Document'}
          </DialogTitle>
          <DialogDescription>
            {isBatch
              ? 'Select a new document type and provide a reason for reclassification.'
              : `Reclassify "${document?.name}" to a different document type.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="documentType">Document Type</Label>
            <Select
              value={documentType}
              onValueChange={setDocumentType}
              required
            >
              <SelectTrigger id="documentType">
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
              placeholder="Explain why you're reclassifying this document..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!documentType || isLoading}
            >
              {isLoading ? 'Reclassifying...' : 'Reclassify'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 