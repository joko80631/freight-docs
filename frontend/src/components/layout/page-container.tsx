import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div 
      className={cn(
        "w-full max-w-7xl mx-auto px-4 py-6 space-y-6",
        "sm:px-6 md:px-8",
        className
      )}
      data-testid="page-container"
    >
      {children}
    </div>
  );
} 