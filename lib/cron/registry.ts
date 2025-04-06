/**
 * Cron job registry
 * This file registers all cron jobs with the cron job service
 */

import { getCronJobService } from './service';
import { missingDocumentsScanJob } from './jobs/missing-documents';

/**
 * Register all cron jobs
 */
export function registerCronJobs(): void {
  const cronService = getCronJobService();
  
  // Register the missing documents scan job
  cronService.register({
    name: 'Missing Documents Scan',
    description: 'Scans for loads with incomplete document sets and sends reminder emails',
    schedule: '0 9 * * *', // Run at 9 AM every day
    handler: missingDocumentsScanJob,
    enabled: true,
    maxRetries: 3,
    retryDelay: 15 * 60 * 1000, // 15 minutes
  });
  
  // Register additional jobs here
  
  console.log('All cron jobs registered');
} 