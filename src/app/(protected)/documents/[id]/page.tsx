'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/toaster';
import { Loader2, File, FileText, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { AuditLogViewer } from '@/components/audit/AuditLogViewer';
import { ConfidenceBadge } from '@/components/documents/ConfidenceBadge';
import { ClassificationReason } from '@/components/documents/ClassificationReason';

export default function DocumentDetailPage() {
  const params = useParams();
  const documentId = params.id as string;
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClientComponentClient();
  
  const [document, setDocument] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReclassifying, setIsReclassifying] = useState(false);
  const [isRetryingClassification, setIsRetryingClassification] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchDocument = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('documents')
          .select(`
            *,
            loads(*),
            classification_history(*)
          `)
          .eq('id', documentId)
          .single();
          
        if (error) throw error;
        
        setDocument(data);
        
        // Get signed URL for document preview
        if (data?.storage_path) {
          const { data: urlData, error: urlError } = await supabase
            .storage
            .from('documents')
            .createSignedUrl(data.storage_path, 3600); // 1 hour expiry
            
          if (!urlError && urlData) {
            setDocumentUrl(urlData.signedUrl);
          }
        }
      } catch (error) {
        console.error('Error fetching document:', error);
        toast({
          title: 'Error',
          description: 'Failed to load document details',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (documentId) {
      fetchDocument();
    }
  }, [documentId, supabase]);
  
  const handleReclassify = async (newType: string) => {
    if (!document || newType === document.type) return;
    
    // Store original type for rollback if needed
    const originalType = document.type;
    
    // Optimistically update UI
    setDocument({
      ...document,
      type: newType
    });
    
    setIsReclassifying(true);
    
    try {
      const response = await fetch('/api/documents/reclassify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: document.id,
          newType
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to reclassify document');
      }
      
      toast({
        title: 'Document Reclassified',
        description: `Document has been reclassified as ${newType.toUpperCase()}`,
      });
      
    } catch (error) {
      console.error('Reclassification error:', error);
      
      // Rollback optimistic update
      setDocument({
        ...document,
        type: originalType
      });
      
      toast({
        title: 'Reclassification Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsReclassifying(false);
    }
  };

  const handleRetryClassification = async () => {
    if (!document || isRetryingClassification) return;
    
    setIsRetryingClassification(true);
    
    try {
      const response = await fetch('/api/documents/retry-classification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: document.id
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to retry classification');
      }
      
      // Update local document state with new classification
      setDocument({
        ...document,
        type: result.classification.type,
        confidence_score: result.classification.confidence,
        classification_reason: result.classification.reason,
        source: 'openai_retry'
      });
      
      toast({
        title: 'Classification Updated',
        description: `Document classified as ${result.classification.type.toUpperCase()} with ${Math.round(result.classification.confidence * 100)}% confidence`,
      });
      
      // Refresh the document data to get updated classification history
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          loads(*),
          classification_history(*)
        `)
        .eq('id', documentId)
        .single();
        
      if (!error && data) {
        setDocument(data);
      }
      
    } catch (error) {
      console.error('Retry classification error:', error);
      toast({
        title: 'Classification Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsRetryingClassification(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }
  
  if (!document) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12 border rounded-lg">
          <File className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium">Document not found</h3>
          <p className="text-slate-500 mt-1">
            The document you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/documents">Back to Documents</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="outline" asChild className="mb-4">
          <Link href="/documents">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Documents
          </Link>
        </Button>
        
        <h1 className="text-2xl font-bold mb-2">{document.name}</h1>
        
        <div className="flex items-center space-x-4 mb-4">
          <div className="bg-slate-100 px-3 py-1 rounded-full text-sm">
            Type: {document.type?.toUpperCase() || 'UNCLASSIFIED'}
          </div>
          
          {document.confidence_score && (
            <ConfidenceBadge 
              confidence={document.confidence_score} 
              size="sm"
            />
          )}
          
          {document.source && (
            <div className="bg-slate-100 px-3 py-1 rounded-full text-sm">
              Source: {document.source}
            </div>
          )}
        </div>
        
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-2">Reclassify Document</h2>
          <div className="flex space-x-2">
            {['bol', 'pod', 'invoice', 'other'].map((type) => (
              <Button
                key={type}
                variant={document.type === type ? 'default' : 'outline'}
                onClick={() => handleReclassify(type)}
                disabled={isReclassifying || document.type === type}
              >
                {type.toUpperCase()}
                {isReclassifying && document.type === type && (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                )}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <Button 
            onClick={handleRetryClassification} 
            disabled={isRetryingClassification}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isRetryingClassification ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Retry AI Classification
          </Button>
          {document.confidence_score < 0.6 && (
            <p className="text-xs text-amber-600 mt-1">
              Low confidence detected. Consider retrying classification.
            </p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="border rounded-lg overflow-hidden">
            {documentUrl ? (
              document.mime_type?.includes('pdf') ? (
                <iframe
                  src={`${documentUrl}#toolbar=0`}
                  className="w-full h-[70vh]"
                  title={document.name}
                />
              ) : (
                <img
                  src={documentUrl}
                  alt={document.name}
                  className="w-full object-contain max-h-[70vh]"
                />
              )
            ) : (
              <div className="flex items-center justify-center h-[70vh] bg-slate-50">
                <FileText className="h-24 w-24 text-slate-300" />
              </div>
            )}
          </div>
        </div>
        
        <div>
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-medium mb-4">Document Details</h2>
            
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-slate-500">Uploaded</h3>
                <p>{new Date(document.uploaded_at).toLocaleString()}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-slate-500">Size</h3>
                <p>{formatFileSize(document.size)}</p>
              </div>
              
              {document.loads && (
                <div>
                  <h3 className="text-sm font-medium text-slate-500">Linked Load</h3>
                  <p>{document.loads.reference_number || 'None'}</p>
                </div>
              )}
              
              {document.classification_reason && (
                <ClassificationReason reason={document.classification_reason} />
              )}
            </div>
            
            {document.classification_history?.length > 0 && (
              <div className="mt-6">
                <h3 className="text-md font-medium mb-2">Classification History</h3>
                <div className="border-t pt-2">
                  {document.classification_history
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((history, index) => (
                      <div key={index} className="py-2 border-b last:border-b-0">
                        <div className="flex justify-between text-sm">
                          <span>
                            {history.previous_type 
                              ? `${history.previous_type.toUpperCase()} → ${history.new_type.toUpperCase()}`
                              : `Classified as ${history.new_type.toUpperCase()}`}
                          </span>
                          <span className="text-slate-500">
                            {formatRelativeTime(history.classified_at)}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {history.source} {history.confidence_score 
                            ? `(${Math.round(history.confidence_score * 100)}% confidence)` 
                            : ''}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8">
            <h2 className="text-lg font-medium mb-4">Activity Log</h2>
            <AuditLogViewer documentId={documentId} />
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (!bytes) return 'Unknown';
  
  const units = ['bytes', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

// Helper function to format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
} 