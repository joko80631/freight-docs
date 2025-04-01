import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Search, Filter, Save } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

const SearchFilterPanel = ({ 
  filters, 
  onSearchChange, 
  onStatusChange, 
  onDateRangeChange,
  onCustomerChange,
  onSaveFilter
}) => {
  const debouncedSearch = useDebounce(filters.search, 300);

  React.useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search loads..."
            value={filters.search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline" onClick={onSaveFilter}>
          <Save className="mr-2 h-4 w-4" />
          Save Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select
            value={filters.status.join(',')}
            onValueChange={(value) => onStatusChange(value.split(','))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Date Range</label>
          <DateRangePicker
            value={filters.dateRange}
            onChange={onDateRangeChange}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Customer</label>
          <Input
            placeholder="Filter by customer"
            value={filters.customer || ''}
            onChange={(e) => onCustomerChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchFilterPanel; 