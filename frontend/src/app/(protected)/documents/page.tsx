"use client"

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, FileText, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTeamStore } from '@/store/teamStore';
import { formatDistanceToNow } from 'date-fns';
import { DocumentList } from '@/components/documents/DocumentList';
import type { Document } from '@/types/document';

// Force dynamic rendering to prevent caching issues
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 12;

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();
  const { currentTeam } = useTeamStore();

  const fetchDocuments = async () => {
    if (!currentTeam?.id) return;
    
    setIsLoading(true);
    try {
      // Get total count
      const { count } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', currentTeam.id);

      // Get paginated documents
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('team_id', currentTeam.id)
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (error) throw error;

      setDocuments(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error("Failed to fetch documents");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (documentId: string, filePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;

      setDocuments(documents.filter(doc => doc.id !== documentId));
      toast.success("Document deleted successfully");
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error("Failed to delete document");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    if (currentTeam?.id) {
      fetchDocuments();
    }
  }, [currentTeam?.id, page]);

  const handleViewDocument = (id: string) => {
    const document = documents.find(doc => doc.id === id);
    if (document?.storage_path) {
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
          <DocumentUpload onSuccess={fetchDocuments} />
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
            totalCount={totalCount}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            onViewDocument={handleViewDocument}
          />
        </CardContent>
      </Card>
    </div>
  );
} 