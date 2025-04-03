'use client';

import { useState, useEffect } from 'react';
import { useTeamStore } from '@/store/teamStore';
import { useDocumentStore } from '@/store/documentStore';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid, List, Upload, Filter } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { DocumentUpload } from '@/components/documents/DocumentUpload';
import { DocumentsGrid } from '@/components/documents/DocumentsGrid';
import { DocumentsTable } from '@/components/documents/DocumentsTable';
import { DocumentFilters } from '@/components/documents/DocumentFilters';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

function DocumentsPage() {
  const { currentTeam = null } = useTeamStore();
  const { 
    documents = [], 
    isLoading = false, 
    error = null, 
    filters = {
      documentType: '',
      confidence: '',
      loadStatus: '',
      dateFrom: '',
      dateTo: '',
      search: '',
    }, 
    pagination = {
      page: 1,
      limit: 10,
      total: 0,
    },
    fetchDocuments = async () => {}, 
    setFilters = () => {},
    setPagination = () => {} 
  } = useDocumentStore();
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (currentTeam?.id) {
      fetchDocuments(currentTeam.id);
    }
  }, [currentTeam?.id, filters, pagination]);

  const handleUploadComplete = () => {
    fetchDocuments(currentTeam.id);
    toast({
      title: "Success",
      description: "Documents uploaded successfully",
    });
  };

  if (isLoading) {
    return <LoadingSkeleton className="h-[600px]" />;
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            <p>Error loading documents: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Manage and classify your freight documents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? (
              <List className="h-4 w-4" />
            ) : (
              <Grid className="h-4 w-4" />
            )}
          </Button>
          <DocumentUpload onUploadComplete={handleUploadComplete} />
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <DocumentFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
          </CardContent>
        </Card>
      )}

      {/* Documents View */}
      {documents.length === 0 ? (
        <EmptyState
          title="No documents found"
          description="Upload your first document to get started"
          icon={Upload}
        />
      ) : (
        <Tabs value={viewMode} onValueChange={setViewMode}>
          <TabsContent value="grid">
            <DocumentsGrid documents={documents} />
          </TabsContent>
          <TabsContent value="list">
            <DocumentsTable documents={documents} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

export default DocumentsPage; 