export enum EmailEventType {
  SENT = 'SENT',
  FAILED = 'FAILED',
  BOUNCED = 'BOUNCED',
  RETRIED = 'RETRIED',
  PREVIEWED = 'PREVIEWED'
}

export interface EmailError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

export interface EmailEvent {
  id: string;
  type: EmailEventType;
  templateId?: string;
  templateName?: string;
  recipient?: string;
  timestamp: Date;
  error?: EmailError;
  metadata?: Record<string, any>;
}

export class EmailMonitoring {
  private metrics: {
    [templateType: string]: {
      success: number;
      error: number;
      latency: number[];
    };
  } = {};

  private events: EmailEvent[] = [];

  recordSuccess(templateType: string): void {
    if (!this.metrics[templateType]) {
      this.metrics[templateType] = {
        success: 0,
        error: 0,
        latency: [],
      };
    }
    this.metrics[templateType].success++;
  }

  recordError(templateType: string, error: unknown): void {
    if (!this.metrics[templateType]) {
      this.metrics[templateType] = {
        success: 0,
        error: 0,
        latency: [],
      };
    }
    this.metrics[templateType].error++;
  }

  recordLatency(templateType: string, latencyMs: number): void {
    if (!this.metrics[templateType]) {
      this.metrics[templateType] = {
        success: 0,
        error: 0,
        latency: [],
      };
    }
    this.metrics[templateType].latency.push(latencyMs);
  }

  getMetrics(): Record<string, {
    success: number;
    error: number;
    averageLatency: number;
  }> {
    const result: Record<string, {
      success: number;
      error: number;
      averageLatency: number;
    }> = {};

    for (const [templateType, metrics] of Object.entries(this.metrics)) {
      const averageLatency = metrics.latency.length > 0
        ? metrics.latency.reduce((a, b) => a + b, 0) / metrics.latency.length
        : 0;

      result[templateType] = {
        success: metrics.success,
        error: metrics.error,
        averageLatency,
      };
    }

    return result;
  }

  recordEvent(event: EmailEvent): void {
    if (!event.id) {
      event.id = crypto.randomUUID();
    }
    this.events.unshift(event);
  }

  logEvent(event: Omit<EmailEvent, 'id' | 'timestamp'>): void {
    const fullEvent: EmailEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    this.events.unshift(fullEvent);
  }

  getRecentEvents(limit: number = 100): EmailEvent[] {
    return this.events.slice(0, limit);
  }

  getFailedEvents(limit: number = 100): EmailEvent[] {
    return this.events
      .filter(event => event.type === EmailEventType.FAILED)
      .slice(0, limit);
  }
}

// Create and export the singleton instance
const emailMonitoringService = new EmailMonitoring();
export const getEmailMonitoringService = () => emailMonitoringService; 