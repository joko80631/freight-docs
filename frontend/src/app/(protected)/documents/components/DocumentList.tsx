'use client';

import React from 'react';
import { FileX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DocumentCard } from './DocumentCard';

interface Document {
  id: string;
  name: string;
  storage_path: string;
  type: string;
  confidence_score: number;
  uploaded_at: string;
  loads?: { id: string; reference_number: string } | null;
}

interface DocumentListProps {
  documents: Document[];
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onViewDocument: (id: string) => void;
}

export function DocumentList({
  documents,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onViewDocument
}: DocumentListProps) {
  const totalPages = Math.ceil(totalCount / pageSize);
  
  if (documents.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <FileX className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium">No documents found</h3>
        <p className="text-slate-500 mt-1">
          Try adjusting your filters or upload a new document.
        </p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {documents.map((doc) => (
          <DocumentCard
            key={doc.id}
            document={doc}
            onViewDetails={onViewDocument}
          />
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-slate-500">
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