import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import React from "react";

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> {
  side?: "top" | "right" | "bottom" | "left";
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ className, side = "right", children, ...props }, ref) => (
  <SheetPrimitive.Portal>
    <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 h-full w-80 bg-white p-6 shadow-lg outline-none transition-transform duration-300",
        side === "right" && "right-0 top-0 translate-x-0",
        side === "left" && "left-0 top-0 -translate-x-0",
        side === "top" && "top-0 left-0 right-0 h-auto -translate-y-0",
        side === "bottom" && "bottom-0 left-0 right-0 h-auto translate-y-0",
        className
      )}
      {...props}
    >
      {children}
    </SheetPrimitive.Content>
  </SheetPrimitive.Portal>
));

SheetContent.displayName = "SheetContent";

export { Sheet, SheetTrigger, SheetContent }; 