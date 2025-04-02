'use client';

import { formatDistanceToNow } from "date-fns";
import { FileText, Package, User, DollarSign, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/shared";

const activities = [
  {
    id: 1,
    type: "document",
    title: "New BOL uploaded",
    description: "Bill of Lading #12345 was uploaded for Load #789",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    icon: FileText,
  },
  {
    id: 2,
    type: "load",
    title: "Load status updated",
    description: "Load #789 status changed to In Transit",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    icon: Package,
  },
  {
    id: 3,
    type: "team",
    title: "New team member",
    description: "Sarah Johnson joined the team",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    icon: User,
  },
  {
    id: 4,
    type: "payment",
    title: "Payment received",
    description: "Payment of $2,500 received for Load #789",
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    icon: DollarSign,
  },
  {
    id: 5,
    type: "delay",
    title: "Delay reported",
    description: "Load #789 delayed by 2 hours due to traffic",
    timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
    icon: Clock,
  },
];

export function ActivityFeed({ isLoading }) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="flex items-start space-x-4">
                <LoadingSkeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <LoadingSkeleton className="h-4 w-48" />
                  <LoadingSkeleton className="h-3 w-64" />
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
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-start space-x-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {activity.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 