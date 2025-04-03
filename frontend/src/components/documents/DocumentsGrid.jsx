'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Download, Link, Trash, Plus, CheckSquare, Square } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useDocumentStore } from '../../store/documentStore';
import { useTeamStore } from '../../store/teamStore';
import DocumentCard from './DocumentCard';
import DocumentFilters from './DocumentFilters';
import FilterSummaryBar from './FilterSummaryBar';
import BatchToolbar from './BatchToolbar';
import Pagination from '../ui/pagination';
import { Checkbox } from '../ui/checkbox';

const getConfidenceColor = (confidence) => {
  if (confidence >= 0.9) return 'bg-green-100 text-green-800';
  if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

export default function DocumentsGrid() {
  const router = useRouter();
  const { currentTeam } = useTeamStore();
  const {
    documents,
    isLoading,
    error,
    filters,
    pagination,
    selectedDocuments,
    fetchDocuments,
    setFilters,
    setPagination,
    setSelectedDocuments,
  } = useDocumentStore();
  const { toast } = useToast();

  const [isSelectAll, setIsSelectAll] = useState(false);

  useEffect(() => {
    if (currentTeam?.id) {
      fetchDocuments(currentTeam.id);
    }
  }, [currentTeam?.id, filters, pagination.page, pagination.limit]);

  // Update select all state when documents or selected documents change
  useEffect(() => {
    if (documents.length > 0 && selectedDocuments.length === documents.length) {
      setIsSelectAll(true);
    } else {
      setIsSelectAll(false);
    }
  }, [documents, selectedDocuments]);

  const handlePageChange = (page) => {
    setPagination({ ...pagination, page });
  };

  const handlePageSizeChange = (limit) => {
    setPagination({ ...pagination, page: 1, limit });
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleUploadClick = () => {
    router.push('/documents/upload');
  };

  const handleSelectAll = () => {
    if (isSelectAll) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(documents.map(doc => doc.id));
    }
    setIsSelectAll(!isSelectAll);
  };

  const handleKeyDown = (e) => {
    // Select all with Ctrl+A
    if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSelectAll();
    }
    
    // Clear selection with Escape
    if (e.key === 'Escape') {
      setSelectedDocuments([]);
      setIsSelectAll(false);
    }
  };

  // Add keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSelectAll, documents, selectedDocuments]);

  const handleDownload = async (document) => {
    try {
      // TODO: Implement download logic
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

  const handleDelete = async (document) => {
    try {
      // TODO: Implement delete logic
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

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading documents: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Documents</h1>
        <Button onClick={handleUploadClick}>
          <Plus className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      <DocumentFilters
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      <FilterSummaryBar 
        filters={filters} 
        onFilterChange={handleFilterChange}
        totalItems={pagination.total}
        filteredItems={documents.length}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-48 bg-gray-100 animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No documents found. Upload your first document to get started.
        </div>
      ) : (
        <>
          <div className="flex items-center mb-2">
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={handleSelectAll}
            >
              <Checkbox
                checked={isSelectAll}
                onCheckedChange={handleSelectAll}
                aria-label="Select all documents"
              />
              <span className="text-sm font-medium">
                {isSelectAll ? 'Deselect All' : 'Select All'}
              </span>
            </div>
            {selectedDocuments.length > 0 && (
              <span className="text-sm text-muted-foreground ml-2">
                {selectedDocuments.length} selected
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onSelect={(selected) => {
                  setSelectedDocuments(
                    selected
                      ? [...selectedDocuments, document.id]
                      : selectedDocuments.filter((id) => id !== document.id)
                  );
                }}
                isSelected={selectedDocuments.includes(document.id)}
              />
            ))}
          </div>

          <Pagination
            currentPage={pagination.page}
            totalPages={Math.ceil(pagination.total / pagination.limit)}
            onPageChange={handlePageChange}
            pageSize={pagination.limit}
            totalItems={pagination.total}
            onPageSizeChange={handlePageSizeChange}
            className="mt-4"
          />
        </>
      )}

      <BatchToolbar />
    </div>
  );
} 