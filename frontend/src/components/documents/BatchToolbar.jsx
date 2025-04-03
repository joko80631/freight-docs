import { useState } from 'react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { useToast } from '../ui/use-toast';
import { useDocumentStore } from '../../store/documentStore';
import { Load, FileText, Trash2, X, Link, Download } from 'lucide-react';
import LinkToLoadModal from './LinkToLoadModal';
import ReclassifyModal from './ReclassifyModal';

export default function BatchToolbar() {
  const { selectedDocuments, setSelectedDocuments, batchDelete, batchLinkToLoad, batchReclassify, batchDownload } = useDocumentStore();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isReclassifyModalOpen, setIsReclassifyModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleClearSelection = () => {
    setSelectedDocuments([]);
  };

  const handleBatchDelete = async () => {
    if (selectedDocuments.length === 0) return;
    
    setIsLoading(true);
    try {
      await batchDelete(selectedDocuments);
      toast({
        title: 'Success',
        description: `${selectedDocuments.length} document(s) deleted successfully`,
      });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete documents',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchLink = async (loadId) => {
    if (selectedDocuments.length === 0) return;
    
    setIsLoading(true);
    try {
      await batchLinkToLoad(selectedDocuments, loadId);
      toast({
        title: 'Success',
        description: `${selectedDocuments.length} document(s) linked to load successfully`,
      });
      setIsLinkModalOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to link documents to load',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReclassify = async (documentType, reason) => {
    if (selectedDocuments.length === 0) return;
    
    setIsLoading(true);
    try {
      await batchReclassify(selectedDocuments, documentType, reason);
      toast({
        title: 'Success',
        description: `${selectedDocuments.length} document(s) reclassified successfully`,
      });
      setIsReclassifyModalOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reclassify documents',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchDownload = async () => {
    if (selectedDocuments.length === 0) return;
    
    setIsDownloading(true);
    toast({
      title: 'Downloading',
      description: `Starting download of ${selectedDocuments.length} document(s)...`,
    });
    
    try {
      const result = await batchDownload(selectedDocuments);
      
      if (result.success) {
        if (result.skippedDocuments && result.skippedDocuments.length > 0) {
          toast({
            title: 'Download Complete with Warnings',
            description: `${selectedDocuments.length - result.skippedDocuments.length} document(s) downloaded, ${result.skippedDocuments.length} skipped due to missing file URLs.`,
            variant: 'warning',
          });
        } else {
          toast({
            title: 'Download Complete',
            description: `${selectedDocuments.length} document(s) download initiated`,
          });
        }
      } else {
        toast({
          title: 'Download Failed',
          description: result.error || 'Failed to download some documents',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'An error occurred while downloading documents',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (selectedDocuments.length === 0) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-md p-4 z-50">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSelection}
              className="h-8 px-2"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBatchDownload}
              disabled={isDownloading || isLoading}
            >
              <Download className="w-4 h-4 mr-2" />
              {isDownloading ? 'Downloading...' : 'Download'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLinkModalOpen(true)}
              disabled={isLoading || isDownloading}
            >
              <Link className="w-4 h-4 mr-2" />
              Link to Load
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReclassifyModalOpen(true)}
              disabled={isLoading || isDownloading}
            >
              <FileText className="h-4 w-4 mr-1" />
              Reclassify
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isLoading || isDownloading}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete Selected
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Documents</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBatchDelete}
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link to Load Modal */}
      <LinkToLoadModal
        open={isLinkModalOpen}
        onOpenChange={setIsLinkModalOpen}
        onLink={handleBatchLink}
        isLoading={isLoading}
        isBatch={true}
      />

      {/* Reclassify Modal */}
      <ReclassifyModal
        open={isReclassifyModalOpen}
        onOpenChange={setIsReclassifyModalOpen}
        onReclassify={handleReclassify}
        isLoading={isLoading}
        isBatch={true}
      />
    </>
  );
} 