export class EmailMonitoring {
  private metrics: {
    [templateType: string]: {
      success: number;
      error: number;
      latency: number[];
    };
  } = {};

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
} 