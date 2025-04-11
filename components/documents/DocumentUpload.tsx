'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormControl } from '@/components/ui/form-control';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Database } from '@/types/database';
import { toast } from 'sonner';
import { useTeamStore } from '@/store/team-store';

const DOCUMENT_TYPES = [
  'BOL', // Bill of Lading
  'POD', // Proof of Delivery
  'INVOICE',
  'OTHER'
] as const;

type DocumentType = typeof DOCUMENT_TYPES[number];

interface DocumentUploadProps {
  loadId?: string;
  onUploadComplete?: () => void;
}

export function DocumentUpload({ loadId, onUploadComplete }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>('BOL');
  const supabase = createClientComponentClient<Database>();
  const { currentTeam } = useTeamStore();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!currentTeam) {
      toast.error('No team selected');
      return;
    }

    setIsUploading(true);
    try {
      // 1. Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${currentTeam.id}/${loadId || 'unassigned'}/${Date.now()}.${fileExt}`;
      
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
          load_id: loadId || null,
          file_name: selectedFile.name,
          file_url: publicUrl,
          storage_path: fileName,
          type: documentType,
          team_id: currentTeam.id,
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
            confidence_score: result.confidence,
            classification_result: result.classification,
          })
          .eq('id', document.id);

        toast.success('Document uploaded and classified successfully');
        onUploadComplete?.();
      } catch (error) {
        console.error('Classification error:', error);
        toast.error('Document uploaded but classification failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
      setIsClassifying(false);
      setSelectedFile(null);
    }
  };

  return (
    <div className="space-y-6">
      <FormControl>
        <label className="block text-sm font-medium text-gray-700">
          Document Type
        </label>
        <Select
          value={documentType}
          onValueChange={(value: DocumentType) => setDocumentType(value)}
        >
          <SelectTrigger>
            <SelectValue />
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

      <FormControl>
        <label className="block text-sm font-medium text-gray-700">
          File
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
              >
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">
              PDF, PNG, JPG up to 10MB
            </p>
          </div>
        </div>
      </FormControl>

      {selectedFile && (
        <div className="text-sm text-gray-500">
          Selected: {selectedFile.name}
        </div>
      )}

      <Button
        onClick={handleUpload}
        disabled={!selectedFile || isUploading || isClassifying}
        className="w-full"
      >
        {isUploading || isClassifying ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}
        {isUploading ? 'Uploading...' : isClassifying ? 'Classifying...' : 'Upload Document'}
      </Button>
    </div>
  );
} 