import { toast } from 'sonner';
import { getErrorMessage } from './errors';

export interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface PromiseToastOptions<T> {
  loading?: string;
  success?: string;
  error?: string;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export const showToast = {
  success: (title: string, options?: ToastOptions) => {
    toast.success(title, {
      description: options?.description,
      duration: options?.duration ?? 4000,
      action: options?.action,
    });
  },
  
  error: (title: string, options?: ToastOptions) => {
    toast.error(title, {
      description: options?.description,
      duration: options?.duration ?? 5000,
      action: options?.action,
    });
  },
  
  loading: (title: string, options?: ToastOptions) => {
    return toast.loading(title, {
      description: options?.description,
      action: options?.action,
    });
  },
  
  info: (title: string, options?: ToastOptions) => {
    toast(title, {
      description: options?.description,
      duration: options?.duration ?? 4000,
      action: options?.action,
    });
  },
  
  warning: (title: string, options?: ToastOptions) => {
    toast.warning(title, {
      description: options?.description,
      duration: options?.duration ?? 4000,
      action: options?.action,
    });
  },
  
  promise: async <T>(
    promise: Promise<T>,
    options: PromiseToastOptions<T> = {}
  ): Promise<T> => {
    const {
      loading = 'Loading...',
      success = 'Completed successfully',
      error = 'Something went wrong',
      onSuccess,
      onError,
    } = options;

    const toastId = toast.loading(loading);

    try {
      const result = await promise;
      toast.success(success, { id: toastId });
      if (onSuccess) {
        onSuccess(result);
      }
      return result;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(error, { 
        id: toastId,
        description: errorMessage
      });
      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage));
      }
      throw err;
    }
  },
  
  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  },
  
  handleError: (error: unknown, defaultMessage = 'An error occurred') => {
    const message = getErrorMessage(error) || defaultMessage;
    toast.error('Error', { description: message });
    return message;
  },
}; 