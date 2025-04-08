'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTeamStore } from '@/store/team-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Filter, Plus, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/PageContainer';
import { EmptyState } from '@/components/ui/empty-state';
import { FreightTable, Column } from '@/components/freight/FreightTable';
import { FreightBadge } from '@/components/freight/FreightBadge';
import { useToast } from '@/components/ui/use-toast';

interface Load {
  id: string;
  reference_number: string;
  carrier_name: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export default function LoadsPage() {
  const [loads, setLoads] = useState<Load[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Load['status'] | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const supabase = createClientComponentClient();
  const { currentTeam } = useTeamStore();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (currentTeam?.id) {
      fetchLoads();
    }
  }, [currentTeam?.id, currentPage, statusFilter, searchQuery]);

  const fetchLoads = async () => {
    if (!currentTeam?.id) return;

    setIsLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('loads')
        .select('*', { count: 'exact' })
        .eq('team_id', currentTeam.id)
        .order('created_at', { ascending: false });

      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      if (searchQuery) {
        query = query.ilike('reference_number', `%${searchQuery}%`);
      }

      const { data, count, error } = await query
        .range((currentPage - 1) * 10, currentPage * 10 - 1);

      if (error) throw error;

      setLoads(data || []);
      setTotalPages(Math.ceil((count || 0) / 10));
    } catch (error) {
      console.error('Error fetching loads:', error);
      setError('Failed to load data. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to load loads',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column<Load>[] = [
    {
      header: 'Reference',
      accessorKey: 'reference_number' as keyof Load,
    },
    {
      header: 'Carrier',
      accessorKey: 'carrier_name' as keyof Load,
    },
    {
      header: 'Status',
      accessorKey: 'status' as keyof Load,
      cell: (value: string | number, row: Load) => (
        <FreightBadge variant={
          value === 'delivered' ? 'success' : 
          value === 'in_transit' ? 'warning' : 
          value === 'cancelled' ? 'error' : 
          'neutral'
        }>
          {value}
        </FreightBadge>
      ),
    },
    {
      header: 'Created',
      accessorKey: 'created_at' as keyof Load,
      cell: (value: string | number, row: Load) => new Date(String(value)).toLocaleDateString(),
    },
    {
      header: 'Updated',
      accessorKey: 'updated_at' as keyof Load,
      cell: (value: string | number, row: Load) => new Date(String(value)).toLocaleDateString(),
    },
  ];

  return (
    <PageContainer
      title="Loads"
      description="Manage your freight loads"
      isLoading={isLoading}
      error={error}
      isEmpty={!isLoading && loads.length === 0}
      emptyState={
        <EmptyState
          icon={Package}
          title="No loads found"
          description="Create your first load to get started tracking your shipments"
          action={{
            label: "Create Load",
            onClick: () => router.push('/loads/new')
          }}
        />
      }
      headerAction={
        <Button onClick={() => router.push('/loads/new')}>
          <Plus className="mr-2 h-4 w-4" /> Create Load
        </Button>
      }
    >
      <Card>
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search loads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
                data-testid="loads-search"
              />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as Load['status'] | '')}
                className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg bg-white"
                data-testid="loads-status-filter"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>
        </div>
        <CardContent className="p-0">
          <FreightTable
            data={loads}
            columns={columns}
            pagination={{
              page: currentPage,
              pageCount: totalPages,
              onPageChange: setCurrentPage
            }}
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
} 