'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormControl } from '@/components/ui/form-control';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Database } from '@/src/types/database';
import { toast } from 'sonner';

const DOCUMENT_TYPES = [
  'BOL', // Bill of Lading
  'POD', // Proof of Delivery
  'INVOICE',
  'OTHER'
] as const;

type DocumentType = typeof DOCUMENT_TYPES[number];

interface DocumentUploadProps {
  loadId: string;
  onUploadComplete?: () => void;
}

export function DocumentUpload({ loadId, onUploadComplete }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>('BOL');
  const supabase = createClientComponentClient<Database>();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // 1. Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${loadId}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // 2. Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      // 3. Create document record
      const { data: document, error: insertError } = await supabase
        .from('documents')
        .insert({
          load_id: loadId,
          file_name: selectedFile.name,
          file_url: publicUrl,
          storage_path: fileName,
          type: documentType,
          team_id: (await supabase.auth.getUser()).data.user?.id || '',
          status: 'pending'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 4. Trigger document classification
      setIsClassifying(true);
      try {
        const response = await fetch('/api/documents/classify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            documentId: document.id,
            storagePath: fileName,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to classify document');
        }

        const result = await response.json();
        
        // Update document with classification results
        await supabase
          .from('documents')
          .update({
            type: result.classification.type,
            confidence_score: result.classification.confidence,
            classification_reason: result.classification.reason,
            status: 'classified'
          })
          .eq('id', document.id);

        toast({
          title: 'Document Classified',
          description: `Document classified as ${result.classification.type.toUpperCase()} with ${Math.round(result.classification.confidence * 100)}% confidence`,
        });
      } catch (error) {
        console.error('Classification error:', error);
        toast.error('Classification Failed', {
          description: 'Document was uploaded but classification failed. You can retry classification later.'
        });
      } finally {
        setIsClassifying(false);
      }

      // 5. Reset form and notify parent
      setSelectedFile(null);
      setDocumentType('BOL');
      onUploadComplete?.();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Upload Failed', {
        description: 'Failed to upload document. Please try again.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <FormControl label="Document Type">
        <Select
          value={documentType}
          onValueChange={(value) => setDocumentType(value as DocumentType)}
        >
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
      </FormControl>

      <FormControl label="File">
        <div className="flex items-center space-x-2">
          <input
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            accept=".pdf,.jpg,.jpeg,.png"
          />
          <label
            htmlFor="file-upload"
            className="flex-1 cursor-pointer rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            {selectedFile ? selectedFile.name : 'Choose file'}
          </label>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading || isClassifying}
          >
            {isUploading || isClassifying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span className="ml-2">
              {isUploading ? 'Uploading...' : isClassifying ? 'Classifying...' : 'Upload'}
            </span>
          </Button>
        </div>
      </FormControl>
    </div>
  );
} 