"use client"

import { useEffect } from 'react';
import { toast } from 'sonner';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useTeamStore } from '@/store/teamStore';
import { DocumentList } from '@/components/documents/DocumentList';
import { useDocumentStore } from '@/store/documentStore';

// Force dynamic rendering to prevent caching issues
export const dynamic = 'force-dynamic';

export default function DocumentsPage() {
  const { currentTeam } = useTeamStore();
  const { 
    documents, 
    isLoading, 
    error, 
    pagination, 
    setPagination, 
    fetchDocuments 
  } = useDocumentStore();

  // Fetch documents when team or pagination changes
  useEffect(() => {
    if (currentTeam?.id) {
      fetchDocuments(currentTeam.id);
    }
  }, [currentTeam?.id, pagination, fetchDocuments]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  const handleViewDocument = (id: string) => {
    const document = documents.find(doc => doc.id === id);
    if (document?.file_path) {
      window.open(`/api/documents/${id}`, '_blank');
    }
  };

  if (!currentTeam?.id) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Please select a team to view documents
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Documents</CardTitle>
          <CardDescription>
            Upload documents to share with your team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentUpload onSuccess={() => fetchDocuments(currentTeam.id)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>
            View and manage your team's documents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentList
            documents={documents}
            totalCount={documents.length}
            page={pagination.page}
            pageSize={pagination.limit}
            onPageChange={(page) => setPagination({ ...pagination, page })}
            onViewDocument={handleViewDocument}
          />
        </CardContent>
      </Card>
    </div>
  );
} 