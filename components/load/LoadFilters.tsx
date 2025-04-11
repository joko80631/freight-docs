'use client';

import React from 'react';
import { useLoadStore } from '@/store/loadStore';
import { useTeamStore } from '@/store/team-store';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { type LoadStatus } from '@/types/database';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl } from '@/components/ui/form-control';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const LOAD_STATUSES = ['pending', 'active', 'completed'] as const;
const LOAD_STATUS_LABELS = {
  pending: 'Pending',
  active: 'Active',
  completed: 'Completed',
} as const;

interface Filters {
  status?: LoadStatus;
  search?: string;
}

export default function LoadFilters() {
  const { filters, setFilters, fetchLoads } = useLoadStore();
  const { currentTeam } = useTeamStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters from URL params
  useEffect(() => {
    if (!searchParams) return;
    const status = searchParams.get('status') as LoadStatus | null;
    const search = searchParams.get('search') || '';
    setFilters({ status: status || undefined, search });
  }, [searchParams, setFilters]);

  const handleFilterChange = (key: 'status' | 'search', value: string) => {
    const newFilters: Filters = { ...filters };
    if (key === 'status') {
      newFilters.status = (value || undefined) as LoadStatus | undefined;
    } else {
      newFilters.search = value;
    }
    setFilters(newFilters);

    // Update URL params
    if (!searchParams) return;
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`/loads?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({});
    router.replace('/loads');
  };

  useEffect(() => {
    if (currentTeam?.id) {
      fetchLoads(currentTeam.id);
    }
  }, [currentTeam?.id, filters, fetchLoads]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <FormControl label="Search">
        <Input
          type="text"
          value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          placeholder="Search loads..."
        />
      </FormControl>

      {/* Status Filter */}
      <FormControl label="Status">
        <Select
          value={filters.status || ''}
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            {LOAD_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {LOAD_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormControl>

      {/* Active Filters */}
      {(filters.status || filters.search) && (
        <div className="flex flex-wrap gap-2">
          {filters.status && (
            <div className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
              <span>Status: {LOAD_STATUS_LABELS[filters.status]}</span>
              <button
                onClick={() => handleFilterChange('status', '')}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {filters.search && (
            <div className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
              <span>Search: {filters.search}</span>
              <button
                onClick={() => handleFilterChange('search', '')}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Clear All Filters */}
      {(filters.status || filters.search) && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="w-full"
        >
          Clear All Filters
        </Button>
      )}
    </div>
  );
} 