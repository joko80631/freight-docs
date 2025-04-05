import { cn } from "@/lib/utils";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageContainer({ children, className, ...props }: PageContainerProps) {
  return (
    <div 
      className={cn(
        "space-y-8 p-4 sm:p-6 lg:p-8",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
} 