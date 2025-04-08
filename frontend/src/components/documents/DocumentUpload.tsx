import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTeamStore } from '@/store/team-store';

interface DocumentUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete?: () => void;
}

export function DocumentUpload({ open, onOpenChange, onUploadComplete }: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const supabase = createClientComponentClient();
  const { currentTeam } = useTeamStore();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !currentTeam?.id) return;

    setIsUploading(true);
    setProgress(0);

    try {
      const filePath = `${currentTeam.id}/${selectedFile.name}`;
      
      const { error } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Document uploaded successfully',
      });

      onUploadComplete?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload document',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setProgress(0);
      setSelectedFile(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!selectedFile ? (
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg">
              <input
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-center"
              >
                <div className="text-sm text-gray-500">
                  Click to select a file or drag and drop
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  PDF, DOC, DOCX, XLS, XLSX, CSV
                </div>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm">
                Selected file: {selectedFile.name}
              </div>
              {isUploading && (
                <div className="space-y-2">
                  <Progress value={progress} />
                  <div className="text-xs text-gray-500 text-center">
                    Uploading... {Math.round(progress)}%
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 