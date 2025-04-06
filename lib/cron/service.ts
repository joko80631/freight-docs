/**
 * Cron job service implementation
 */

import { CronJob, CronJobRegistration, CronJobResult, CronJobStatus, CronRun } from './types';
import { getEmailMonitoringService } from '../email/monitoring';
import { EmailEventType } from '../email/monitoring';

/**
 * Cron job service
 */
class CronJobService implements CronJobRegistration {
  private static instance: CronJobService;
  private jobs: Map<string, CronJob> = new Map();
  private runs: CronRun[] = [];
  private maxRuns: number = 1000; // Keep last 1000 runs in memory
  private monitoringService = getEmailMonitoringService();
  private alertThreshold: number = 10; // Alert after 10 failures in a single job run

  private constructor() {}

  /**
   * Get the singleton instance
   */
  public static getInstance(): CronJobService {
    if (!CronJobService.instance) {
      CronJobService.instance = new CronJobService();
    }
    return CronJobService.instance;
  }

  /**
   * Register a new cron job
   */
  public register(job: Omit<CronJob, 'id' | 'lastRun' | 'nextRun' | 'status' | 'result' | 'retryCount'>): void {
    const id = crypto.randomUUID();
    const newJob: CronJob = {
      ...job,
      id,
      lastRun: undefined,
      nextRun: this.calculateNextRun(job.schedule),
      status: CronJobStatus.PENDING,
      retryCount: 0,
    };

    this.jobs.set(id, newJob);
    console.log(`Registered cron job: ${job.name} (${id})`);
  }

  /**
   * Unregister a cron job
   */
  public unregister(jobId: string): void {
    if (this.jobs.has(jobId)) {
      const job = this.jobs.get(jobId)!;
      this.jobs.delete(jobId);
      console.log(`Unregistered cron job: ${job.name} (${jobId})`);
    }
  }

  /**
   * Get all registered jobs
   */
  public getJobs(): CronJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Get a specific job by ID
   */
  public getJob(jobId: string): CronJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Run a specific job
   */
  public async runJob(jobId: string): Promise<CronJobResult> {
    const job = this.jobs.get(jobId);
    if (!job) {
      return {
        success: false,
        message: `Job not found: ${jobId}`,
        error: {
          code: 'JOB_NOT_FOUND',
          message: `Job with ID ${jobId} not found`,
        },
      };
    }

    return this.executeJob(job);
  }

  /**
   * Run all enabled jobs
   */
  public async runAllJobs(): Promise<CronJobResult[]> {
    const results: CronJobResult[] = [];
    const enabledJobs = Array.from(this.jobs.values()).filter(job => job.enabled);

    for (const job of enabledJobs) {
      const result = await this.executeJob(job);
      results.push(result);
    }

    return results;
  }

  /**
   * Get recent job runs
   */
  public getRecentRuns(limit: number = 100): CronRun[] {
    return [...this.runs].reverse().slice(0, limit);
  }

  /**
   * Get runs for a specific job
   */
  public getJobRuns(jobId: string, limit: number = 100): CronRun[] {
    return this.runs
      .filter(run => run.jobId === jobId)
      .reverse()
      .slice(0, limit);
  }

