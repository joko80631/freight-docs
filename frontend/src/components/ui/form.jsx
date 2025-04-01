"use client"

import * as React from "react"
import { useFormContext } from "react-hook-form"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <form
      ref={ref}
      className={cn("space-y-4", className)}
      {...props}
    />
  )
})
Form.displayName = "Form"

const FormItem = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("space-y-2", className)}
      {...props}
    />
  )
})
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <Label
      ref={ref}
      className={cn(className)}
      {...props}
    />
  )
})
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef(({ ...props }, ref) => {
  return (
    <div
      ref={ref}
      className="mt-1"
      {...props}
    />
  )
})
FormControl.displayName = "FormControl"

const FormMessage = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {children}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

const FormField = ({ name, ...props }) => {
  const { control } = useFormContext()
  return (
    <div {...props} />
  )
}

export {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
} 