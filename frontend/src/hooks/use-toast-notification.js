import { toast } from 'sonner';

export function useToastNotification() {
  const showSuccess = (title, description) => {
    toast.success(title, {
      description
    });
  };

  const showError = (title, description) => {
    toast.error(title, {
      description
    });
  };

  const showLoading = (title, description) => {
    toast.loading(title, {
      description
    });
  };

  return {
    showSuccess,
    showError,
    showLoading,
  };
} 