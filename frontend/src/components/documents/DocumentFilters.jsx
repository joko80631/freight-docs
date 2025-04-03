'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Search } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';

const DOCUMENT_TYPES = [
  'Bill of Lading',
  'Commercial Invoice',
  'Packing List',
  'Certificate of Origin',
  'Other',
];

const CONFIDENCE_LEVELS = [
  { label: 'High (≥80%)', value: 'high' },
  { label: 'Medium (≥60%)', value: 'medium' },
  { label: 'Low (<60%)', value: 'low' },
];

const LOAD_STATUSES = [
  { label: 'Linked', value: 'linked' },
  { label: 'Unlinked', value: 'unlinked' },
];

export default function DocumentFilters({ filters, onFilterChange }) {
  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handleClearFilters = () => {
    onFilterChange({
      documentType: '',
      confidence: '',
      loadStatus: '',
      dateFrom: '',
      dateTo: '',
      search: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== '');

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={filters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <Select
          value={filters.documentType}
          onValueChange={(value) => handleChange('documentType', value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Document Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            {DOCUMENT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.confidence}
          onValueChange={(value) => handleChange('confidence', value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Confidence" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Levels</SelectItem>
            {CONFIDENCE_LEVELS.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.loadStatus}
          onValueChange={(value) => handleChange('loadStatus', value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Load Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            {LOAD_STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full sm:w-[180px] justify-start text-left font-normal',
                !filters.dateFrom && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateFrom ? (
                format(new Date(filters.dateFrom), 'PPP')
              ) : (
                <span>From Date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
              onSelect={(date) =>
                handleChange('dateFrom', date ? date.toISOString() : '')
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full sm:w-[180px] justify-start text-left font-normal',
                !filters.dateTo && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateTo ? (
                format(new Date(filters.dateTo), 'PPP')
              ) : (
                <span>To Date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filters.dateTo ? new Date(filters.dateTo) : undefined}
              onSelect={(date) =>
                handleChange('dateTo', date ? date.toISOString() : '')
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearFilters}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear filters</span>
          </Button>
        )}
      </div>
    </div>
  );
} 