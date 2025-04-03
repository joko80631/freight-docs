import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { X } from 'lucide-react';
import { format } from 'date-fns';

export default function FilterSummaryBar({ filters, onFilterChange, totalItems, filteredItems }) {
  const hasActiveFilters = Object.values(filters).some(value => 
    value !== null && value !== undefined && value !== ''
  );

  const clearAllFilters = () => {
    onFilterChange({
      documentType: null,
      confidenceLevel: null,
      loadStatus: null,
      dateRange: null,
      search: '',
    });
  };

  const removeFilter = (key) => {
    onFilterChange({
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
        {filters.documentType && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Type: {filters.documentType}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => removeFilter('documentType')}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
        {filters.confidenceLevel && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Confidence: {filters.confidenceLevel}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => removeFilter('confidenceLevel')}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
        {filters.loadStatus && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Load Status: {filters.loadStatus}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => removeFilter('loadStatus')}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
        {filters.dateRange && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Date: {filters.dateRange}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => removeFilter('dateRange')}
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