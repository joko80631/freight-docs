'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Download, Link, Trash, RefreshCw, FileText, ExternalLink } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { DocumentPreview } from '@/components/documents/DocumentPreview';
import { ClassificationDetails } from '@/components/documents/ClassificationDetails';
import { DocumentTimeline } from '@/components/documents/DocumentTimeline';
import { LinkToLoadModal } from '@/components/documents/LinkToLoadModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { routes } from '@/config/routes';

const getConfidenceColor = (confidence) => {
  if (confidence >= 0.9) return 'bg-green-100 text-green-800';
  if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

// Helper function to normalize confidence values
const getConfidencePercent = (val) => {
  if (val === null || val === undefined) return 0;
  return val >= 1 ? val : Math.round(val * 100);
};

export default function DocumentDetailPage() {
  const { id = '' } = useParams();
  const router = useRouter();
  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { user = null, isAdmin = false } = useAuth();

  useEffect(() => {
    if (id) {
      fetchDocument();
    }
  }, [id]);

  const fetchDocument = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/documents/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch document');
      }
      const data = await response.json();
      setDocument(data || null);
    } catch (error) {
      setError(error?.message || 'An error occurred');
      toast.error('Failed to load document');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/documents/${id}/download`);
      if (!response.ok) throw new Error('Failed to download document');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Document downloaded successfully');
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete document');

      toast.success('Document deleted successfully');
      router.push('/documents');
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const handleReclassified = (updatedDocument) => {
    setDocument(updatedDocument);
  };

  // Check if the current user has permission to modify this document
  const canModifyDocument = document && (
    isAdmin || 
    user?.id === document.uploaded_by_id || 
    user?.id === document.team_owner_id
  );

  if (isLoading) {
    return <LoadingSkeleton className="h-[600px]" />;
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            <p>Error loading document: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!document) {
    return (
      <EmptyState
        title="Document not found"
        description="The document you're looking for doesn't exist or you don't have permission to view it."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{document.name}</h1>
          <p className="text-muted-foreground">
            Uploaded {formatDistanceToNow(new Date(document.created_at), { addSuffix: true })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canModifyDocument && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowLinkModal(true)}
            >
              <Link className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
          </Button>
          {canModifyDocument && (
            <Button
              variant="outline"
              size="icon"
              className="text-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Document Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Document Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">File Type</p>
                <p className="text-sm text-muted-foreground">{document.file_type}</p>
              </div>
              <div>
                <p className="text-sm font-medium">File Size</p>
                <p className="text-sm text-muted-foreground">{document.file_size}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Uploaded By</p>
                <p className="text-sm text-muted-foreground">{document.uploaded_by}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Upload Date</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(document.created_at), 'PPp')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Classification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Document Type</p>
                <Badge
                  variant="secondary"
                  className={cn(
                    getConfidenceColor(document.classification_confidence),
                    "font-medium"
                  )}
                >
                  {document.document_type}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Confidence</p>
                <p className="text-sm text-muted-foreground">
                  {getConfidencePercent(document.classification_confidence)}%
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Classified By</p>
                <p className="text-sm text-muted-foreground">{document.classified_by}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Classification Date</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(document.classified_at), 'PPp')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Linked Load */}
      {document.load_id && (
        <Card>
          <CardHeader>
            <CardTitle>Linked Load</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">{document.load.reference_number}</p>
                <p className="text-sm text-muted-foreground">
                  {document.load.origin} → {document.load.destination}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(routes.loads.detail(document.load_id))}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Load
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="preview">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="classification">Classification</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>
        <TabsContent value="preview">
          <Card>
            <CardContent className="pt-6">
              <DocumentPreview 
                document={document} 
                onDownload={handleDownload}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="classification">
          <Card>
            <CardContent className="pt-6">
              <ClassificationDetails 
                document={document} 
                onReclassified={handleReclassified}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="timeline">
          <Card>
            <CardContent className="pt-6">
              <DocumentTimeline document={document} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Link to Load Modal */}
      <LinkToLoadModal
        open={showLinkModal}
        onOpenChange={setShowLinkModal}
        document={document}
        onLinkComplete={() => {
          setShowLinkModal(false);
          fetchDocument();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 