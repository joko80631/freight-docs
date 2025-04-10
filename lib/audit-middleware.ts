import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { AuditAction } from './audit-constants';

interface AuditMetadata {
  [key: string]: any;
}

interface AuditOptions {
  action: AuditAction;
  getDocumentIds?: (body: any) => string[];
  getMetadata?: (body: any, result: any) => AuditMetadata;
}

export function withAuditLogging(
  handler: (request: Request, context: { userId: string; teamId: string }) => Promise<NextResponse>,
  options: AuditOptions
) {
  return async (request: Request) => {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's team
    const { data: userTeam } = await supabase
      .from('user_teams')
      .select('team_id')
      .eq('user_id', session.user.id)
      .single();

    if (!userTeam) {
      return NextResponse.json({ error: 'No team found' }, { status: 403 });
    }

    // Execute the handler
    const result = await handler(request, {
      userId: session.user.id,
      teamId: userTeam.team_id
    });

    // Parse request body for audit
    const body = await request.json();
    const responseData = await result.json();

    // Create audit log
    await supabase.from('audit_logs').insert({
      user_id: session.user.id,
      team_id: userTeam.team_id,
      action: options.action,
      document_ids: options.getDocumentIds?.(body) || [],
      metadata: options.getMetadata?.(body, responseData) || {},
      created_at: new Date().toISOString()
    });

    // Return the original response
    return NextResponse.json(responseData, { status: result.status });
  };
} 