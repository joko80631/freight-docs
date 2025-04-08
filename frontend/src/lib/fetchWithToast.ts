import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errors';

interface FetchWithToastOptions extends RequestInit {
  successMessage?: string;
  errorMessage?: string;
}

export async function fetchWithToast<T>(
  url: string,
  options: FetchWithToastOptions = {}
): Promise<T> {
  const { successMessage, errorMessage, ...fetchOptions } = options;

  try {
    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      throw new Error(errorMessage || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (successMessage) {
      toast.success(successMessage);
    }

    return data as T;
  } catch (error) {
    toast.error('Error', {
      description: getErrorMessage(error)
    });
    throw error;
  }
} 