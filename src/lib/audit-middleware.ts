import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createAuditLog } from './audit-logger';
import { getTeamId } from './auth';

interface AuditMiddlewareOptions {
  action: string;
  getContext: (request: Request) => Promise<Record<string, any>>;
}

export function withAuditLogging(
  handler: (request: Request) => Promise<NextResponse>,
  options: AuditMiddlewareOptions
) {
  return async (request: Request) => {
    const supabase = createRouteHandlerClient({ cookies });
    
    try {
      // Get user and team info
      const { data: { user } } = await supabase.auth.getUser();
      const teamId = await getTeamId(supabase);
      
      if (!user || !teamId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      // Get additional context from the request
      const context = await options.getContext(request);
      
      // Execute the handler
      const response = await handler(request);
      
      // Create audit log
      await createAuditLog(supabase, options.action, {
        userId: user.id,
        teamId,
        ...context
      });
      
      return response;
    } catch (error) {
      console.error('Error in audit middleware:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
} 