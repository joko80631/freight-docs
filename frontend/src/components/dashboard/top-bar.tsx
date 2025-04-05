"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserNav } from "@/components/dashboard/user-nav";
import { cn } from "@/lib/utils";

interface TopBarProps {
  className?: string;
  onMobileMenuClick?: () => void;
}

export function TopBar({ className, onMobileMenuClick }: TopBarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="container flex h-14 items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:hidden"
          onClick={onMobileMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Add any additional header content here */}
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </div>
    </header>
  );
} 