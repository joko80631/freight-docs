import { toast } from 'sonner';

interface ToastOptions {
  description?: string;
  duration?: number;
}

interface PromiseToastOptions {
  loading?: string;
  success?: string;
  error?: string;
}

// Helper function to extract error messages
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'An unexpected error occurred';
}

export const showToast = {
  success: (title: string, description?: string) => {
    toast.success(title, {
      description,
      duration: 4000,
    });
  },
  
  error: (title: string, description?: string) => {
    toast.error(title, {
      description,
      duration: 5000,
    });
  },
  
  loading: (title: string, description?: string) => {
    return toast.loading(title, {
      description,
    });
  },
  
  info: (title: string, description?: string) => {
    toast(title, {
      description,
      duration: 4000,
    });
  },
  
  warning: (title: string, description?: string) => {
    toast.warning(title, {
      description,
      duration: 4000,
    });
  },
  
  promise: async <T>(
    promise: Promise<T>,
    options: PromiseToastOptions = {}
  ): Promise<T> => {
    const {
      loading = 'Loading...',
      success = 'Completed successfully',
      error = 'Something went wrong'
    } = options;

    const toastId = toast.loading(loading);

    try {
      const result = await promise;
      toast.success(success, { id: toastId });
      return result;
    } catch (err) {
      toast.error(error, { id: toastId });
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