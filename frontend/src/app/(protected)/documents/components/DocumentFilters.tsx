'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTeamStore } from '@/store/team-store';
import { Button } from '@/components/ui/button';

interface DocumentFiltersProps {
  onFilterChange: (filters: {
    type?: string;
    confidence?: number;
    loadId?: string;
  }) => void;
}

export function DocumentFilters({ onFilterChange }: DocumentFiltersProps) {
  const [type, setType] = useState<string>('');
  const [confidence, setConfidence] = useState<number | null>(null);
  const [loadId, setLoadId] = useState<string>('');
  const supabase = createClientComponentClient();
  const [loads, setLoads] = useState<Array<{ id: string; reference_number: string }>>([]);
  const { currentTeam } = useTeamStore();
  
  useEffect(() => {
    const fetchLoads = async () => {
      if (!currentTeam?.id) return;
      
      const { data } = await supabase
        .from('loads')
        .select('id, reference_number')
        .eq('team_id', currentTeam.id)
        .order('created_at', { ascending: false });
        
      if (data) {
        setLoads(data);
      }
    };
    
    fetchLoads();
  }, [currentTeam?.id, supabase]);
  
  const handleFilterChange = () => {
    onFilterChange({
      type: type || undefined,
      confidence: confidence || undefined,
      loadId: loadId || undefined
    });
  };
  
  const handleReset = () => {
    setType('');
    setConfidence(null);
    setLoadId('');
    onFilterChange({});
  };
  
  return (
    <div className="bg-slate-50 p-4 rounded-lg mb-6">
      <h3 className="font-medium mb-2">Filters</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Document Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 block w-full p-2 border rounded-md"
          >
            <option value="">All Types</option>
            <option value="bol">BOL</option>
            <option value="pod">POD</option>
            <option value="invoice">Invoice</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium">Confidence</label>
          <select
            value={confidence?.toString() || ''}
            onChange={(e) => setConfidence(e.target.value ? Number(e.target.value) : null)}
            className="mt-1 block w-full p-2 border rounded-md"
          >
            <option value="">Any Confidence</option>
            <option value="0.85">High (85%+)</option>
            <option value="0.6">Medium (60%+)</option>
            <option value="0">Low (All)</option>
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium">Linked Load</label>
          <select
            value={loadId}
            onChange={(e) => setLoadId(e.target.value)}
            className="mt-1 block w-full p-2 border rounded-md"
          >
            <option value="">Any Load</option>
            {loads.map((load) => (
              <option key={load.id} value={load.id}>
                {load.reference_number}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex justify-end mt-4 space-x-2">
        <Button variant="outline" onClick={handleReset}>
          Reset
        </Button>
        <Button onClick={handleFilterChange}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
} 