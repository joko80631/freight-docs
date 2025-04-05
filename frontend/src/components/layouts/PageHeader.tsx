"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { format } from "date-fns";

export function PageHeader() {
  const pathname = usePathname();
  const [currentDate, setCurrentDate] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const getPageTitle = () => {
    const path = pathname.split("/")[1];
    return path.charAt(0).toUpperCase() + path.slice(1) || "Dashboard";
  };

  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold tracking-tight">
        {getPageTitle()}
      </h1>
      <p className="text-sm text-muted-foreground">
        {format(currentDate, "EEEE, MMMM d, yyyy")}
      </p>
    </div>
  );
} 