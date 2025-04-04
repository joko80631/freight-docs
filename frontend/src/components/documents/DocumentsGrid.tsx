'use client';

import React from 'react';
import { DocumentPreview } from './DocumentPreview';
import { Document } from '@/types/document';
import { Button } from '@/components/ui/button';

interface DocumentsGridProps {
  documents: Document[];
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onDocumentClick: (document: Document) => void;
  onDocumentDelete?: (id: string) => void;
  onDocumentDownload?: (id: string) => void;
  onViewLoad?: (loadId: string) => void;
}

export function DocumentsGrid({
  documents,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onDocumentClick,
  onDocumentDelete,
  onDocumentDownload,
  onViewLoad
}: DocumentsGridProps) {
  const totalPages = Math.ceil(totalCount / pageSize);
  
  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-medium">No documents found</p>
        <p className="text-sm text-neutral-500 mt-1">
          Try adjusting your filters or upload a new document.
        </p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {documents.map((document) => (
          <DocumentPreview
            key={document.id}
            document={document}
            onDelete={onDocumentDelete}
            onDownload={onDocumentDownload}
            onViewLoad={onViewLoad}
          />
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-neutral-500">
            Showing {page * pageSize + 1}-{Math.min((page + 1) * pageSize, totalCount)} of {totalCount} documents
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 