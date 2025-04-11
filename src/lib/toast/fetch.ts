import { toast } from 'sonner';
import { getErrorMessage } from './index';

interface FetchWithToastOptions extends RequestInit {
  successMessage?: string;
  errorMessage?: string;
  loadingMessage?: string;
}

export async function fetchWithToast<T>(
  url: string,
  options: FetchWithToastOptions = {}
): Promise<T> {
  const {
    successMessage,
    errorMessage,
    loadingMessage = 'Loading...',
    ...fetchOptions
  } = options;

  const toastId = toast.loading(loadingMessage);

  try {
    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMsg = errorData?.message || errorMessage || `HTTP error! status: ${response.status}`;
      throw new Error(errorMsg);
    }

    const data = await response.json();

    if (successMessage) {
      toast.success(successMessage, { id: toastId });
    } else {
      toast.dismiss(toastId);
    }

    return data as T;
  } catch (error) {
    toast.error('Error', {
      id: toastId,
      description: getErrorMessage(error)
    });
    throw error;
  }
} 