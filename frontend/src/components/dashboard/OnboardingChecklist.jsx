'use client';

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { CheckCircle2, Circle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToastNotification } from "@/components/shared";
import { safeArray } from '@/lib/array-utils';
import { handleNavigation } from "@/lib/utils";

const ONBOARDING_STORAGE_KEY = "freightdocs_onboarding_status";

const checklistItems = [
  {
    id: "create_team",
    title: "Create your team",
    description: "Set up your team to collaborate with others",
    action: "Create Team",
    path: "/teams/new",
    autoComplete: true,
  },
  {
    id: "upload_document",
    title: "Upload your first document",
    description: "Upload a BOL, POD, or invoice to get started",
    action: "Upload Document",
    path: "/upload",
    autoComplete: true,
  },
  {
    id: "create_load",
    title: "Create your first load",
    description: "Create a new load to track shipments",
    action: "Create Load",
    path: "/loads/new",
    autoComplete: true,
  },
  {
    id: "link_documents",
    title: "Link documents to a load",
    description: "Associate documents with their corresponding loads",
    action: "View Loads",
    path: "/loads",
    autoComplete: true,
  },
  {
    id: "invite_team",
    title: "Invite team members",
    description: "Add team members to collaborate together",
    action: "Invite Members",
    path: "/teams/invite",
    autoComplete: true,
  },
];

export function OnboardingChecklist() {
  const [isVisible, setIsVisible] = useState(true);
  const [completedItems, setCompletedItems] = useState([]);
  const router = useRouter();
  const { showToast } = useToastNotification();
  const pathname = usePathname();

  useEffect(() => {
    const savedStatus = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (savedStatus) {
      const { completed, dismissed } = JSON.parse(savedStatus);
      setCompletedItems(completed || []);
      setIsVisible(!dismissed);
    }
  }, []);

  // Auto-complete checklist items based on route changes
  useEffect(() => {
    if (!isVisible) return;

    const currentItem = checklistItems.find(
      (item) => item.autoComplete && item.path === pathname
    );

    if (currentItem && !completedItems.includes(currentItem.id)) {
      handleComplete(currentItem.id);
    }
  }, [pathname, isVisible, completedItems]);

  const handleComplete = (itemId) => {
    const newCompletedItems = [...completedItems, itemId];
    setCompletedItems(newCompletedItems);
    localStorage.setItem(
      ONBOARDING_STORAGE_KEY,
      JSON.stringify({
        completed: newCompletedItems,
        dismissed: !isVisible,
      })
    );
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(
      ONBOARDING_STORAGE_KEY,
      JSON.stringify({
        completed: completedItems,
        dismissed: true,
      })
    );
  };

  const handleActionClick = (path) => {
    handleNavigation(router, path, showToast);
  };

  if (!isVisible) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Complete these steps to get the most out of Freight
          </CardDescription>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Dismiss Getting Started?</AlertDialogTitle>
              <AlertDialogDescription>
                You can always access this checklist from your profile settings.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDismiss}>
                Dismiss
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {safeArray(checklistItems).map((item) => {
            const isCompleted = completedItems.includes(item.id);
            return (
              <div
                key={item.id}
                className="flex items-start justify-between space-x-4"
              >
                <div className="flex items-start space-x-4">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleActionClick(item.path)}
                >
                  {item.action}
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 