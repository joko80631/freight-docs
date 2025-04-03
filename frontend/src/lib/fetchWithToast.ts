import { toast } from '@/components/ui/use-toast';

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
      toast({
        title: successMessage,
        variant: 'default',
      });
    }

    return data as T;
  } catch (error) {
    toast({
      title: errorMessage || 'An error occurred',
      description: error instanceof Error ? error.message : 'Unknown error',
      variant: 'destructive',
    });
    throw error;
  }
} 