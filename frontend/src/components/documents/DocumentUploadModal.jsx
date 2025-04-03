import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTeamStore } from '@/store/teamStore';
import { Upload, Loader2 } from 'lucide-react';

const DOCUMENT_TYPES = {
  BOL: 'Bill of Lading',
  POD: 'Proof of Delivery',
  INVOICE: 'Invoice',
  OTHER: 'Other Document',
};

export default function DocumentUploadModal({
  open,
  onOpenChange,
  documentType,
  loadId,
  onUploadComplete,
}) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const supabase = createClientComponentClient();
  const { currentTeam } = useTeamStore();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !loadId || !currentTeam?.id) return;

    setIsUploading(true);
    try {
      // 1. Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${loadId}/${documentType}_${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      // 3. Create document record
      const { data: document, error: documentError } = await supabase
        .from('documents')
        .insert({
          team_id: currentTeam.id,
          load_id: loadId,
          type: documentType,
          file_url: publicUrl,
          file_name: file.name,
          status: 'pending',
        })
        .select()
        .single();

      if (documentError) throw documentError;

      // 4. Create load event
      const { error: eventError } = await supabase
        .from('load_events')
        .insert({
          load_id: loadId,
          type: 'document',
          description: `${DOCUMENT_TYPES[documentType]} uploaded`,
          metadata: {
            document_id: document.id,
            document_type: documentType,
          },
        });

      if (eventError) throw eventError;

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      onUploadComplete?.();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setFile(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload {DOCUMENT_TYPES[documentType]}</DialogTitle>
          <DialogDescription>
            Upload a document for this load. The document will be automatically classified.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="file">Document File</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 