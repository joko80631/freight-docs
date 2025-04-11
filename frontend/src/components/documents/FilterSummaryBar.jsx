import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { useDocumentStore } from '@/store/documentStore';

export default function FilterSummaryBar({ totalItems, filteredItems }) {
  const { filters, setFilters } = useDocumentStore();
  
  const hasActiveFilters = Object.values(filters).some(value => 
    value !== null && value !== undefined && value !== ''
  );

  const clearAllFilters = () => {
    setFilters({
      document_type: null,
      classification_confidence: null,
      load_status: null,
      date_from: null,
      date_to: null,
      search: null,
    });
  };

  const removeFilter = (key) => {
    setFilters({
      ...filters,
      [key]: key === 'search' ? '' : null,
    });
  };

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-muted/50 rounded-lg">
      <div className="text-sm text-muted-foreground">
        Showing {filteredItems} of {totalItems} documents
      </div>
      <div className="flex-1" />
      <div className="flex flex-wrap items-center gap-2">
        {filters.document_type && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Type: {filters.document_type}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => removeFilter('document_type')}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
        {filters.classification_confidence && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Confidence: {filters.classification_confidence}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => removeFilter('classification_confidence')}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
        {filters.load_status && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Load Status: {filters.load_status}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => removeFilter('load_status')}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
        {(filters.date_from || filters.date_to) && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Date: {filters.date_from ? format(new Date(filters.date_from), 'MMM d, yyyy') : 'Any'} - {filters.date_to ? format(new Date(filters.date_to), 'MMM d, yyyy') : 'Any'}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => {
                removeFilter('date_from');
                removeFilter('date_to');
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
        {filters.search && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Search: {filters.search}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => removeFilter('search')}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs"
          onClick={clearAllFilters}
        >
          Clear All
        </Button>
      </div>
    </div>
  );
} 