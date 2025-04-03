import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Truck, Clock, CheckCircle2, AlertCircle, User, Calendar } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from "@/lib/utils";

const EVENT_ICONS = {
  creation: <Truck className="h-4 w-4 text-primary" />,
  document: <FileText className="h-4 w-4 text-blue-500" />,
  status: <Clock className="h-4 w-4 text-yellow-500" />,
  completion: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  alert: <AlertCircle className="h-4 w-4 text-red-500" />,
  user: <User className="h-4 w-4 text-purple-500" />,
};

const EVENT_COLORS = {
  creation: 'bg-primary/10',
  document: 'bg-blue-500/10',
  status: 'bg-yellow-500/10',
  completion: 'bg-green-500/10',
  alert: 'bg-red-500/10',
  user: 'bg-purple-500/10',
};

export default function LoadTimeline({ 
  events = [], 
  className 
}) {
  const timelineRef = useRef(null);
  
  // Group events by day
  const groupedEvents = events.reduce((groups, event) => {
    const date = new Date(event.timestamp).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {});
  
  // Sort dates in descending order (newest first)
  const sortedDates = Object.keys(groupedEvents).sort((a, b) => {
    return new Date(b) - new Date(a);
  });
  
  // Handle sticky headers on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return;
      
      const dateHeaders = timelineRef.current.querySelectorAll('.date-header');
      dateHeaders.forEach(header => {
        const headerTop = header.getBoundingClientRect().top;
        const headerHeight = header.offsetHeight;
        
        if (headerTop <= 0) {
          header.classList.add('sticky');
        } else {
          header.classList.remove('sticky');
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8" ref={timelineRef}>
          {sortedDates.map((date) => {
            const dayEvents = groupedEvents[date];
            const formattedDate = new Date(date).toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
            
            return (
              <div key={date} className="timeline-group">
                <div className="date-header bg-muted/30 p-2 rounded-md mb-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {formattedDate}
                  </h3>
                </div>
                <div className="space-y-4 pl-4 border-l-2 border-muted">
                  {dayEvents.map((event, index) => (
                    <div key={index} className="timeline-event">
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            EVENT_COLORS[event.type] || 'bg-gray-100'
                          )}>
                            {EVENT_ICONS[event.type] || <Clock className="h-4 w-4 text-gray-500" />}
                          </div>
                          {index < dayEvents.length - 1 && (
                            <div className="w-0.5 h-full bg-border" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="font-medium">{event.description}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}</span>
                            {event.user && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {event.user}
                                </span>
                              </>
                            )}
                          </div>
                          {event.metadata && (
                            <div className="mt-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-md">
                              {Object.entries(event.metadata).map(([key, value]) => (
                                <div key={key} className="flex items-center gap-1">
                                  <span className="font-medium">{key}:</span> 
                                  <span>{value}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 