"use client"

import { useState, useEffect } from "react"
import { Toast, ToastProvider, ToastViewport } from "@/components/ui/toast"

// Create singleton state for toast management
const toasts = [];
let listeners = [];

// Export direct toast function for ease of use
export const toast = ({ title, description, variant, duration = 5000 }) => {
  const id = Math.random().toString(36).substring(2, 9)
  toasts.push({ id, title, description, variant, duration });
  listeners.forEach(setToastsFunc => setToastsFunc([...toasts]));
  
  setTimeout(() => {
    const index = toasts.findIndex(t => t.id === id);
    if (index !== -1) {
      toasts.splice(index, 1);
      listeners.forEach(setToastsFunc => setToastsFunc([...toasts]));
    }
  }, duration);
  
  return id;
}

export function useToast() {
  const [localToasts, setLocalToasts] = useState(toasts);

  useEffect(() => {
    listeners.push(setLocalToasts);
    return () => {
      listeners = listeners.filter(l => l !== setLocalToasts);
    };
  }, []);

  const dismiss = (id) => {
    const index = toasts.findIndex(t => t.id === id);
    if (index !== -1) {
      toasts.splice(index, 1);
      listeners.forEach(setToastsFunc => setToastsFunc([...toasts]));
    }
  }

  const Toaster = () => {
    return (
      <ToastProvider>
        {localToasts.map(({ id, title, description, variant }) => (
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