import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createAuditLog } from '@/lib/audit-logger';
import { AuditAction } from '@/lib/audit-constants';

export interface AuditConfig {
  action: AuditAction;
  getDocumentIds?: (body: any, result?: any) => string[];
  getMetadata?: (body: any, result?: any, request?: NextRequest) => Record<string, any>;
}

export function withAuditLogging(handler: Function, config: AuditConfig) {
  return async (request: NextRequest) => {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    try {
      // Parse request body
      const body = await request.json();
      
      // Get current team ID
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', userId)
        .single();
      
      if (!teamMember) {
        return NextResponse.json({ error: 'No team found' }, { status: 400 });
      }
      
      // Pass the original request to the handler
      const result = await handler(request, { userId, teamId: teamMember.team_id });
      
      // Create audit log entry
      const documentIds = config.getDocumentIds ? config.getDocumentIds(body, result) : [];
      const metadata = {
        path: request.nextUrl.pathname,
        ...(config.getMetadata ? config.getMetadata(body, result, request) : {})
      };
      
      await createAuditLog({
        action: config.action,
        documentIds,
        teamId: teamMember.team_id,
        userId,
        metadata
      });
      
      return result;
    } catch (error) {
      console.error('Error in audit middleware:', error);
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  };
} 