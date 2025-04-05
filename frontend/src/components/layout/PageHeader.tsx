"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ 
  title, 
  description, 
  actions,
  className
}: PageHeaderProps) {
  const pathname = usePathname();
  const [currentDate, setCurrentDate] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const getPageTitle = () => {
    if (title) return title;
    
    const path = pathname.split("/")[1];
    return path.charAt(0).toUpperCase() + path.slice(1) || "Dashboard";
  };

  return (
    <div className={cn(
      "flex flex-col md:flex-row md:items-center md:justify-between gap-4",
      className
    )}>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{getPageTitle()}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {!description && (
          <p className="text-sm text-muted-foreground">
            {format(currentDate, "EEEE, MMMM d, yyyy")}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
} 