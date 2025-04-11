"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <div
    role="progressbar"
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={value}
    className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200"
  >
    <div
      ref={ref}
      className={`h-full w-full flex-1 transition-all ${
        value >= 100 ? 'bg-green-500' : 'bg-blue-500'
      }`}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </div>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress } 