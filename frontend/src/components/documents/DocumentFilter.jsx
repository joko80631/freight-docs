import React from 'react';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

const DocumentFilter = ({ 
  filters, 
  onSearchChange, 
  onTypeChange, 
  onStatusChange,
  onLoadChange,
  loads 
}) => {
  const debouncedSearch = useDebounce(filters.search, 300);

  React.useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search documents..."
          value={filters.search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Document Type</label>
          <Select
            value={filters.type.join(',')}
            onValueChange={(value) => onTypeChange(value.split(','))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bill_of_lading">Bill of Lading</SelectItem>
              <SelectItem value="invoice">Invoice</SelectItem>
              <SelectItem value="packing_list">Packing List</SelectItem>
              <SelectItem value="customs_declaration">Customs Declaration</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="classified">Classified</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Associated Load</label>
          <Select
            value={filters.loadId || ''}
            onValueChange={onLoadChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select load" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Loads</SelectItem>
              {loads?.map((load) => (
                <SelectItem key={load.id} value={load.id}>
                  {load.customer_name} - {load.origin} to {load.destination}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default DocumentFilter; 