'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useTeamStore } from '@/store/teamStore';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function LinkToLoadModal({
  open,
  onOpenChange,
  onLink,
  isLoading,
  isBatch = false,
  document = null,
}) {
  const { currentTeam } = useTeamStore();
  const [loads, setLoads] = useState([]);
  const [selectedLoad, setSelectedLoad] = useState('');
  const [isLoadingLoads, setIsLoadingLoads] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalLoads, setTotalLoads] = useState(0);
  const { toast } = useToast();

  const PAGE_SIZE = 10;

  useEffect(() => {
    if (open && currentTeam?.id) {
      fetchLoads();
    }
  }, [open, currentTeam?.id, page, searchQuery]);

  const fetchLoads = async () => {
    setIsLoadingLoads(true);
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: PAGE_SIZE.toString(),
      });
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      const response = await fetch(`/api/teams/${currentTeam.id}/loads?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch loads');
      }
      const data = await response.json();
      
      // If it's the first page, replace the loads
      // Otherwise, append to the existing loads
      if (page === 1) {
        setLoads(data.loads);
      } else {
        setLoads(prev => [...prev, ...data.loads]);
      }
      
      setHasMore(data.loads.length === PAGE_SIZE);
      setTotalLoads(data.total);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch loads',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingLoads(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLoads();
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleLink = () => {
    if (!selectedLoad) return;
    onLink(selectedLoad);
    setSelectedLoad('');
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedLoad('');
    setSearchQuery('');
    setPage(1);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isBatch ? 'Link Documents to Load' : 'Link Document to Load'}
          </DialogTitle>
          <DialogDescription>
            {isBatch
              ? 'Select a load to link the selected documents to.'
              : `Link "${document?.name}" to a load.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <Input
              placeholder="Search loads by reference, client, or destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon" variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {loads.length === 0 && !isLoadingLoads ? (
              <div className="text-center py-4 text-muted-foreground">
                No loads found
              </div>
            ) : (
              <Select
                value={selectedLoad}
                onValueChange={setSelectedLoad}
                disabled={isLoadingLoads}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a load" />
                </SelectTrigger>
                <SelectContent>
                  {loads.map((load) => (
                    <SelectItem key={load.id} value={load.id}>
                      Load #{load.reference_number} - {load.origin} to {load.destination}
                    </SelectItem>
                  ))}
                  
                  {hasMore && (
                    <div className="flex justify-center py-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLoadMore}
                        disabled={isLoadingLoads}
                        className="w-full"
                      >
                        {isLoadingLoads ? 'Loading...' : 'Load More'}
                      </Button>
                    </div>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Display total match count */}
          {totalLoads > 0 && (
            <div className="text-sm text-muted-foreground text-center">
              Showing {loads.length} of {totalLoads} matching loads
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleLink}
              disabled={!selectedLoad || isLoading}
            >
              {isLoading ? 'Linking...' : 'Link'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
} 