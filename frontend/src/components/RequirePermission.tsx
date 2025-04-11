import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Permission } from '@/types/permissions';
import { UnauthorizedAccess } from './UnauthorizedAccess';

interface RequirePermissionProps {
  children: ReactNode;
  permission: Permission | Permission[];
  fallback?: ReactNode;
  message?: string;
}

export function RequirePermission({
  children,
  permission,
  fallback,
  message,
}: RequirePermissionProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  const hasAccess = Array.isArray(permission)
    ? permission.length === 1
      ? hasPermission(permission[0])
      : hasAllPermissions(permission)
    : hasPermission(permission);

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <UnauthorizedAccess message={message} />;
  }

  return <>{children}</>;
} 