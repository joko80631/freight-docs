/**
 * Types for the cron job system
 */

/**
 * Cron job status
 */
export enum CronJobStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}

/**
 * Cron job result
 */
export interface CronJobResult {
  success: boolean;
  message: string;
  data?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Cron job definition
 */
export interface CronJob {
  id: string;
  name: string;
  description: string;
  schedule: string; // Cron expression
  handler: () => Promise<CronJobResult>;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  status?: CronJobStatus;
  result?: CronJobResult;
  retryCount?: number;
  maxRetries?: number;
  retryDelay?: number; // in milliseconds
}

/**
 * Cron job registration
 */
export interface CronJobRegistration {
  register: (job: Omit<CronJob, 'id' | 'lastRun' | 'nextRun' | 'status' | 'result' | 'retryCount'>) => void;
  unregister: (jobId: string) => void;
  getJobs: () => CronJob[];
  getJob: (jobId: string) => CronJob | undefined;
  runJob: (jobId: string) => Promise<CronJobResult>;
  runAllJobs: () => Promise<CronJobResult[]>;
}

/**
 * Cron job run record
 * Used to track execution history and performance
 */
export interface CronRun {
  id: string;
  jobId: string;
  jobName: string;
  startedAt: Date;
  completedAt?: Date;
  success: boolean;
  result?: CronJobResult;
  emailsSent?: number;
  emailsFailed?: number;
  failures?: Array<{
    code: string;
    message: string;
    recipient?: string;
    timestamp: Date;
  }>;
  duration?: number; // in milliseconds
  error?: {
    code: string;
    message: string;
    details?: any;
  };
} 