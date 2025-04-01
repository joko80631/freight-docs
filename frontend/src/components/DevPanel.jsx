'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTeamStore } from '@/store/teamStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export function DevPanel() {
  const { teamId, role, teamName } = useTeamStore();
  const [loadCount, setLoadCount] = useState(0);
  const [documentCount, setDocumentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();

  const fetchCounts = async () => {
    if (!teamId) return;
    
    setIsLoading(true);
    try {
      // Get load count
      const { count: loadsCount, error: loadsError } = await supabase
        .from('loads')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', teamId);

      if (loadsError) throw loadsError;
      setLoadCount(loadsCount || 0);

      // Get document count
      const { count: docsCount, error: docsError } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', teamId);

      if (docsError) throw docsError;
      setDocumentCount(docsCount || 0);

      // Log if counts are 0
      if (loadsCount === 0) {
        console.warn('No loads found for team:', teamId);
      }
      if (docsCount === 0) {
        console.warn('No documents found for team:', teamId);
      }
    } catch (error) {
      console.error('Error fetching counts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, [teamId]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 bg-white/90 backdrop-blur-sm shadow-lg">
      <CardHeader className="p-4">
        <CardTitle className="text-sm font-mono">Dev Panel</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <div className="text-xs space-y-1">
          <p><span className="font-mono">Team ID:</span> {teamId || 'None'}</p>
          <p><span className="font-mono">Team Name:</span> {teamName || 'None'}</p>
          <p><span className="font-mono">Role:</span> {role || 'None'}</p>
          <p><span className="font-mono">Loads:</span> {loadCount}</p>
          <p><span className="font-mono">Documents:</span> {documentCount}</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchCounts}
          disabled={isLoading}
          className="w-full"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardContent>
    </Card>
  );
} 