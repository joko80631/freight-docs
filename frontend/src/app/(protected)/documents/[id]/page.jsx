'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Download, Link, Trash, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import LoadingSkeleton from '@/components/ui/loading-skeleton';
import EmptyState from '@/components/ui/empty-state';
import DocumentPreview from '@/components/documents/DocumentPreview';
import ClassificationDetails from '@/components/documents/ClassificationDetails';
import DocumentTimeline from '@/components/documents/DocumentTimeline';
import LinkToLoadModal from '@/components/documents/LinkToLoadModal';

const getConfidenceColor = (confidence) => {
  if (confidence >= 0.9) return 'bg-green-100 text-green-800';
  if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

export default function DocumentDetailPage() {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/documents/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch document');
        }
        const data = await response.json();
        setDocument(data);
      } catch (error) {
        setError(error.message);
        toast({
          title: 'Error',
          description: 'Failed to load document',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  const handleDownload = async () => {
    try {
      // TODO: Implement download logic
      toast({
        title: 'Success',
        description: 'Document downloaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download document',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      // TODO: Implement delete logic
      toast({
        title: 'Success',
        description: 'Document deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete document',
        variant: 'destructive',
      });
    }
  };

  const handleReclassify = async () => {
    try {
      // TODO: Implement reclassification logic
      toast({
        title: 'Success',
        description: 'Document reclassified successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reclassify document',
        variant: 'destructive',
      });
    }
  };

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
          <Button
            variant="outline"
            size="icon"
            onClick={handleReclassify}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowLinkModal(true)}
          >
            <Link className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="text-destructive"
            onClick={handleDelete}
          >
            <Trash className="h-4 w-4" />
          </Button>
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
                <p className="text-sm font-medium">Classification</p>
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
                  {Math.round(document.classification_confidence * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Load Information</CardTitle>
          </CardHeader>
          <CardContent>
            {document.load_id ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Load ID</p>
                    <p className="text-sm text-muted-foreground">#{document.load_id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <Badge variant="outline">{document.load_status}</Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowLinkModal(true)}
                >
                  Change Load
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  This document is not linked to any load
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowLinkModal(true)}
                >
                  Link to Load
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
              <DocumentPreview document={document} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="classification">
          <Card>
            <CardContent className="pt-6">
              <ClassificationDetails document={document} />
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
          // Refresh document data
        }}
      />
    </div>
  );
} 