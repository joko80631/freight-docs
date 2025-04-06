import { getCronJobService } from '@/lib/cron/service';
import { CronJobStatus } from '@/lib/cron/types';

describe('Cron Job Service', () => {
  let cronService: ReturnType<typeof getCronJobService>;
  
  beforeEach(() => {
    // Reset the service for each test
    cronService = getCronJobService();
    
    // Clear any existing jobs
    // This is a bit of a hack since we don't have a public method to clear the jobs
    // In a real implementation, we would have a method to reset the service for testing
    (cronService as any).jobs = new Map();
  });
  
  describe('register', () => {
    it('should register a new job', () => {
      // Create a test job
      const job = {
        name: 'Test Job',
        description: 'A test job',
        schedule: '0 9 * * *',
        handler: async () => ({ success: true, message: 'Job completed successfully' }),
        enabled: true,
      };
      
      // Register the job
      cronService.register(job);
      
      // Verify the job was registered
      const jobs = cronService.getJobs();
      expect(jobs.length).toBe(1);
      expect(jobs[0].name).toBe('Test Job');
      expect(jobs[0].description).toBe('A test job');
      expect(jobs[0].schedule).toBe('0 9 * * *');
      expect(jobs[0].enabled).toBe(true);
      expect(jobs[0].status).toBe(CronJobStatus.PENDING);
      expect(jobs[0].retryCount).toBe(0);
    });
  });
  
  describe('unregister', () => {
    it('should unregister a job', () => {
      // Create and register a test job
      const job = {
        name: 'Test Job',
        description: 'A test job',
        schedule: '0 9 * * *',
        handler: async () => ({ success: true, message: 'Job completed successfully' }),
        enabled: true,
      };
      
      cronService.register(job);
      
      // Get the job ID
      const jobs = cronService.getJobs();
      const jobId = jobs[0].id;
      
      // Unregister the job
      cronService.unregister(jobId);
      
      // Verify the job was unregistered
      const updatedJobs = cronService.getJobs();
      expect(updatedJobs.length).toBe(0);
    });
  });
  
  describe('getJobs', () => {
    it('should return all registered jobs', () => {
      // Create and register multiple test jobs
      const job1 = {
        name: 'Test Job 1',
        description: 'A test job',
        schedule: '0 9 * * *',
        handler: async () => ({ success: true, message: 'Job completed successfully' }),
        enabled: true,
      };
      
      const job2 = {
        name: 'Test Job 2',
        description: 'Another test job',
        schedule: '0 12 * * *',
        handler: async () => ({ success: true, message: 'Job completed successfully' }),
        enabled: true,
      };
      
      cronService.register(job1);
      cronService.register(job2);
      
      // Get all jobs
      const jobs = cronService.getJobs();
      
      // Verify all jobs were returned
      expect(jobs.length).toBe(2);
      expect(jobs[0].name).toBe('Test Job 1');
      expect(jobs[1].name).toBe('Test Job 2');
    });
  });
  
  describe('getJob', () => {
    it('should return a specific job by ID', () => {
      // Create and register a test job
      const job = {
        name: 'Test Job',
        description: 'A test job',
        schedule: '0 9 * * *',
        handler: async () => ({ success: true, message: 'Job completed successfully' }),
        enabled: true,
      };
      
      cronService.register(job);
      
      // Get the job ID
      const jobs = cronService.getJobs();
      const jobId = jobs[0].id;
      
      // Get the job by ID
      const retrievedJob = cronService.getJob(jobId);
      
      // Verify the job was retrieved
      expect(retrievedJob).toBeDefined();
      expect(retrievedJob?.name).toBe('Test Job');
    });
    
    it('should return undefined for a non-existent job ID', () => {
      // Get a non-existent job
      const retrievedJob = cronService.getJob('non-existent-id');
      
      // Verify undefined was returned
      expect(retrievedJob).toBeUndefined();
    });
  });
  
  describe('runJob', () => {
    it('should run a job and return the result', async () => {
      // Create and register a test job
      const job = {
        name: 'Test Job',
        description: 'A test job',
        schedule: '0 9 * * *',
        handler: async () => ({ success: true, message: 'Job completed successfully' }),
        enabled: true,
      };
      
      cronService.register(job);
      
      // Get the job ID
      const jobs = cronService.getJobs();
      const jobId = jobs[0].id;
      
      // Run the job
      const result = await cronService.runJob(jobId);
      
      // Verify the job was run successfully
      expect(result.success).toBe(true);
      expect(result.message).toBe('Job completed successfully');
      
      // Verify the job status was updated
      const updatedJob = cronService.getJob(jobId);
      expect(updatedJob?.status).toBe(CronJobStatus.COMPLETED);
      expect(updatedJob?.result).toBeDefined();
      expect(updatedJob?.result?.success).toBe(true);
    });
    
    it('should handle job failures', async () => {
      // Create and register a test job that fails
      const job = {
        name: 'Failing Job',
        description: 'A job that fails',
        schedule: '0 9 * * *',
        handler: async () => {
          throw new Error('Job failed');
        },
        enabled: true,
        maxRetries: 2,
        retryDelay: 1000, // 1 second for testing
      };
      
      cronService.register(job);
      
      // Get the job ID
      const jobs = cronService.getJobs();
      const jobId = jobs[0].id;
      
      // Run the job
      const result = await cronService.runJob(jobId);
      
      // Verify the job failed
      expect(result.success).toBe(false);
      expect(result.message).toContain('Job failed');
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('JOB_EXECUTION_ERROR');
      
      // Verify the job status was updated
      const updatedJob = cronService.getJob(jobId);
      expect(updatedJob?.status).toBe(CronJobStatus.FAILED);
      expect(updatedJob?.result).toBeDefined();
      expect(updatedJob?.result?.success).toBe(false);
      expect(updatedJob?.retryCount).toBe(1);
    });
  });
  
  describe('runAllJobs', () => {
    it('should run all enabled jobs', async () => {
      // Create and register multiple test jobs
      const job1 = {
        name: 'Test Job 1',
        description: 'A test job',
        schedule: '0 9 * * *',
        handler: async () => ({ success: true, message: 'Job 1 completed successfully' }),
        enabled: true,
      };
      
      const job2 = {
        name: 'Test Job 2',
        description: 'Another test job',
        schedule: '0 12 * * *',
        handler: async () => ({ success: true, message: 'Job 2 completed successfully' }),
        enabled: true,
      };
      
      const job3 = {
        name: 'Disabled Job',
        description: 'A disabled job',
        schedule: '0 15 * * *',
        handler: async () => ({ success: true, message: 'Job 3 completed successfully' }),
        enabled: false,
      };
      
      cronService.register(job1);
      cronService.register(job2);
      cronService.register(job3);
      
      // Run all jobs
      const results = await cronService.runAllJobs();
      
      // Verify all enabled jobs were run
      expect(results.length).toBe(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      
      // Verify the job statuses were updated
      const jobs = cronService.getJobs();
      const enabledJobs = jobs.filter(job => job.enabled);
      expect(enabledJobs.length).toBe(3); // Total enabled jobs
      expect(enabledJobs.filter(job => job.status === CronJobStatus.COMPLETED).length).toBe(2); // Jobs that were run
    });
  });
}); 