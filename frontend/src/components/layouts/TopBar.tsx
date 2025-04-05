import * as React from "react";
import { Menu } from "lucide-react";
import { ActionButton } from "@/components/ui/actions/ActionButton";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserNav } from "@/components/layouts/UserNav";
import { cn } from "@/lib/utils";

interface TopBarProps {
  onSidebarToggle?: () => void;
  sidebarOpen?: boolean;
  className?: string;
}

export function TopBar({
  onSidebarToggle,
  sidebarOpen = false,
  className,
}: TopBarProps) {
  return (
    <header className={cn(
      "sticky top-0 z-40 h-14 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40",
      className
    )}>
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <ActionButton
            variant="ghost"
            size="sm"
            className="md:hidden h-10 w-10 p-0 flex items-center justify-center"
            onClick={onSidebarToggle}
            aria-label="Toggle mobile menu"
            aria-expanded={sidebarOpen}
            aria-controls="mobile-sidebar"
          >
            <Menu className="h-5 w-5" />
          </ActionButton>
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold">Freight Dashboard</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
} 