import { SupabaseClient } from '@supabase/supabase-js';

export interface AuditLogContext {
  documentId?: string;
  userId?: string;
  teamId?: string;
  [key: string]: any;
}

export interface AuditLogEntry {
  action: string;
  document_id?: string;
  user_id?: string;
  team_id?: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

export async function createAuditLog(
  supabase: SupabaseClient,
  action: string,
  context: AuditLogContext
): Promise<void> {
  try {
    const { documentId, userId, teamId, ...metadata } = context;
    
    const entry: AuditLogEntry = {
      action,
      document_id: documentId,
      user_id: userId,
      team_id: teamId,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      created_at: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('audit_logs')
      .insert(entry);
      
    if (error) {
      console.error('Failed to create audit log:', error);
    }
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
} 