'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ComingSoonCardProps {
  title: string;
  routeName: string;
  description?: string;
}

export function ComingSoonCard({ 
  title, 
  routeName, 
  description = "This feature will be available in a future release. Our current focus is document tracking."
}: ComingSoonCardProps) {
  useEffect(() => {
    console.log(`Visited placeholder route: /${routeName}`);
  }, [routeName]);

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {description}
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 