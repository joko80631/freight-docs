import { useState, useCallback } from 'react';

interface ToastOptions {
  title: string;
  description?: string | React.ReactNode;
  variant?: 'default' | 'destructive';
}

interface Toast extends ToastOptions {
  id: string;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ title, description, variant = 'default' }: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, title, description, variant };
    
    setToasts((prevToasts) => [...prevToasts, newToast]);
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
  }, []);

  return {
    toast,
    dismissToast,
    toasts,
  };
} 