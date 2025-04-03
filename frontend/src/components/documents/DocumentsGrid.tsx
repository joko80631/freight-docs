'use client';

import { DocumentPreview } from './DocumentPreview';
import { FreightCard } from '@/components/freight/FreightCard';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Document } from '@/types/document';

export interface DocumentsGridProps {
  documents: Document[];
  isLoading: boolean;
  onDocumentClick: (document: Document) => void;
  onLoadMore: () => void;
  hasMore: boolean;
}

export default function DocumentsGrid({
  documents,
  isLoading,
  onDocumentClick,
  onLoadMore,
  hasMore,
}: DocumentsGridProps) {
  if (isLoading && documents.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <FreightCard variant="bordered">
        <div className="p-8 text-center">
          <h3 className="mb-2 text-lg font-medium">No Documents Found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or upload a new document.
          </p>
        </div>
      </FreightCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {documents.map((document) => (
          <DocumentPreview
            key={document.id}
            document={document}
            onClick={() => onDocumentClick(document)}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  );
} 