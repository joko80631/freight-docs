interface EmailActivityLog {
  recipientId: string;
  templateName: string;
  status: 'sent' | 'failed' | 'skipped';
  metadata?: Record<string, any>;
}

interface AuditLogEntry {
  type: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export class AuditLogger {
  private logs: AuditLogEntry[] = [];

  async log(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
    this.logs.push({
      ...entry,
      timestamp: new Date().toISOString(),
    });
  }

  getLogs(): AuditLogEntry[] {
    return this.logs;
  }

  clearLogs(): void {
    this.logs = [];
  }
}

/**
 * Logs email activity for auditing purposes
 */
export async function logEmailActivity({
  recipientId,
  templateName,
  status,
  metadata = {},
}: EmailActivityLog): Promise<void> {
  try {
    // Log to console for development
    console.log('Email Activity:', {
      timestamp: new Date().toISOString(),
      recipientId,
      templateName,
      status,
      metadata,
    });

    // TODO: Add persistent logging (e.g., to database or logging service)
    // This could be implemented based on your specific requirements
  } catch (error) {
    console.error('Error logging email activity:', error);
  }
} 