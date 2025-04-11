'use client';

import { useRouter } from "next/navigation";
import { Plus, Upload, FileText, Package, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { safeArray } from '@/lib/array-utils';
import { useToastNotification } from "@/components/shared";
import { handleNavigation } from "@/lib/utils";
import { routes } from '@/config/routes';

const actions = [
  {
    title: "New Load",
    description: "Create a new load to track",
    icon: Package,
    path: routes.loads.create,
  },
  {
    title: "Upload Document",
    description: "Upload a BOL, POD, or invoice",
    icon: Upload,
    path: routes.documents.upload,
  },
  {
    title: "View Documents",
    description: "Browse all your documents",
    icon: FileText,
    path: routes.documents.index,
  },
  {
    title: "Team Members",
    description: "Manage team access",
    icon: Users,
    path: routes.teams.index,
  },
];

export function QuickActions() {
  const router = useRouter();
  const { showToast } = useToastNotification();

  const handleActionClick = (path: string) => {
    handleNavigation(router, path, showToast);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {actions.map((action) => (
        <Card key={action.title} className="hover:bg-accent/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {action.title}
            </CardTitle>
            <action.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{action.description}</div>
            <Button
              variant="ghost"
              className="w-full mt-4"
              onClick={() => handleActionClick(action.path)}
            >
              <Plus className="mr-2 h-4 w-4" />
              {action.title}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 