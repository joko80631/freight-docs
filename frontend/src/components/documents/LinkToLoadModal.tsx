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
import { Loader2, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useTeamStore } from '@/store/teamStore';
import { Document } from '@/types/document';
import { getErrorMessage } from '@/lib/errors';
import { safeArray } from '@/lib/utils';

interface LinkToLoadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document;
  onLinkComplete: (updatedDoc: Document) => void;
}

interface Load {
  id: string;
  reference_number?: string;
  origin: string;
  destination: string;
}

export function LinkToLoadModal({ 
  open, 
  onOpenChange, 
  document, 
  onLinkComplete 
}: LinkToLoadModalProps) {
  const [loads, setLoads] = useState<Load[]>([]);
  const [selectedLoad, setSelectedLoad] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { currentTeam } = useTeamStore();
  const { toast } = useToast();

  useEffect(() => {
    if (open && currentTeam?.id) {
      fetchLoads();
    }
  }, [open, currentTeam?.id, searchTerm]);

  const fetchLoads = async () => {
    if (!currentTeam?.id) {
      toast({
        title: 'Error',
        description: 'No team selected',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Build query with optional search
      let url = `/api/teams/${currentTeam.id}/loads`;
      if (searchTerm) {
        url += `?search=${encodeURIComponent(searchTerm)}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch loads');
      }
      
      const data = await response.json();
      setLoads(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: getErrorMessage(error),
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
          load_id: selectedLoad,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to link document to load');
      }
      
      const updatedDocument = await response.json();
      
      toast({
        title: 'Success',
        description: 'Document linked to load successfully',
      });
      
      onLinkComplete(updatedDocument);
    } catch (error) {
      toast({
        title: 'Error',
        description: getErrorMessage(error),
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
        throw new Error('Failed to unlink document from load');
      }
      
      const updatedDocument = await response.json();
      
      toast({
        title: 'Success',
        description: 'Document unlinked from load successfully',
      });
      
      onLinkComplete(updatedDocument);
    } catch (error) {
      toast({
        title: 'Error',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {document.load_id ? 'Unlink from Load' : 'Link to Load'}
          </DialogTitle>
          <DialogDescription>
            {document.load_id
              ? 'Remove this document from its associated load'
              : 'Select a load to link this document to'}
          </DialogDescription>
        </DialogHeader>

        {document.load_id ? (
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium">
                Currently linked to Load #{document.load?.reference_number || document.load_id}
              </p>
              {document.load && (
                <p className="text-sm text-muted-foreground mt-1">
                  {document.load.origin} → {document.load.destination}
                </p>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive"
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
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search loads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="max-h-[300px] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : loads.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No loads found
                </div>
              ) : (
                <Select value={selectedLoad} onValueChange={setSelectedLoad}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a load" />
                  </SelectTrigger>
                  <SelectContent>
                    {safeArray(loads).map((load) => (
                      <SelectItem key={load.id} value={load.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            Load #{load.reference_number || load.id}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {load.origin} → {load.destination}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
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
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 