'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
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
import { Loader2, Search, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useTeamStore } from '@/store/team-store';
import { Document } from '@/types/document';
import { getErrorMessage } from '@/lib/errors';
import { safeArray } from '@/lib/array-utils';

interface LinkToLoadModalProps {
  document: Document;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedDocument: Document) => void;
}

export function LinkToLoadModal({
  document,
  isOpen,
  onClose,
  onSuccess
}: LinkToLoadModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ id: string; reference_number: string }>>([]);
  const [selectedLoadId, setSelectedLoadId] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const { toast } = useToast();
  const { currentTeam } = useTeamStore();
  
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setSelectedLoadId(null);
    }
  }, [isOpen]);
  
  const handleSearch = async () => {
    if (!searchQuery.trim() || !currentTeam?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('loads')
        .select('id, reference_number')
        .eq('team_id', currentTeam.id)
        .ilike('reference_number', `%${searchQuery}%`)
        .limit(10);
        
      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching loads:', error);
      toast({
        title: 'Error',
        description: 'Failed to search loads. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLinkLoad = async () => {
    if (!selectedLoadId) return;
    
    setIsLinking(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .update({ load_id: selectedLoadId })
        .eq('id', document.id)
        .select('*, loads:load_id(id, reference_number)')
        .single();
        
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Document linked to load successfully.'
      });
      
      onSuccess(data);
      onClose();
    } catch (error) {
      console.error('Error linking load:', error);
      toast({
        title: 'Error',
        description: 'Failed to link load. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLinking(false);
    }
  };
  
  const handleUnlinkLoad = async () => {
    setIsUnlinking(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .update({ load_id: null })
        .eq('id', document.id)
        .select('*, loads:load_id(id, reference_number)')
        .single();
        
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Document unlinked from load successfully.'
      });
      
      onSuccess(data);
      onClose();
    } catch (error) {
      console.error('Error unlinking load:', error);
      toast({
        title: 'Error',
        description: 'Failed to unlink load. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUnlinking(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Link to Load</DialogTitle>
          <DialogDescription>
            {document.loads && (
              <div className="mb-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">
                    Currently linked to Load #{document.loads?.reference_number || document.load_id}
                  </p>
                  {document.loads && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Load #{document.loads.reference_number}
                    </p>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="mt-2"
                    onClick={() => handleUnlinkLoad()}
                  >
                    Unlink Load
                  </Button>
                </div>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search loads by reference number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searchQuery && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Search'
              )}
            </Button>
          </div>
          
          {searchResults.length > 0 ? (
            <div className="space-y-2">
              {searchResults.map((load) => (
                <button
                  key={load.id}
                  className={`w-full p-3 text-left rounded-lg border transition-colors ${
                    selectedLoadId === load.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedLoadId(load.id)}
                >
                  <p className="font-medium">Load #{load.reference_number}</p>
                </button>
              ))}
            </div>
          ) : searchQuery && !isLoading ? (
            <p className="text-center text-muted-foreground py-8">
              No loads found matching your search.
            </p>
          ) : null}
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleLinkLoad}
              disabled={!selectedLoadId || isLinking}
            >
              {isLinking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Linking...
                </>
              ) : (
                'Link to Load'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 