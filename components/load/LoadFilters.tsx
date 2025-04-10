'use client';

import { useLoadStore } from '@/src/store/loadStore';
import { useTeamStore } from '@/src/store/team-store';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LOAD_STATUSES, LOAD_STATUS_LABELS, type LoadStatus } from '@/src/constants/loads';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl } from '@/components/ui/form-control';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function LoadFilters() {
  const { filters, setFilters, fetchLoads } = useLoadStore();
  const { currentTeam } = useTeamStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters from URL params
  useEffect(() => {
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';
    setFilters({ status, search });
  }, [searchParams, setFilters]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Update URL params
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
              <span>Status: {LOAD_STATUS_LABELS[filters.status as LoadStatus]}</span>
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