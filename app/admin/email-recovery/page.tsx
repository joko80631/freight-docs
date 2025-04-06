'use client';

import { useState, useEffect } from 'react';
import { getEmailRecoveryService, EmailRetryRecord } from '@/lib/email/recovery';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { EmailErrorBoundary } from '@/components/email/EmailErrorBoundary';

export default function EmailRecoveryPage() {
  const [retryRecords, setRetryRecords] = useState<EmailRetryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryStatus, setRetryStatus] = useState<Record<string, boolean>>({});

  // Fetch retry records on component mount
  useEffect(() => {
    const fetchRetryRecords = () => {
      try {
        const recoveryService = getEmailRecoveryService();
        const records = recoveryService.getRetryRecords();
        setRetryRecords(records);
        setError(null);
      } catch (err) {
        setError('Failed to load retry records');
        console.error('Error loading retry records:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRetryRecords();
    
    // Set up polling for updates
    const interval = setInterval(fetchRetryRecords, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Handle retry button click
  const handleRetry = async (id: string) => {
    try {
      setRetryStatus(prev => ({ ...prev, [id]: true }));
      const recoveryService = getEmailRecoveryService();
      const success = await recoveryService.retryEmail(id);
      
      // Update UI after a short delay to allow for processing
      setTimeout(() => {
        setRetryStatus(prev => ({ ...prev, [id]: false }));
        // Refresh the records
        const records = recoveryService.getRetryRecords();
        setRetryRecords(records);
      }, 1000);
    } catch (err) {
      setRetryStatus(prev => ({ ...prev, [id]: false }));
      console.error('Error retrying email:', err);
    }
  };

  // Format timestamp
  const formatTimestamp = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  // Get status badge
  const getStatusBadge = (record: EmailRetryRecord) => {
    if (record.attempts >= 3) {
      return (
        <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
          <XCircle className="mr-1 h-3 w-3" />
          Failed
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
        <Clock className="mr-1 h-3 w-3" />
        Pending
      </span>
    );
  };

  return (
    <EmailErrorBoundary>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Email Recovery</h1>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Failed Emails</CardTitle>
            <CardDescription>
              Emails that failed to send and are in the retry queue
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin" />
              </div>
            ) : retryRecords.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-medium">No failed emails</p>
                <p className="text-muted-foreground">All emails have been sent successfully</p>
              </div>
            ) : (
              <div className="space-y-4">
                {retryRecords.map((record) => (
                  <Card key={record.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusBadge(record)}
                            <span className="text-sm text-muted-foreground">
                              Next attempt: {formatTimestamp(record.nextAttempt)}
                            </span>
                          </div>
                          <p className="text-sm font-medium">To: {record.recipient}</p>
                          <p className="text-sm">Subject: {record.subject}</p>
                          {record.templateName && (
                            <p className="text-sm">Template: {record.templateName}</p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            Attempts: {record.attempts} of 3
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRetry(record.id)}
                          disabled={retryStatus[record.id]}
                          className="flex items-center gap-2"
                        >
                          {retryStatus[record.id] ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Retrying...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-4 w-4" />
                              Retry Now
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {record.error && (
                        <Alert variant="destructive" className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>
                            <p className="font-medium">{record.error.message}</p>
                            {record.error.code && (
                              <p className="text-xs">Code: {record.error.code}</p>
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