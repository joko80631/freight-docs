import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "",
        elevated: "shadow-md",
      },
      hover: {
        true: "transition-all hover:shadow-md",
        false: "",
      },
      padding: {
        default: "p-6",
        none: "",
        sm: "p-4",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      hover: false,
      padding: "default",
    },
  }
);

interface CardProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof cardVariants> {
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  contentClassName?: string;
}

export function Card({
  title,
  description,
  footer,
  hover,
  variant,
  padding,
  className,
  contentClassName,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(cardVariants({ variant, hover, padding, className }))}
      {...props}
    >
      {(title || description) && (
        <div className="flex flex-col space-y-1.5 p-6">
          {title && (
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className={cn(padding === "default" ? "pt-0" : "", contentClassName)}>
        {children}
      </div>
      {footer && (
        <div className="flex items-center p-6 pt-0">{footer}</div>
      )}
    </div>
  );
} 