  /**
   * Execute a job
   */
  private async executeJob(job: CronJob): Promise<CronJobResult> {
    // Create a run record
    const runId = crypto.randomUUID();
    const run: CronRun = {
      id: runId,
      jobId: job.id,
      jobName: job.name,
      startedAt: new Date(),
      success: false,
      emailsSent: 0,
      emailsFailed: 0,
      failures: [],
    };

    // Add to runs
    this.runs.push(run);

    // Trim runs if needed
    if (this.runs.length > this.maxRuns) {
      this.runs = this.runs.slice(-this.maxRuns);
    }

    // Update job status
    job.status = CronJobStatus.RUNNING;
    job.lastRun = new Date();
    this.jobs.set(job.id, job);

    try {
      // Execute the job handler
      const result = await job.handler();
      
      // Update job status and result
      job.status = result.success ? CronJobStatus.COMPLETED : CronJobStatus.FAILED;
      job.result = result;
      job.nextRun = this.calculateNextRun(job.schedule);
      job.retryCount = 0;
      this.jobs.set(job.id, job);

      // Update run record
      run.completedAt = new Date();
      run.success = result.success;
      run.result = result;
      run.duration = run.completedAt.getTime() - run.startedAt.getTime();
      
      // Extract email metrics from result data if available
      if (result.data) {
        if (typeof result.data.emailsSent === 'number') {
          run.emailsSent = result.data.emailsSent;
        }
        if (typeof result.data.emailsFailed === 'number') {
          run.emailsFailed = result.data.emailsFailed;
        }
        if (Array.isArray(result.data.failures)) {
          run.failures = result.data.failures;
        }
      }

      // Check for alert conditions
      this.checkAlertConditions(run);

      // Log the result
      console.log(`Cron job ${job.name} (${job.id}) completed with status: ${job.status}`);
      
      return result;
    } catch (error) {
      // Handle job failure
      const errorResult: CronJobResult = {
        success: false,
        message: `Job ${job.name} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: {
          code: 'JOB_EXECUTION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error,
        },
      };

      // Update job status and result
      job.status = CronJobStatus.FAILED;
      job.result = errorResult;
      this.jobs.set(job.id, job);

      // Update run record
      run.completedAt = new Date();
      run.success = false;
      run.error = {
        code: 'JOB_EXECUTION_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error,
      };
      run.duration = run.completedAt.getTime() - run.startedAt.getTime();

      // Log the error
      console.error(`Cron job ${job.name} (${job.id}) failed:`, error);
      
      // Check if we should retry
      if (job.maxRetries && job.retryCount! < job.maxRetries) {
        job.retryCount = (job.retryCount || 0) + 1;
        job.nextRun = new Date(Date.now() + (job.retryDelay || 5 * 60 * 1000)); // Default 5 minutes
        this.jobs.set(job.id, job);
        console.log(`Scheduled retry ${job.retryCount} for job ${job.name} (${job.id})`);
      }

      return errorResult;
    }
  }

  /**
   * Check for alert conditions
   */
  private checkAlertConditions(run: CronRun): void {
    // Alert if too many emails failed in a single job run
    if (run.emailsFailed && run.emailsFailed >= this.alertThreshold) {
      console.error(`ALERT: Cron job ${run.jobName} failed ${run.emailsFailed} emails`);
      
      // Log an alert event
      this.monitoringService.logEvent({
        type: EmailEventType.FAILED,
        templateName: 'cron_alert',
        error: {
          code: 'CRON_JOB_ALERT',
          message: `Cron job ${run.jobName} failed ${run.emailsFailed} emails`,
        },
        metadata: {
          jobId: run.jobId,
          jobName: run.jobName,
          runId: run.id,
          emailsFailed: run.emailsFailed,
          failures: run.failures,
        },
      });
    }
    
    // Alert if the job itself failed
    if (!run.success && run.error) {
      console.error(`ALERT: Cron job ${run.jobName} failed with error: ${run.error.message}`);
      
      // Log an alert event
      this.monitoringService.logEvent({
        type: EmailEventType.FAILED,
        templateName: 'cron_alert',
        error: {
          code: 'CRON_JOB_ERROR',
          message: run.error.message,
          details: run.error.details,
        },
        metadata: {
          jobId: run.jobId,
          jobName: run.jobName,
          runId: run.id,
        },
      });
    }
  }

  /**
   * Calculate the next run time based on the cron expression
   * This is a simplified implementation that only supports basic cron expressions
   * For production, consider using a library like node-cron or cron-parser
   */
  private calculateNextRun(cronExpression: string): Date {
    // For now, we'll just return a date 24 hours from now
    // In a real implementation, you would parse the cron expression
    return new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
}

/**
 * Get the cron job service instance
 */
export function getCronJobService(): CronJobService {
  return CronJobService.getInstance();
} 