'use client';

import React, { useEffect, useState } from 'react';
import { useTeamStore } from '@/store/teamStore';
import useDocumentStore from '@/store/documentStore';
import useLoadStore from '@/store/loadStore';
import DocumentView from '@/components/documents/DocumentView';
import DocumentUpload from '@/components/documents/DocumentUpload';
import DocumentFilter from '@/components/documents/DocumentFilter';
import { Button } from "@/components/ui/button";
import { Upload } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/ui/empty-state';

const DocumentsPage = () => {
  const { currentTeam } = useTeamStore();
  const { 
    documents, 
    isLoading, 
    error, 
    filters, 
    pagination,
    fetchDocuments, 
    uploadDocument, 
    updateDocument, 
    deleteDocument,
    setFilters,
    setPagination 
  } = useDocumentStore();
  const { loads, fetchLoads } = useLoadStore();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/teams/${currentTeam.id}/documents`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setDocuments(data);
      } catch (error) {
        console.error('Failed to fetch documents:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentTeam?.id) {
      fetchDocuments();
    }
  }, [currentTeam?.id]);

  const handleUpload = async (files) => {
    if (!currentTeam?.id) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const totalFiles = files.length;
      let completedFiles = 0;

      for (const file of files) {
        await uploadDocument(file, {
          team_id: currentTeam.id,
          name: file.name
        });

        completedFiles++;
        setUploadProgress((completedFiles / totalFiles) * 100);
      }

      toast({
        title: "Success",
        description: "Documents uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload documents",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleView = (document) => {
    // TODO: Implement document viewing functionality
    console.log('View document:', document);
  };

  const handleDownload = async (document) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (error) throw error;

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (document) => {
    try {
      await deleteDocument(document.id);
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  if (!currentTeam) {
    return (
      <div className="container mx-auto p-6">
        <EmptyState
          icon={FileText}
          title="No team selected"
          description="Please select or create a team to view documents."
          cta={{
            label: 'Select Team',
            href: '/teams'
          }}
          variant="centered"
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <EmptyState
          icon={FileText}
          title="No documents found"
          description="You haven't uploaded any documents for this team yet."
          cta={{
            label: 'Upload Document',
            onClick: () => setIsUploading(true)
          }}
          variant="centered"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {documents.map((document) => (
          <Card key={document.id}>
            <CardHeader>
              <CardTitle className="text-lg">{document.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {document.description}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Uploaded {new Date(document.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DocumentsPage; 