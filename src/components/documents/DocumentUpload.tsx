import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface DocumentUploadProps {
  onUploadComplete?: (documentId: string) => void;
}

export function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsUploading(true);

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
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
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
          mime_type: file.type
        })
        .select()
        .single();

      if (dbError) {
        throw dbError;
      }

      // Trigger classification
      setIsClassifying(true);
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

      const classificationResult = await response.json();

      if (!response.ok) {
        throw new Error(classificationResult.error || 'Classification failed');
      }

      // Show classification result
      const confidencePercent = Math.round(classificationResult.classification.confidence * 100);
      const isLowConfidence = classificationResult.classification.confidence < 0.6;

      toast({
        title: isLowConfidence ? 'Low Confidence Classification' : 'Document Classified',
        description: `Classified as ${classificationResult.classification.type.toUpperCase()} (${confidencePercent}% confidence)`,
        variant: isLowConfidence ? 'warning' : 'default'
      });

      onUploadComplete?.(document.id);

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error.message,
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