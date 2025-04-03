import { useAuth } from '@/hooks/useAuth';

export function usePermissions() {
  const { user } = useAuth();

  const canReclassify = user?.role === 'admin' || user?.role === 'manager';

  return {
    canReclassify,
  };
} 