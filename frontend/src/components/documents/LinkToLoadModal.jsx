'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Search, Loader2 } from 'lucide-react';

export default function LinkToLoadModal({ open, onOpenChange, document, onLinkComplete }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [loads, setLoads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchLoads();
    }
  }, [open, searchQuery]);

  const fetchLoads = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // First try the search API if it exists
      let response;
      try {
        response = await fetch(`/api/loads/search?q=${encodeURIComponent(searchQuery)}`);
      } catch (e) {
        // Fall back to the team loads API if search doesn't exist
        response = await fetch(`/api/teams/${document.team_id}/loads`);
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch loads');
      }
      
      const data = await response.json();
      
      // If we're using the fallback API, filter client-side
      if (!response.url.includes('/search')) {
        const filteredLoads = data.filter(load => 
          load.reference_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          load.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
          load.destination.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setLoads(filteredLoads);
      } else {
        setLoads(data);
      }
    } catch (error) {
      setError(error.message);
      toast({
        title: 'Error',
        description: 'Failed to fetch loads',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLink = async () => {
    if (!selectedLoad) return;

    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/documents/${document.id}/link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loadId: selectedLoad.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to link document');
      }

      toast({
        title: 'Success',
        description: 'Document linked to load successfully',
      });
      
      onLinkComplete();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to link document to load',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlink = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/documents/${document.id}/unlink`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to unlink document');
      }

      toast({
        title: 'Success',
        description: 'Document unlinked from load successfully',
      });
      
      onLinkComplete();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to unlink document from load',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {document?.load_id ? 'Unlink from Load' : 'Link to Load'}
          </DialogTitle>
          <DialogDescription>
            {document?.load_id
              ? 'Remove this document from its associated load'
              : 'Search and select a load to link this document to'}
          </DialogDescription>
        </DialogHeader>

        {document?.load_id ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Current Load</Label>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{document.load.reference_number}</p>
                <p className="text-sm text-muted-foreground">
                  {document.load.origin} → {document.load.destination}
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleUnlink}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Unlinking...
                </>
              ) : (
                'Unlink Document'
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Search Loads</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Search by reference number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={fetchLoads}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label>Select Load</Label>
              <Select
                value={selectedLoad?.id}
                onValueChange={(value) =>
                  setSelectedLoad(loads.find((load) => load.id === value))
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a load" />
                </SelectTrigger>
                <SelectContent>
                  {loads.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No loads found
                    </div>
                  ) : (
                    loads.map((load) => (
                      <SelectItem key={load.id} value={load.id}>
                        <div className="space-y-1">
                          <p className="font-medium">{load.reference_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {load.origin} → {load.destination}
                          </p>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full"
              onClick={handleLink}
              disabled={!selectedLoad || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Linking...
                </>
              ) : (
                'Link Document'
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 