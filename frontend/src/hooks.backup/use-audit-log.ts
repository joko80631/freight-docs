import { useTeamStore } from "@/store/team-store";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface AuditLogEntry {
  action: string;
  document_ids: string[];
  metadata?: Record<string, any>;
}

export function useAuditLog() {
  const { currentTeam } = useTeamStore();
  const supabase = createClientComponentClient();

  const logAction = async (entry: AuditLogEntry) => {
    if (!currentTeam?.id) return;

    try {
      const { error } = await supabase.from("audit_logs").insert({
        team_id: currentTeam.id,
        action: entry.action,
        document_ids: entry.document_ids,
        metadata: entry.metadata || {},
        timestamp: new Date().toISOString(),
      });

      if (error) throw error;
    } catch (error) {
      console.error("Audit log error:", error);
      // Don't throw the error to prevent disrupting the user experience
    }
  };

  return { logAction };
} 