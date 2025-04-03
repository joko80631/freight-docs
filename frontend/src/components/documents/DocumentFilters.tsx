'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { Document } from '@/types/document';

export interface DocumentFiltersProps {
  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onStatusChange: (value: Document['status'] | '') => void;
  onClearFilters: () => void;
  searchValue: string;
  typeValue: string;
  statusValue: Document['status'] | '';
}

export function DocumentFilters({
  onSearchChange,
  onTypeChange,
  onStatusChange,
  onClearFilters,
  searchValue,
  typeValue,
  statusValue,
}: DocumentFiltersProps) {
  const [searchInput, setSearchInput] = useState(searchValue);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    onSearchChange(value);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    onSearchChange('');
  };

  const hasActiveFilters = searchValue || typeValue || statusValue;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search documents..."
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
        {searchInput && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={handleClearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Select value={typeValue} onValueChange={onTypeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Document Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Types</SelectItem>
          <SelectItem value="invoice">Invoice</SelectItem>
          <SelectItem value="bill_of_lading">Bill of Lading</SelectItem>
          <SelectItem value="proof_of_delivery">Proof of Delivery</SelectItem>
        </SelectContent>
      </Select>

      <Select value={statusValue} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="processed">Processed</SelectItem>
          <SelectItem value="error">Error</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="whitespace-nowrap"
        >
          Clear Filters
        </Button>
      )}
    </div>
  );
} 