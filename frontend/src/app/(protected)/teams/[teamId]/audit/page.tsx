import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface AuditLog {
  id: string;
  team_id: string;
  user_id: string;
  action: string;
  details: Record<string, any>;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

interface TeamAuditPageProps {
  params: {
    teamId: string;
  };
}

export default async function TeamAuditPage({ params }: TeamAuditPageProps) {
  const supabase = createServerComponentClient({ cookies });

  // Verify team access
  const { data: teamAccess } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', params.teamId)
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!teamAccess || teamAccess.role !== 'ADMIN') {
    notFound();
  }

  // Fetch audit logs
  const { data: logs } = await supabase
    .from('team_audit_logs')
    .select(`
      id,
      team_id,
      user_id,
      action,
      details,
      created_at,
      profiles:user_id (
        full_name,
        email
      )
    `)
    .eq('team_id', params.teamId)
    .order('created_at', { ascending: false })
    .returns<AuditLog[]>();

  const formatAction = (action: string, details: Record<string, any>) => {
    switch (action) {
      case 'team_created':
        return 'Created team';
      case 'team_updated':
        return `Updated team name from "${details.old_name}" to "${details.new_name}"`;
      case 'team_deleted':
        return 'Deleted team';
      case 'member_added':
        return `Added member with role ${details.role}`;
      case 'member_updated':
        return `Changed member role from ${details.old_role} to ${details.new_role}`;
      case 'member_removed':
        return `Removed member with role ${details.role}`;
      default:
        return action;
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">
          View a history of changes made to your team.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
          <CardDescription>
            A chronological list of all changes made to your team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {logs?.map((log) => (
              <div key={log.id} className="flex gap-4">
                <div className="relative">
                  <div className="absolute left-2 top-2 h-2 w-2 rounded-full bg-primary" />
                  <div className="absolute left-2.5 top-4 h-full w-px bg-border" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm leading-none">
                    <span className="font-medium">{log.profiles.full_name}</span>{' '}
                    <span className="text-muted-foreground">
                      {formatAction(log.action, log.details)}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(log.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            ))}

            {(!logs || logs.length === 0) && (
              <p className="text-center text-sm text-muted-foreground py-4">
                No audit logs found
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 