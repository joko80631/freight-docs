'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Upload, Truck, UserPlus, AlertCircle, Activity } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import EmptyState from '@/components/ui/empty-state';

const ActivityItem = ({ activity }) => {
  if (!activity || !activity.type || !activity.description || !activity.timestamp) {
    return null;
  }

  const getIcon = () => {
    switch (activity.type) {
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'upload':
        return <Upload className="h-4 w-4" />;
      case 'load':
        return <Truck className="h-4 w-4" />;
      case 'team':
        return <UserPlus className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex items-start gap-4 py-4">
      <div className="mt-1">{getIcon()}</div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none">{activity.description}</p>
        <p className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
};

export default function ActivityTimeline({ teamId }) {
  const [activities, setActivities] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/teams/${teamId}/activities`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Validate data structure
        if (!Array.isArray(data)) {
          throw new Error('Invalid response format');
        }
        setActivities(data);
      } catch (error) {
        console.error('Failed to fetch activities:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (teamId) {
      fetchActivities();
    }
  }, [teamId]);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load activities. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <Skeleton className="h-4 w-4 mt-1" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {!activities || activities.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No recent activity"
              description="Team activity will appear here once members start working."
              variant="inline"
            />
          ) : (
            <div className="space-y-4">
              {activities
                .filter(activity => activity && activity.type && activity.description && activity.timestamp)
                .map((activity, index) => (
                  <ActivityItem key={index} activity={activity} />
                ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 