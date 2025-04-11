import { toast } from 'sonner';
import { getErrorMessage } from './errors';

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
  
  promise: async (
    promise: Promise<any>,
    {
      loading = 'Loading...',
      success = 'Completed successfully',
      error = 'Something went wrong',
    }: {
      loading?: string;
      success?: string;
      error?: string;
    } = {}
  ): Promise<any> => {
    return toast.promise(promise, {
      loading,
      success,
      error,
    });
  },
  
  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  },
  
  // Helper for handling errors in try/catch blocks
  handleError: (error: unknown, defaultMessage = 'An error occurred') => {
    const message = getErrorMessage(error) || defaultMessage;
    toast.error('Error', { description: message });
    return message;
  },
}; 