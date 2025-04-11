import { useCallback } from 'react';
import { showToast, ToastOptions, PromiseToastOptions } from '@/lib/toast';

export function useToast() {
  const success = useCallback((title: string, options?: ToastOptions) => {
    showToast.success(title, options);
  }, []);

  const error = useCallback((title: string, options?: ToastOptions) => {
    showToast.error(title, options);
  }, []);

  const loading = useCallback((title: string, options?: ToastOptions) => {
    return showToast.loading(title, options);
  }, []);

  const info = useCallback((title: string, options?: ToastOptions) => {
    showToast.info(title, options);
  }, []);

  const warning = useCallback((title: string, options?: ToastOptions) => {
    showToast.warning(title, options);
  }, []);

  const promise = useCallback(<T>(
    promise: Promise<T>,
    options?: PromiseToastOptions<T>
  ) => {
    return showToast.promise(promise, options);
  }, []);

  const dismiss = useCallback((toastId: string) => {
    showToast.dismiss(toastId);
  }, []);

  const handleError = useCallback((error: unknown, defaultMessage = 'An error occurred') => {
    return showToast.handleError(error, defaultMessage);
  }, []);

  return {
    success,
    error,
    loading,
    info,
    warning,
    promise,
    dismiss,
    handleError,
  };
} 