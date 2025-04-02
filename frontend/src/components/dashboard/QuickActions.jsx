'use client';

import { useRouter } from "next/navigation";
import { Plus, Upload, FileText, Package, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const actions = [
  {
    title: "New Load",
    description: "Create a new load to track",
    icon: Package,
    path: "/loads/new",
  },
  {
    title: "Upload Document",
    description: "Upload a BOL, POD, or invoice",
    icon: Upload,
    path: "/upload",
  },
  {
    title: "View Documents",
    description: "Browse all your documents",
    icon: FileText,
    path: "/documents",
  },
  {
    title: "Team Members",
    description: "Manage team access",
    icon: Users,
    path: "/teams",
  },
];

export function QuickActions() {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.title}
                variant="outline"
                className="h-auto flex-col items-start justify-start gap-2 p-4"
                onClick={() => router.push(action.path)}
              >
                <div className="flex w-full items-center justify-between">
                  <Icon className="h-4 w-4" />
                  <Plus className="h-4 w-4" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{action.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {action.description}
                  </span>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 