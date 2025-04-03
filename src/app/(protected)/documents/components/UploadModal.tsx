import { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (documentId: string) => void;
}

export function UploadModal({ isOpen, onClose, onUploadComplete }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Reset file when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF, PNG, or JPEG file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (20MB)
    const maxSize = 20 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Please upload a file smaller than 20MB.',
        variant: 'destructive',
      });
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload file');
      }

      // Reset file input after successful upload
      setFile(null);

      toast({
        title: 'Upload successful',
        description: (
          <div>
            <p>Your document has been uploaded successfully.</p>
            <a 
              href={data.signed_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 underline mt-2 inline-block"
            >
              View document
            </a>
          </div>
        ),
      });

      onUploadComplete(data.document_id);
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog 
        as="div" 
        className="relative z-50" 
        onClose={onClose}
        initialFocus={undefined} // Ensure headless UI doesn't override Escape behavior
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Upload Document
                </Dialog.Title>

                <div className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="file">Select File</Label>
                      <Input
                        id="file"
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleFileChange}
                        disabled={isUploading}
                      />
                    </div>

                    {file && (
                      <div className="text-sm text-gray-500">
                        Selected file: {file.name}
                        <br />
                        Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
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
                      'Upload'
                    )}
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 