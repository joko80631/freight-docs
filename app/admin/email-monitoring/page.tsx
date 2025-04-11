'use client';

import { useState, useEffect } from 'react';
import { getEmailMonitoringService, EmailEvent, EmailEventType } from '@/lib/email/monitoring';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, RefreshCw, Mail, XCircle, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function EmailMonitoringDashboard() {
  const [events, setEvents] = useState<EmailEvent[]>([]);
  const [failedEvents, setFailedEvents] = useState<EmailEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch events on component mount
  useEffect(() => {
    const fetchEvents = () => {
      try {
        const monitoringService = getEmailMonitoringService();
        const recentEvents = monitoringService.getRecentEvents(100);
        const failed = monitoringService.getFailedEvents(100);
        
        setEvents(recentEvents);
        setFailedEvents(failed);
        setError(null);
      } catch (err) {
        setError('Failed to load email events');
        console.error('Error loading email events:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
    
    // Set up polling for updates
    const interval = setInterval(fetchEvents, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Get event type badge
  const getEventTypeBadge = (type: EmailEventType) => {
    switch (type) {
      case EmailEventType.SENT:
        return <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800"><CheckCircle className="h-3 w-3" /> Sent</span>;
      case EmailEventType.FAILED:
        return <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800"><XCircle className="h-3 w-3" /> Failed</span>;
      case EmailEventType.BOUNCED:
        return <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800"><AlertTriangle className="h-3 w-3" /> Bounced</span>;
      case EmailEventType.RETRIED:
        return <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800"><RefreshCw className="h-3 w-3" /> Retried</span>;
      case EmailEventType.PREVIEWED:
        return <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800"><Mail className="h-3 w-3" /> Preview</span>;
      default:
        return <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">{type}</span>;
    }
  };

  // Format timestamp
  const formatTimestamp = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  // Render event list
  const renderEventList = (events: EmailEvent[]) => {
    if (events.length === 0) {
      return <p className="text-muted-foreground">No events found</p>;
    }

    return (
      <div className="space-y-4">
        {events.map((event) => (
          <Card key={event.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {getEventTypeBadge(event.type)}
                    <span className="text-sm text-muted-foreground">
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>
                  {event.templateName && (
                    <p className="text-sm font-medium">Template: {event.templateName}</p>
                  )}
                  {event.recipient && (
                    <p className="text-sm">To: {event.recipient}</p>
                  )}
                  {event.metadata?.subject && (
                    <p className="text-sm">Subject: {event.metadata.subject}</p>
                  )}
                </div>
              </div>
              
              {event.error && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    <p className="font-medium">{event.error.message}</p>
                    {event.error.code && (
                      <p className="text-xs">Code: {event.error.code}</p>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Email Monitoring Dashboard</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed Emails</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{failedEvents.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {events.length > 0
                ? `${Math.round(((events.length - failedEvents.length) / events.length) * 100)}%`
                : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="failed">Failed Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Recent Email Events</CardTitle>
              <CardDescription>
                Showing the most recent email events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                renderEventList(events)
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="failed">
          <Card>
            <CardHeader>
              <CardTitle>Failed Email Events</CardTitle>
              <CardDescription>
                Emails that failed to send or were bounced
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                renderEventList(failedEvents)
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 