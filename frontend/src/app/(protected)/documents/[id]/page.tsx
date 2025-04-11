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
import { DocumentErrorBoundary } from '@/components/error/DocumentErrorBoundary';
import { useTeamStore } from '@/store/team-store';

export default function DocumentDetailPage() {
  const params = useParams();
  const documentId = params.id as string;
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClientComponentClient();
  const { currentTeam } = useTeamStore();
  
  const [document, setDocument] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReclassifying, setIsReclassifying] = useState(false);
  const [isRetryingClassification, setIsRetryingClassification] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchDocument = async () => {
      if (!currentTeam?.id) {
        toast({
          title: 'Error',
          description: 'No team selected',
          variant: 'destructive'
        });
        return;
      }

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
          .eq('team_id', currentTeam.id)
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
    
    if (documentId && currentTeam?.id) {
      fetchDocument();
    }
  }, [documentId, currentTeam?.id, supabase, toast]);

  const handleReclassify = async (type: string) => {
    if (!currentTeam?.id) {
      toast({
        title: 'Error',
        description: 'No team selected',
        variant: 'destructive'
      });
      return;
    }

    setIsReclassifying(true);
    try {
      const response = await fetch(`/api/documents/${documentId}/classify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-team-id': currentTeam.id
        },
        body: JSON.stringify({ type })
      });

      if (!response.ok) throw new Error('Failed to reclassify document');

      const updatedDoc = await response.json();
      setDocument(updatedDoc);
      toast({
        title: 'Success',
        description: 'Document reclassified successfully'
      });
    } catch (error) {
      console.error('Reclassification error:', error);
      toast({
        title: 'Error',
        description: 'Failed to reclassify document',
        variant: 'destructive'
      });
    } finally {
      setIsReclassifying(false);
    }
  };

  const handleRetryClassification = async () => {
    if (!currentTeam?.id) {
      toast({
        title: 'Error',
        description: 'No team selected',
        variant: 'destructive'
      });
      return;
    }

    setIsRetryingClassification(true);
    try {
      const response = await fetch(`/api/documents/${documentId}/classify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-team-id': currentTeam.id
        }
      });

      if (!response.ok) throw new Error('Failed to retry classification');

      const updatedDoc = await response.json();
      setDocument(updatedDoc);
      toast({
        title: 'Success',
        description: 'Classification completed successfully'
      });
    } catch (error) {
      console.error('Classification error:', error);
      toast({
        title: 'Error',
        description: 'Failed to classify document',
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
    <DocumentErrorBoundary>
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
              <Button
                variant="outline"
                onClick={handleRetryClassification}
                disabled={isRetryingClassification}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRetryingClassification ? 'animate-spin' : ''}`} />
                Retry Classification
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
        </div>
      </div>
      <Toaster />
    </DocumentErrorBoundary>
  );
} 