"use client"

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileText, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTeamStore } from '@/store/teamStore';
import { formatDistanceToNow } from 'date-fns';

// Force dynamic rendering to prevent caching issues
export const dynamic = 'force-dynamic';

interface Document {
  id: string;
  original_filename: string;
  file_url: string;
  file_path: string;
  created_at: string;
  status: string;
  file_size: number;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();
  const { currentTeam } = useTeamStore();

  const fetchDocuments = async () => {
    if (!currentTeam?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('team_id', currentTeam.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
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
    fetchDocuments();
  }, [currentTeam?.id]);

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
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentUpload onUploadComplete={() => fetchDocuments()} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-6">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">
              No documents uploaded yet
            </p>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{doc.original_filename}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(doc.file_size)} • Uploaded {formatDistanceToNow(new Date(doc.created_at))} ago
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(doc.file_url, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(doc.id, doc.file_path)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 