'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTeamStore } from '@/store/team-store';
import { FreightCard } from '@/components/freight/FreightCard';
import { FreightTable } from '@/components/freight/FreightTable';
import { FreightBadge } from '@/components/freight/FreightBadge';
import { FreightButton } from '@/components/freight/FreightButton';
import { Search, Filter, ChevronDown } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Load['status'] | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const supabase = createClientComponentClient();
  const { currentTeam } = useTeamStore();

  useEffect(() => {
    fetchLoads();
  }, [currentTeam?.id, currentPage, statusFilter]);

  const fetchLoads = async () => {
    if (!currentTeam?.id) return;

    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
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
      cell: (value: string) => (
        <FreightBadge variant={value as 'success' | 'warning' | 'error'}>
          {value}
        </FreightBadge>
      ),
    },
    {
      header: 'Created',
      accessorKey: 'created_at' as keyof Load,
      cell: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      header: 'Updated',
      accessorKey: 'updated_at' as keyof Load,
      cell: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6" data-testid="loads-page" data-debug="layout">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4" data-testid="loads-header">
        <h1 className="text-xl font-semibold text-gray-900">Loads</h1>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
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
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>
      </div>

      <FreightCard>
        <FreightTable
          data={loads}
          columns={columns}
          isLoading={isLoading}
          data-testid="loads-table"
        />
      </FreightCard>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6" data-testid="loads-pagination">
          <FreightButton
            variant="secondary"
            size="small"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            data-testid="loads-pagination-first"
          >
            First
          </FreightButton>
          <FreightButton
            variant="secondary"
            size="small"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            data-testid="loads-pagination-prev"
          >
            Previous
          </FreightButton>
          {getPageNumbers().map((page) => (
            <FreightButton
              key={page}
              variant={currentPage === page ? 'primary' : 'secondary'}
              size="small"
              onClick={() => setCurrentPage(page)}
              data-testid={`loads-pagination-page-${page}`}
            >
              {page}
            </FreightButton>
          ))}
          <FreightButton
            variant="secondary"
            size="small"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            data-testid="loads-pagination-next"
          >
            Next
          </FreightButton>
          <FreightButton
            variant="secondary"
            size="small"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            data-testid="loads-pagination-last"
          >
            Last
          </FreightButton>
        </div>
      )}
    </div>
  );
} 