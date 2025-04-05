"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserNav } from "./UserNav";
import { PageHeader } from "./PageHeader";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SideNav } from "./SideNav";

interface TopBarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (value: boolean) => void;
}

export function TopBar({ isMobileOpen, setIsMobileOpen }: TopBarProps) {
  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 shadow-sm">
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] p-0">
          <SideNav isCollapsed={false} setIsCollapsed={() => {}} />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 items-center justify-between">
        <PageHeader />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
} 