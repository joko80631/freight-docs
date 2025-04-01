import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { Plus, Upload, Users } from 'lucide-react';

const QuickActions = () => {
  const router = useRouter();

  const actions = [
    {
      title: 'Create New Load',
      description: 'Start a new freight load',
      icon: <Plus className="h-4 w-4" />,
      onClick: () => router.push('/loads/new')
    },
    {
      title: 'Upload Document',
      description: 'Upload a new document',
      icon: <Upload className="h-4 w-4" />,
      onClick: () => router.push('/upload')
    },
    {
      title: 'Manage Team',
      description: 'Update team members and settings',
      icon: <Users className="h-4 w-4" />,
      onClick: () => router.push('/team')
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant="outline"
              className="w-full justify-start"
              onClick={action.onClick}
            >
              {action.icon}
              <div className="ml-2 text-left">
                <div className="font-medium">{action.title}</div>
                <div className="text-xs text-muted-foreground">
                  {action.description}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions; 