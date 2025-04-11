'use client';

import { useState, useEffect } from 'react';
// import { getCronJobService } from '@/lib/cron/service';
// import { CronJob, CronJobStatus } from '@/lib/cron/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, CheckCircle, XCircle, Clock, PlayCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { EmailErrorBoundary } from '@/components/email/EmailErrorBoundary';

// Define types locally since we're removing the imports
type CronJobStatus = 'COMPLETED' | 'FAILED' | 'RUNNING' | 'SKIPPED' | 'PENDING';

interface CronJob {
  id: string;
  name: string;
  description: string;
  schedule: string;
  status: CronJobStatus;
  lastRun?: Date;
  nextRun?: Date;
  retryCount?: number;
  result?: {
    success: boolean;
    message: string;
    error?: {
      code: string;
    };
  };
}

export default function CronMonitoringDashboard() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runStatus, setRunStatus] = useState<Record<string, boolean>>({});

  // Fetch jobs on component mount
  useEffect(() => {
    const fetchJobs = () => {
      try {
        // const cronService = getCronJobService();
        // const allJobs = cronService.getJobs();
        // setJobs(allJobs);
        setJobs([]); // Empty array since we're removing the service
        setError(null);
      } catch (err) {
        setError('Failed to load cron jobs');
        console.error('Error loading cron jobs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
    
    // Set up polling for updates
    const interval = setInterval(fetchJobs, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Handle run button click
  const handleRunJob = async (jobId: string) => {
    try {
      setRunStatus(prev => ({ ...prev, [jobId]: true }));
      // const cronService = getCronJobService();
      // const result = await cronService.runJob(jobId);
      
      // Update UI after a short delay to allow for processing
      setTimeout(() => {
        setRunStatus(prev => ({ ...prev, [jobId]: false }));
        // Refresh the jobs
        // const allJobs = cronService.getJobs();
        // setJobs(allJobs);
      }, 1000);
    } catch (err) {
      setRunStatus(prev => ({ ...prev, [jobId]: false }));
      console.error('Error running job:', err);
    }
  };

  // Format timestamp
  const formatTimestamp = (date: Date | undefined) => {
    if (!date) return 'Never';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  // Get status badge
  const getStatusBadge = (job: CronJob) => {
    switch (job.status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </span>
        );
      case 'RUNNING':
        return (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
            <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
            Running
          </span>
        );
      case 'SKIPPED':
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
            <Clock className="mr-1 h-3 w-3" />
            Skipped
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </span>
        );
    }
  };

  return (
    <EmailErrorBoundary>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Cron Job Monitoring</h1>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Jobs</CardTitle>
            <CardDescription>
              Monitor and manage scheduled jobs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-medium">No jobs found</p>
                <p className="text-muted-foreground">No cron jobs have been registered</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <Card key={job.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusBadge(job)}
                            <span className="text-sm text-muted-foreground">
                              Next run: {formatTimestamp(job.nextRun)}
                            </span>
                          </div>
                          <p className="text-sm font-medium">{job.name}</p>
                          <p className="text-sm">{job.description}</p>
                          <p className="text-sm text-muted-foreground">
                            Schedule: {job.schedule}
                          </p>
                          {job.lastRun && (
                            <p className="text-sm text-muted-foreground">
                              Last run: {formatTimestamp(job.lastRun)}
                            </p>
                          )}
                          {job.retryCount && job.retryCount > 0 && (
                            <p className="text-sm text-muted-foreground">
                              Retry count: {job.retryCount}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRunJob(job.id)}
                          disabled={runStatus[job.id] || job.status === 'RUNNING'}
                          className="flex items-center gap-2"
                        >
                          {runStatus[job.id] ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Running...
                            </>
                          ) : (
                            <>
                              <PlayCircle className="h-4 w-4" />
                              Run Now
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {job.result && !job.result.success && (
                        <Alert variant="destructive" className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>
                            <p className="font-medium">{job.result.message}</p>
                            {job.result.error?.code && (
                              <p className="text-xs">Code: {job.result.error.code}</p>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </EmailErrorBoundary>
  );
} 