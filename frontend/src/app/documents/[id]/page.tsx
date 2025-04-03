'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useDocumentStore } from '@/store/documentStore';
import { formatDistanceToNow } from 'date-fns';
import { 
  RefreshCw, Link as LinkIcon, Download, Trash,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout } from '@/components/layout';
import { FreightCard, FreightBadge } from '@/components/freight/core';
import { EmptyState } from '@/components/ui/empty-state';
import { 
  ClassificationDetails,
  DocumentPreview,
  DocumentTimeline,
  LinkToLoadModal
} from '@/components/documents';

// InfoBlock component for consistent metadata display
function InfoBlock({ label, children }) {
  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

export default function DocumentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { getDocument, deleteDocument } = useDocumentStore();
  
  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  
  // Fetch document data
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setIsLoading(true);
        const doc = await getDocument(params.id);
        setDocument(doc);
      } catch (err) {
        setError(err.message || 'Failed to load document');
        toast({
          title: "Error",
          description: "Could not load document",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDocument();
  }, [params.id]);

  // Handle actions
  const handleDownload = async () => {
    try {
      // Implement download logic
      toast({
        title: "Success",
        description: "Document downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDocument(document.id);
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
      router.push('/documents');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  const triggerReclassify = () => {
    // This will scroll to classification tab and focus reclassify section
    document.querySelector('[data-value="classification"]').click();
  };

  const openLinkModal = () => {
    setShowLinkModal(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <Layout>
        <Layout.Header>
          <div className="h-12 flex items-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </Layout.Header>
        <Layout.Content>
          <div className="space-y-4">
            <div className="h-36 bg-muted animate-pulse rounded-lg" />
            <div className="h-64 bg-muted animate-pulse rounded-lg" />
          </div>
        </Layout.Content>
      </Layout>
    );
  }

  // Error or not found state
  if (error || !document) {
    return (
      <Layout>
        <Layout.Header>
          <div className="py-4">
            <h1 className="text-2xl font-bold">Document Details</h1>
          </div>
        </Layout.Header>
        <Layout.Content>
          <EmptyState
            title="Document not found"
            description="It may have been deleted or you don't have access"
          />
        </Layout.Content>
      </Layout>
    );
  }

  // Helper functions for classification display
  const getConfidenceVariant = (confidence) => {
    const score = typeof confidence === 'number' ? confidence : 0;
    if (score >= 0.9) return 'success';
    if (score >= 0.7) return 'warning';
    return 'error';
  };

  const getConfidenceLabel = (confidence) => {
    const score = typeof confidence === 'number' ? confidence : 0;
    return `${Math.round(score * 100)}%`;
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'verified': return 'success';
      case 'pending': return 'warning';
      default: return 'info';
    }
  };

  return (
    <Layout>
      <Layout.Header>
        <div className="flex items-center justify-between py-4">
          <div>
            <h1 className="text-2xl font-bold">{document.name}</h1>
            <p className="text-sm text-muted-foreground">
              Uploaded {formatDistanceToNow(new Date(document.created_at))} ago
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={triggerReclassify}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={openLinkModal}>
              <LinkIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="text-red-600" onClick={handleDelete}>
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Layout.Header>
      
      <Layout.Content>
        <div className="space-y-6">
          <FreightCard className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            <InfoBlock label="Type">{document.document_type || 'Unknown'}</InfoBlock>
            <InfoBlock label="Confidence">
              <FreightBadge variant={getConfidenceVariant(document.classification_confidence)}>
                {getConfidenceLabel(document.classification_confidence)}
              </FreightBadge>
            </InfoBlock>
            <InfoBlock label="Linked Load">
              {document.load_id 
                ? <FreightBadge variant="success">Load #{document.load_id}</FreightBadge>
                : <span className="text-muted-foreground">Unlinked</span>}
            </InfoBlock>
            <InfoBlock label="Status">
              <FreightBadge variant={getStatusVariant(document.status)}>
                {document.status || 'Unknown'}
              </FreightBadge>
            </InfoBlock>
          </FreightCard>
          
          <Tabs defaultValue="preview">
            <TabsList>
              <TabsTrigger value="preview" data-value="preview">Preview</TabsTrigger>
              <TabsTrigger value="classification" data-value="classification">Classification</TabsTrigger>
              <TabsTrigger value="timeline" data-value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="preview">
              <DocumentPreview document={document} onDownload={handleDownload} />
            </TabsContent>

            <TabsContent value="classification">
              <ClassificationDetails 
                document={document} 
                onReclassify={(updatedDoc) => setDocument(updatedDoc)} 
              />
            </TabsContent>

            <TabsContent value="timeline">
              <DocumentTimeline documentId={document.id} />
            </TabsContent>
          </Tabs>
        </div>
        
        <LinkToLoadModal
          open={showLinkModal}
          onOpenChange={setShowLinkModal}
          document={document}
          onLinkComplete={(updatedDoc) => {
            setDocument(updatedDoc);
            setShowLinkModal(false);
          }}
        />
      </Layout.Content>
    </Layout>
  );
} 