import useSWR from "swr";
import { useCallback } from "react";

export interface SWRConfig {
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  refreshInterval?: number;
  retryCount?: number;
  retryDelay?: number;
}

const defaultConfig: SWRConfig = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  refreshInterval: 0,
  retryCount: 3,
  retryDelay: 1000,
};

export function useCustomSWR<T>(
  key: string | null,
  fetcher: (url: string) => Promise<T>,
  config?: SWRConfig
) {
  const mergedConfig = { ...defaultConfig, ...config };

  const { data, error, isLoading, mutate } = useSWR<T>(
    key,
    fetcher,
    {
      revalidateOnFocus: mergedConfig.revalidateOnFocus,
      revalidateOnReconnect: mergedConfig.revalidateOnReconnect,
      refreshInterval: mergedConfig.refreshInterval,
      retry: (retryCount: number) => {
        if (retryCount >= (mergedConfig.retryCount ?? 3)) return false;
        return true;
      },
      retryDelay: mergedConfig.retryDelay,
    }
  );

  const optimisticUpdate = useCallback(
    async (newData: T) => {
      await mutate(newData, false);
    },
    [mutate]
  );

  return {
    data,
    error,
    isLoading,
    mutate,
    optimisticUpdate,
  };
} 