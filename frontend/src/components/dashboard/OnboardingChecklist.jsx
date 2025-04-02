'use client';

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
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
  const { showSuccess } = useToastNotification();
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
    const newCompleted = [...completedItems, itemId];
    setCompletedItems(newCompleted);
    localStorage.setItem(
      ONBOARDING_STORAGE_KEY,
      JSON.stringify({ completed: newCompleted, dismissed: false })
    );
    showSuccess("Progress saved", "Keep going! You're making great progress.");
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(
      ONBOARDING_STORAGE_KEY,
      JSON.stringify({ completed: completedItems, dismissed: true })
    );
  };

  const progress = (completedItems.length / checklistItems.length) * 100;

  if (!isVisible) return null;

  return (
    <Card className="border-primary">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Welcome to FreightDocs!</CardTitle>
            <CardDescription>
              Let's get you set up with the basics
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
                <AlertDialogTitle>Dismiss Checklist?</AlertDialogTitle>
                <AlertDialogDescription>
                  You can always find this checklist in your settings if you need it later.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDismiss}>
                  Dismiss Checklist
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Setup Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-4">
            {checklistItems.map((item) => {
              const isCompleted = completedItems.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="flex items-start space-x-4 rounded-lg border p-4"
                >
                  <div className="mt-1">
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {item.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleComplete(item.id)}
                    disabled={isCompleted}
                  >
                    {isCompleted ? "Completed" : item.action}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 