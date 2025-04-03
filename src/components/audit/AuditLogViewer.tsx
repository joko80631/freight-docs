'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useTeamStore } from '@/store/team-store';
import { format } from 'date-fns';
import { 
  Upload, FileType, RefreshCw, User, Calendar, Info,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AuditLogViewerProps {
  documentId?: string; // Optional, to filter logs for a specific document
  limit?: number;
  page?: number;
  onPageChange?: (page: number) => void;
}

export function AuditLogViewer({ 
  documentId, 
  limit = 50,
  page = 1,
  onPageChange
}: AuditLogViewerProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const { currentTeam } = useTeamStore();
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    const fetchAuditLogs = async () => {
      if (!currentTeam?.id) return;
      
      setIsLoading(true);
      try {
        // Calculate offset for pagination
        const offset = (page - 1) * limit;
        
        // First, get total count
        let countQuery = supabase
          .from('audit_logs')
          .select('id', { count: 'exact', head: true })
          .eq('team_id', currentTeam.id);
        
        if (documentId) {
          countQuery = countQuery.contains('document_ids', [documentId]);
        }
        
        const { count } = await countQuery;
        setTotalCount(count || 0);
        
        // Then fetch paginated data
        let query = supabase
          .from('audit_logs')
          .select(`
            *,
            users:user_id(email, display_name)
          `)
          .eq('team_id', currentTeam.id)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);
        
        if (documentId) {
          query = query.contains('document_ids', [documentId]);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        setLogs(data || []);
      } catch (error) {
        console.error('Error fetching audit logs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAuditLogs();
  }, [currentTeam?.id, documentId, limit, page, supabase]);
  
  const totalPages = Math.ceil(totalCount / limit);
  
  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }
  
  if (logs.length === 0) {
    return (
      <div className="text-center p-4 bg-slate-50 rounded-md">
        <Info className="h-6 w-6 text-slate-400 mx-auto mb-2" />
        <p className="text-sm text-slate-500">No audit logs found</p>
      </div>
    );
  }
  
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'upload_document':
        return <Upload className="h-4 w-4" />;
      case 'classify_document':
        return <FileType className="h-4 w-4" />;
      case 'reclassify_document':
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };
  
  const formatActionName = (action: string) => {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  return (
    <div>
      <div className="overflow-hidden rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="px-4 py-2 text-left font-medium">Action</th>
              <th className="px-4 py-2 text-left font-medium">User</th>
              <th className="px-4 py-2 text-left font-medium">Date & Time</th>
              <th className="px-4 py-2 text-left font-medium">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <span className="p-1 bg-primary/10 rounded">
                      {getActionIcon(log.action)}
                    </span>
                    <span>{formatActionName(log.action)}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <span>{log.users?.display_name || log.users?.email || log.user_id}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>{format(new Date(log.created_at), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="max-w-xs truncate">
                    {log.metadata && Object.keys(log.metadata).length > 0 ? (
                      <pre className="text-xs bg-slate-50 p-1 rounded overflow-x-auto">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    ) : (
                      <span className="text-slate-400 text-xs">No additional details</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(page + 1)}
            disabled={page === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
} 