import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface DocumentUploadProps {
  onUploadComplete?: (documentId: string) => void;
  onUploadError?: (error: Error) => void;
  onUploadStart?: () => void;
}

export function DocumentUpload({ 
  onUploadComplete, 
  onUploadError,
  onUploadStart 
}: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsUploading(true);
    onUploadStart?.();

    try {
      // Get user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Get user's team
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', session.user.id)
        .single();

      if (!teamMember) {
        throw new Error('No team found');
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${teamMember.team_id}/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError, data: uploadData } = await supabase
        .storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      // Create document record
      const { error: dbError, data: document } = await supabase
        .from('documents')
        .insert({
          name: file.name,
          storage_path: filePath,
          team_id: teamMember.team_id,
          uploaded_by: session.user.id,
          size: file.size,
          mime_type: file.type,
          status: 'pending_classification' // Add status to track progress
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database insert error:', dbError);
        // Try to clean up the uploaded file if database insert fails
        await supabase.storage.from('documents').remove([filePath]);
        throw new Error(`Failed to create document record: ${dbError.message}`);
      }

      // Trigger classification
      setIsClassifying(true);
      try {
        const response = await fetch('/api/documents/classify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            documentId: document.id,
            storagePath: filePath
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Classification API error:', errorData);
          throw new Error(errorData.error || `Classification failed: ${response.statusText}`);
        }

        const classificationResult = await response.json();

        // Show classification result
        const confidencePercent = Math.round(classificationResult.classification.confidence * 100);
        const isLowConfidence = classificationResult.classification.confidence < 0.6;

        toast({
          title: isLowConfidence ? 'Low Confidence Classification' : 'Document Classified',
          description: `Classified as ${classificationResult.classification.type.toUpperCase()} (${confidencePercent}% confidence)`,
          variant: isLowConfidence ? 'destructive' : 'default'
        });

        onUploadComplete?.(document.id);
      } catch (classifyError) {
        // Update document status to reflect classification failure
        await supabase
          .from('documents')
          .update({ status: 'classification_failed' })
          .eq('id', document.id);
          
        throw classifyError;
      }

    } catch (error) {
      const uploadError = error instanceof Error ? error : new Error('Upload failed');
      console.error('Upload process error:', uploadError);
      onUploadError?.(uploadError);
      toast({
        title: 'Upload Failed',
        description: uploadError.message,
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      setIsClassifying(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
        ${isUploading || isClassifying ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input {...getInputProps()} disabled={isUploading || isClassifying} />
      <div className="flex flex-col items-center gap-2">
        {(isUploading || isClassifying) ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm text-muted-foreground">
              {isUploading ? 'Uploading...' : 'Classifying document...'}
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {isDragActive
                ? 'Drop the file here'
                : 'Drag & drop a document here, or click to select'}
            </p>
            <p className="text-xs text-muted-foreground">
              Supported formats: PDF, PNG, JPG, JPEG
            </p>
          </>
        )}
      </div>
    </div>
  );
} 