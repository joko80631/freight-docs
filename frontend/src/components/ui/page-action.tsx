import { cn } from "@/lib/utils";
import { Button } from "./button";
import { LucideIcon } from "lucide-react";

interface PageActionProps {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: "default" | "secondary" | "outline";
  className?: string;
}

export function PageAction({
  label,
  onClick,
  icon: Icon,
  variant = "default",
  className,
}: PageActionProps) {
  return (
    <div className={cn("flex justify-end mb-4 sm:mb-6", className)}>
      <Button onClick={onClick} variant={variant}>
        {Icon && <Icon className="mr-2 h-4 w-4" />}
        {label}
      </Button>
    </div>
  );
} 