import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "default",
  className = "",
}) {
  const variants = {
    default: "flex flex-col items-center justify-center p-8 text-center",
    table: "flex flex-col items-center justify-center py-12 text-center",
    card: "flex flex-col items-center justify-center p-6 text-center",
  };

  return (
    <div className={cn(variants[variant], className)}>
      {Icon && (
        <div className="mb-4 rounded-full bg-muted p-3">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// Pre-built empty states for common scenarios
export function NoDataEmptyState({
  title = "No data found",
  description = "Get started by adding some data",
  action,
  ...props
}) {
  return (
    <EmptyState
      icon={LucideIcon}
      title={title}
      description={description}
      action={action}
      {...props}
    />
  );
}

export function NoResultsEmptyState({
  title = "No results found",
  description = "Try adjusting your search or filters",
  action,
  ...props
}) {
  return (
    <EmptyState
      icon={LucideIcon}
      title={title}
      description={description}
      action={action}
      {...props}
    />
  );
}

export function ErrorEmptyState({
  title = "Something went wrong",
  description = "Try refreshing the page or contact support",
  action,
  ...props
}) {
  return (
    <EmptyState
      icon={LucideIcon}
      title={title}
      description={description}
      action={action}
      {...props}
    />
  );
} 