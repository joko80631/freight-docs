import useSWR from "swr";
import { useCallback } from "react";

interface UseCustomSWROptions<T> {
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  refreshInterval?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useCustomSWR<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  options: UseCustomSWROptions<T> = {}
) {
  const {
    data,
    error,
    isLoading,
    mutate,
    isValidating,
  } = useSWR<T>(key, fetcher, {
    revalidateOnFocus: options.revalidateOnFocus ?? true,
    revalidateOnReconnect: options.revalidateOnReconnect ?? true,
    refreshInterval: options.refreshInterval,
    onSuccess: options.onSuccess,
    onError: options.onError,
  });

  const refresh = useCallback(() => {
    return mutate();
  }, [mutate]);

  return {
    data,
    error,
    isLoading,
    isValidating,
    refresh,
    mutate,
  };
} 