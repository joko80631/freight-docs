import { toast } from 'sonner';

interface ToastOptions {
  duration?: number;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface PromiseOptions<T> {
  loading?: string;
  success?: string;
  error?: string;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useToast() {
  const showSuccess = (title: string, options?: ToastOptions) => {
    toast.success(title, {
      description: options?.description,
      duration: options?.duration ?? 4000,
      action: options?.action,
    });
  };

  const showError = (title: string, options?: ToastOptions) => {
    toast.error(title, {
      description: options?.description,
      duration: options?.duration ?? 5000,
      action: options?.action,
    });
  };

  const showLoading = (title: string, options?: ToastOptions) => {
    return toast.loading(title, {
      description: options?.description,
      action: options?.action,
    });
  };

  const showInfo = (title: string, options?: ToastOptions) => {
    toast(title, {
      description: options?.description,
      duration: options?.duration ?? 4000,
      action: options?.action,
    });
  };

  const showWarning = (title: string, options?: ToastOptions) => {
    toast.warning(title, {
      description: options?.description,
      duration: options?.duration ?? 4000,
      action: options?.action,
    });
  };

  const showPromise = async <T>(
    promise: Promise<T>,
    options: PromiseOptions<T> = {}
  ) => {
    const {
      loading = 'Loading...',
      success = 'Completed successfully',
      error = 'Something went wrong',
      onSuccess,
      onError,
    } = options;

    try {
      const result = await toast.promise(promise, {
        loading,
        success,
        error,
      });
      
      if (onSuccess) {
        onSuccess(result as T);
      }
      return result as T;
    } catch (err) {
      if (onError) {
        onError(err instanceof Error ? err : new Error(String(err)));
      }
      throw err;
    }
  };

  const dismiss = (toastId: string) => {
    toast.dismiss(toastId);
  };

  return {
    showSuccess,
    showError,
    showLoading,
    showInfo,
    showWarning,
    showPromise,
    dismiss,
    // Also export the raw toast function for advanced use cases
    toast
  };
} 