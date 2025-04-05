"use client";

import * as React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ActionMenu } from "@/components/ui/actions/ActionMenu";
import { LogOut, Settings, User } from "lucide-react";

export function UserNav() {
  return (
    <ActionMenu
      trigger={
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/avatars/user.png" alt="User avatar" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </button>
      }
      items={[
        {
          label: "Profile",
          icon: <User className="h-4 w-4" />,
          onClick: () => console.log("Profile clicked"),
        },
        {
          label: "Settings",
          icon: <Settings className="h-4 w-4" />,
          onClick: () => console.log("Settings clicked"),
        },
        {
          label: "Logout",
          icon: <LogOut className="h-4 w-4" />,
          onClick: () => console.log("Logout clicked"),
          variant: "destructive",
        },
      ]}
    />
  );
} 