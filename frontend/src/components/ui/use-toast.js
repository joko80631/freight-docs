"use client"

import { useState, useEffect } from "react"

import { Toast, ToastProvider, ToastViewport } from "@/components/ui/toast"

export function useToast() {
  const [toasts, setToasts] = useState([])

  const toast = ({ title, description, variant, duration = 5000 }) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prevToasts) => [...prevToasts, { id, title, description, variant, duration }])
    
    return id
  }

  const dismiss = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }

  const Toaster = () => {
    return (
      <ToastProvider>
        {toasts.map(({ id, title, description, variant, duration }) => (
          <Toast key={id} variant={variant}>
            {title && <div className="font-medium">{title}</div>}
            {description && <div className="mt-1">{description}</div>}
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    )
  }

  return { toast, dismiss, Toaster }
} 