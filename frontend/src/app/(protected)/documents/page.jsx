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

  useEffect(() => {
    if (currentTeam?.id) {
      fetchDocuments(currentTeam.id, filters);
      fetchLoads(currentTeam.id);
    }
  }, [currentTeam?.id, filters, fetchDocuments, fetchLoads]);

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
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No Team Selected</h2>
          <p className="text-muted-foreground">
            Please select or create a team to view documents
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Documents</h1>
        <Button onClick={() => setIsUploading(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Documents
        </Button>
      </div>

      <DocumentFilter
        filters={filters}
        onSearchChange={(search) => setFilters({ ...filters, search })}
        onTypeChange={(type) => setFilters({ ...filters, type })}
        onStatusChange={(status) => setFilters({ ...filters, status })}
        onLoadChange={(loadId) => setFilters({ ...filters, loadId: loadId || null })}
        loads={loads}
      />

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500">
          Error loading documents: {error}
        </div>
      ) : (
        <DocumentView
          documents={documents}
          onView={handleView}
          onDownload={handleDownload}
          onDelete={handleDelete}
        />
      )}

      <DocumentUpload
        isOpen={isUploading}
        onClose={() => setIsUploading(false)}
        onUpload={handleUpload}
        isUploading={isUploading}
        progress={uploadProgress}
      />
    </div>
  );
};

export default DocumentsPage; 