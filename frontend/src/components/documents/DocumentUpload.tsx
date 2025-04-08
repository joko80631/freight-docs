import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, Upload } from 'lucide-react';
import { useTeamStore } from '@/store/teamStore';

interface DocumentUploadProps {
  onUploadComplete?: (documentId: string) => void;
  loadId?: string;
}

export function DocumentUpload({ onUploadComplete, loadId }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const supabase = createClientComponentClient();
  const { currentTeam } = useTeamStore();

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    if (!currentTeam?.id) {
      toast({
        title: "Error",
        description: "No team selected. Please select a team first.",
        variant: "destructive",
      });
      return;
    }

    const file = acceptedFiles[0];
    setIsUploading(true);

    try {
      // Get user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${currentTeam.id}/${loadId || 'unassigned'}/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Create document record
      const { error: dbError, data: document } = await supabase
        .from('documents')
        .insert({
          team_id: currentTeam.id,
          load_id: loadId,
          file_url: publicUrl,
          file_path: filePath,
          original_filename: file.name,
          mime_type: file.type,
          file_size: file.size,
          status: 'PENDING_REVIEW',
          uploaded_by: session.user.id
        })
        .select()
        .single();

      if (dbError) {
        // Cleanup: Delete uploaded file if DB insert fails
        await supabase.storage
          .from('documents')
          .remove([filePath]);
        throw dbError;
      }

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      onUploadComplete?.(document.id);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        transition-colors duration-200 ease-in-out
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300'}
        ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} disabled={isUploading} />
      <div className="space-y-4">
        <div className="flex justify-center">
          {isUploading ? (
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          ) : (
            <Upload className="h-12 w-12 text-gray-400" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-medium">
            {isDragActive ? 'Drop file here' : 'Drag & drop file here'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            or click to select file
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Supported formats: PDF, PNG, JPG, DOC, DOCX (max 10MB)
        </p>
      </div>
    </div>
  );
} 