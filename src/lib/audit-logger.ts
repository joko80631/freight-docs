import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
    }
  }
);

interface AuditLogParams {
  action: string;
  documentIds?: string[];
  teamId: string;
  userId: string;
  metadata?: Record<string, any>;
}

export async function createAuditLog({
  action,
  documentIds = [],
  teamId,
  userId,
  metadata = {}
}: AuditLogParams) {
  try {
    const { error } = await supabaseAdmin
      .from('audit_logs')
      .insert({
        action,
        document_ids: documentIds,
        team_id: teamId,
        user_id: userId,
        metadata,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Audit log creation failed:', error);
      // Don't throw - audit logging should never block main operations
    }
  } catch (err) {
    console.error('Unexpected error in audit logging:', err);
    // Don't throw - audit logging should never block main operations
  }
} 