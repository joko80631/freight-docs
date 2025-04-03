import { FreightModal } from '@/components/freight/FreightModal';
import { Button } from '@/components/ui/button';
import { UploadIcon, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { createMockDocument } from '@/lib/documents';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, type: string, loadId: string | undefined) => void;
}

export function UploadModal({ isOpen, onClose, onUpload }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [loadId, setLoadId] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Call the onUpload callback with the file and metadata
      onUpload(file, documentType, loadId || undefined);
      
      // Reset form
      setFile(null);
      setDocumentType('');
      setLoadId('');
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <FreightModal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Document"
      description="Upload a new document to your collection"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload'
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center">
          <UploadIcon className="mx-auto h-8 w-8 text-neutral-400" />
          <p className="mt-2 text-sm text-neutral-500">
            Drag and drop your file here, or click to browse
          </p>
          <div className="mt-4">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.tiff"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" asChild>
                <span>Browse Files</span>
              </Button>
            </label>
          </div>
          {file && (
            <p className="mt-2 text-sm font-medium text-primary-600">
              Selected: {file.name}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">Document Type (Optional)</label>
          <select 
            className="w-full rounded-md border border-neutral-300 p-2"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
          >
            <option value="">Auto-detect</option>
            <option value="Invoice">Invoice</option>
            <option value="Bill of Lading">Bill of Lading</option>
            <option value="Proof of Delivery">Proof of Delivery</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">Link to Load (Optional)</label>
          <input 
            type="text" 
            placeholder="Load ID" 
            className="w-full rounded-md border border-neutral-300 p-2"
            value={loadId}
            onChange={(e) => setLoadId(e.target.value)}
          />
        </div>
      </div>
    </FreightModal>
  );
} 