import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const sectionVariants = cva("space-y-6", {
  variants: {
    variant: {
      default: "",
      bordered: "border-b pb-6",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface SectionProps 
  extends React.ComponentPropsWithoutRef<"section">,
    VariantProps<typeof sectionVariants> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  headerClassName?: string;
  contentClassName?: string;
}

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ 
    title, 
    description, 
    actions, 
    variant,
    className, 
    headerClassName,
    contentClassName,
    children, 
    ...props 
  }, ref) => {
    return (
      <section 
        ref={ref} 
        className={cn(sectionVariants({ variant, className }))} 
        {...props}
      >
        <div className={cn(
          "flex items-center justify-between", 
          headerClassName
        )}>
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
        <div className={contentClassName}>{children}</div>
      </section>
    );
  }
);

Section.displayName = "Section"; 