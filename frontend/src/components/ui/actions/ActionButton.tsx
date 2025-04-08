import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2, ArrowRight } from "lucide-react";

const actionButtonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black disabled:opacity-50 disabled:pointer-events-none gap-2 group",
  {
    variants: {
      variant: {
        primary: "bg-black text-white hover:bg-black/90",
        white: "bg-white text-black border border-black/10 hover:bg-gray-50",
        outline: "border border-black bg-white text-black hover:bg-gray-50",
        ghost: "text-black hover:bg-gray-50",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-8",
      },
      iconPosition: {
        left: "gap-2",
        right: "gap-2 flex-row-reverse",
      },
      withArrow: {
        true: "group",
        false: "",
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      iconPosition: "left",
      withArrow: false,
    },
  }
);

export interface ActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof actionButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  withArrow?: boolean;
}

const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  (
    {
      className,
      variant,
      size,
      iconPosition,
      withArrow,
      asChild = false,
      loading = false,
      icon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(actionButtonVariants({ variant, size, iconPosition, withArrow, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        )}
        {icon && !loading && icon}
        {children}
        {withArrow && !loading && (
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        )}
      </Comp>
    );
  }
);

ActionButton.displayName = "ActionButton";

export { ActionButton, actionButtonVariants }; 