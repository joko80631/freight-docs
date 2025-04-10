'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTeamStore } from '@/store/team-store';

export function DocumentUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { currentTeam } = useTeamStore();
  const supabase = createClientComponentClient();

  const onDrop = async (acceptedFiles: File[]) => {
    if (!currentTeam?.id) {
      toast({
        title: 'Error',
        description: 'No team selected. Please select a team first.',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);

    try {
      for (const file of acceptedFiles) {
        const filePath = `${currentTeam.id}/${file.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase
          .from('documents')
          .insert({
            team_id: currentTeam.id,
            path: filePath,
            original_name: file.name,
            file_type: file.type,
            file_size: file.size,
          });

        if (dbError) throw dbError;
      }

      toast({
        title: 'Success',
        description: 'Documents uploaded successfully'
      });

      // Navigate back to documents list
      router.push('/documents');
      router.refresh();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload documents',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        transition-colors duration-200
        ${isDragActive ? 'border-primary bg-primary/10' : 'border-border'}
        ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} disabled={isUploading} />
      <div className="flex flex-col items-center gap-2">
        {isUploading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </>
        ) : isDragActive ? (
          <p className="text-sm text-muted-foreground">Drop the files here...</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Drag & drop files here, or click to select files
            </p>
            <p className="text-xs text-muted-foreground">
              PDF, JPG, PNG up to 10MB
            </p>
          </>
        )}
      </div>
    </div>
  );
} 