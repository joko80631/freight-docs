import { useState } from 'react';
import { showToast } from '@/lib/toast';
import { Document } from '@/types/document';
import { batchDownload } from '@/lib/documents';

interface BatchToolbarProps {
  selectedDocuments: Document[];
  onSelectionChange?: (documents: Document[]) => void;
}

interface DownloadResult {
  success: boolean;
  skippedDocuments?: Document[];
  error?: string;
}

export function BatchToolbar({ selectedDocuments, onSelectionChange }: BatchToolbarProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleBatchDownload = async () => {
    if (selectedDocuments.length === 0) return;
    
    setIsDownloading(true);
    showToast.loading('Downloading', {
      description: `Starting download of ${selectedDocuments.length} document(s)...`,
    });
    
    try {
      const result = await batchDownload(selectedDocuments);
      
      if (result.success) {
        if (result.skippedDocuments && result.skippedDocuments.length > 0) {
          showToast.warning('Download Complete with Warnings', {
            description: `${selectedDocuments.length - result.skippedDocuments.length} document(s) downloaded, ${result.skippedDocuments.length} skipped due to missing file URLs.`,
          });
        } else {
          showToast.success('Download Complete', {
            description: `${selectedDocuments.length} document(s) download initiated`,
          });
        }
      } else {
        showToast.error('Download Failed', {
          description: result.error || 'Failed to download some documents',
        });
      }
    } catch (error) {
      showToast.error('Download Failed', {
        description: 'An error occurred while downloading documents',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (selectedDocuments.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {selectedDocuments.length} document(s) selected
        </div>
        <div className="space-x-2">
          <button
            onClick={handleBatchDownload}
            disabled={isDownloading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isDownloading ? 'Downloading...' : 'Download Selected'}
          </button>
          <button
            onClick={() => onSelectionChange?.([])}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Clear Selection
          </button>
        </div>
      </div>
    </div>
  );
} 