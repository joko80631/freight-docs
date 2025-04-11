'use client';

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTeamStore } from '@/store/team-store';
import { useDocumentStore } from '@/store/documentStore';
import type { DocumentFilters } from '@/store/documentStore';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Calendar } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { showToast } from '@/lib/toast';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export function DocumentFilters() {
  const [loads, setLoads] = React.useState<Array<{ id: string; reference_number: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { currentTeam } = useTeamStore();
  const { filters, setFilters, resetFilters } = useDocumentStore();
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    const fetchLoads = async () => {
      if (!currentTeam?.id) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('loads')
          .select('id, reference_number')
          .eq('team_id', currentTeam.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        if (data) {
          setLoads(data);
        }
      } catch (error) {
        showToast.error('Error', 'Failed to fetch loads');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLoads();
  }, [currentTeam?.id, supabase]);
  
  const handleFilterChange = (field: keyof DocumentFilters, value: string | null) => {
    setFilters({
      ...filters,
      [field]: value,
    });
  };
  
  const handleReset = () => {
    resetFilters();
    showToast.info('Filters Reset', 'All filters have been cleared');
  };
  
  return (
    <div className="bg-slate-50 p-4 rounded-lg mb-6">
      <h3 className="font-medium mb-2">Filters</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-medium">Document Type</Label>
          <Select
            value={filters.document_type ?? ''}
            onValueChange={(value) => handleFilterChange('document_type', value || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="bol">BOL</SelectItem>
              <SelectItem value="pod">POD</SelectItem>
              <SelectItem value="invoice">Invoice</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-sm font-medium">Confidence</Label>
          <Select
            value={filters.classification_confidence ?? ''}
            onValueChange={(value) => handleFilterChange('classification_confidence', value as 'high' | 'medium' | 'low' | null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any Confidence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Confidence</SelectItem>
              <SelectItem value="high">High (85%+)</SelectItem>
              <SelectItem value="medium">Medium (60%+)</SelectItem>
              <SelectItem value="low">Low (All)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-sm font-medium">Status</Label>
          <Select
            value={filters.load_status ?? ''}
            onValueChange={(value) => handleFilterChange('load_status', value as 'linked' | 'unlinked' | null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Status</SelectItem>
              <SelectItem value="linked">Linked</SelectItem>
              <SelectItem value="unlinked">Unlinked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <Label className="text-sm font-medium">Date From</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.date_from && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {filters.date_from ? format(new Date(filters.date_from), "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={filters.date_from ? new Date(filters.date_from) : undefined}
                onSelect={(date) => handleFilterChange('date_from', date ? date.toISOString() : null)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div>
          <Label className="text-sm font-medium">Date To</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.date_to && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {filters.date_to ? format(new Date(filters.date_to), "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={filters.date_to ? new Date(filters.date_to) : undefined}
                onSelect={(date) => handleFilterChange('date_to', date ? date.toISOString() : null)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="mt-4">
        <Label className="text-sm font-medium">Search</Label>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value || null)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="flex justify-end mt-4 space-x-2">
        <Button 
          variant="outline" 
          onClick={handleReset}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            'Reset Filters'
          )}
        </Button>
      </div>
    </div>
  );
} 