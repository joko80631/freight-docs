import { toast } from 'sonner';

export function useToastNotification() {
  const showSuccess = (title, description) => {
    toast.success(title, {
      description,
      duration: 4000,
    });
  };

  const showError = (title, description) => {
    toast.error(title, {
      description,
      duration: 5000,
    });
  };

  const showLoading = (title, description) => {
    return toast.loading(title, {
      description,
    });
  };

  const showInfo = (title, description) => {
    toast(title, {
      description,
      duration: 4000,
    });
  };

  const showWarning = (title, description) => {
    toast.warning(title, {
      description,
      duration: 4000,
    });
  };

  const showPromise = async (promise, {
    loading = 'Loading...',
    success = 'Completed successfully',
    error = 'Something went wrong'
  }) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
    });
  };

  const dismiss = (toastId) => {
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