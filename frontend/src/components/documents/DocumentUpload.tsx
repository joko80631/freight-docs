import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTeamStore } from '@/store/team-store';
import { Upload, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

interface DocumentUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: () => void;
}

export function DocumentUpload({ open, onOpenChange, onUploadComplete }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { currentTeam } = useTeamStore();
  const { toast } = useToast();
  const supabase = createClientComponentClient();

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
      // Upload file to storage
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `${currentTeam.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile, {
          onUploadProgress: (progress) => {
            const percent = (progress.loaded / progress.total) * 100;
            setProgress(percent);
          },
        });

      if (uploadError) throw uploadError;

      // Create document record
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          team_id: currentTeam.id,
          name: selectedFile.name,
          storage_path: filePath,
          type: 'pending',
          confidence_score: 0,
          uploaded_at: new Date().toISOString(),
        });

      if (dbError) throw dbError;

      onUploadComplete();
      onOpenChange(false);
      setSelectedFile(null);
      setProgress(0);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload document',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a document to be processed and classified by our AI
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="dropzone-file"
              className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer
                ${isUploading ? 'bg-gray-50' : 'hover:bg-gray-50'} 
                ${selectedFile ? 'border-primary' : 'border-gray-300'}`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {selectedFile ? (
                  <>
                    <Upload className="w-8 h-8 mb-4 text-primary" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">{selectedFile.name}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {isUploading && (
                      <div className="w-full max-w-xs mt-4">
                        <Progress value={progress} className="w-full" />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, PNG, JPG or TIFF (MAX. 10MB)
                    </p>
                  </>
                )}
              </div>
              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.tiff"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
            </label>
          </div>

          <div className="flex justify-end gap-3">
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