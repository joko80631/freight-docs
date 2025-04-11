'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Search, X } from 'lucide-react';
import { useLoadStore } from '@/store/loadStore';
import { toast } from 'sonner';
import { useDocumentStore } from '@/store/documentStore';
import { Document } from '@/types/database';
import { useTeamStore } from '@/store/team-store';

interface LoadSelectorProps {
  document: Document;
  onClose: () => void;
}

export function LoadSelector({ document, onClose }: LoadSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const { loads, isLoading, error, fetchLoads, linkDocumentToLoad, unlinkDocumentFromLoad } = useLoadStore();
  const { fetchDocuments } = useDocumentStore();
  const { currentTeam } = useTeamStore();

  useEffect(() => {
    if (currentTeam?.id) {
      fetchLoads(currentTeam.id);
    }
  }, [currentTeam?.id, fetchLoads]);

  const handleLink = async (loadId: string) => {
    if (!currentTeam?.id) {
      toast.error('No team selected');
      return;
    }

    setIsLinking(true);
    try {
      await linkDocumentToLoad(document.id, loadId);
      await fetchDocuments(currentTeam.id);
      toast.success('Document linked to load successfully');
      onClose();
    } catch (error) {
      console.error('Link error:', error);
      toast.error('Failed to link document to load');
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlink = async () => {
    if (!document.load_id || !currentTeam?.id) return;
    
    setIsUnlinking(true);
    try {
      await unlinkDocumentFromLoad(document.id);
      await fetchDocuments(currentTeam.id);
      toast.success('Document unlinked from load successfully');
      onClose();
    } catch (error) {
      console.error('Unlink error:', error);
      toast.error('Failed to unlink document from load');
    } finally {
      setIsUnlinking(false);
    }
  };

  const filteredLoads = loads.filter(load => 
    load.reference_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    load.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    load.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <Button variant="outline" onClick={() => fetchLoads(currentTeam?.id || '')}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Link to Load</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {document.load_id ? (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            This document is currently linked to a load. Would you like to unlink it?
          </p>
          <Button 
            variant="destructive" 
            onClick={handleUnlink}
            disabled={isUnlinking}
          >
            {isUnlinking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Unlinking...
              </>
            ) : (
              'Unlink from Load'
            )}
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="search">Search Loads</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by reference number, origin, or destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredLoads.length === 0 ? (
            <p className="text-sm text-muted-foreground">No loads found</p>
          ) : (
            <div className="space-y-2">
              {filteredLoads.map((load) => (
                <Button
                  key={load.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleLink(load.id)}
                  disabled={isLinking}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{load.reference_number}</span>
                    <span className="text-sm text-muted-foreground">
                      {load.origin} → {load.destination}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
} 