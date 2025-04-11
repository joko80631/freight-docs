import { useAuth } from '@/hooks/useAuth';

export type Resource = 'items' | 'teams' | 'users' | 'settings';
export type Action = 'create' | 'read' | 'update' | 'delete' | 'manage' | 'reclassify';

export interface Permission {
  action: Action;
  resource: Resource;
}

export const PERMISSIONS = {
  // Item permissions
  RECLASSIFY_ITEMS: { action: 'reclassify' as Action, resource: 'items' as Resource },
  CREATE_ITEMS: { action: 'create' as Action, resource: 'items' as Resource },
  READ_ITEMS: { action: 'read' as Action, resource: 'items' as Resource },
  UPDATE_ITEMS: { action: 'update' as Action, resource: 'items' as Resource },
  DELETE_ITEMS: { action: 'delete' as Action, resource: 'items' as Resource },
  
  // Team permissions
  CREATE_TEAMS: { action: 'create' as Action, resource: 'teams' as Resource },
  READ_TEAMS: { action: 'read' as Action, resource: 'teams' as Resource },
  UPDATE_TEAMS: { action: 'update' as Action, resource: 'teams' as Resource },
  DELETE_TEAMS: { action: 'delete' as Action, resource: 'teams' as Resource },
  MANAGE_TEAMS: { action: 'manage' as Action, resource: 'teams' as Resource },
  
  // User permissions
  CREATE_USERS: { action: 'create' as Action, resource: 'users' as Resource },
  READ_USERS: { action: 'read' as Action, resource: 'users' as Resource },
  UPDATE_USERS: { action: 'update' as Action, resource: 'users' as Resource },
  DELETE_USERS: { action: 'delete' as Action, resource: 'users' as Resource },
  MANAGE_USERS: { action: 'manage' as Action, resource: 'users' as Resource },
  
  // Settings permissions
  READ_SETTINGS: { action: 'read' as Action, resource: 'settings' as Resource },
  UPDATE_SETTINGS: { action: 'update' as Action, resource: 'settings' as Resource },
} as const;

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: Object.values(PERMISSIONS),
  manager: [
    PERMISSIONS.RECLASSIFY_ITEMS,
    PERMISSIONS.CREATE_ITEMS,
    PERMISSIONS.READ_ITEMS,
    PERMISSIONS.UPDATE_ITEMS,
    PERMISSIONS.READ_TEAMS,
    PERMISSIONS.READ_USERS,
    PERMISSIONS.READ_SETTINGS,
  ],
  member: [
    PERMISSIONS.READ_ITEMS,
    PERMISSIONS.READ_TEAMS,
    PERMISSIONS.READ_SETTINGS,
  ],
};

export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    if (!user?.role) return false;
    
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    return rolePermissions.some(
      p => p.action === permission.action && p.resource === permission.resource
    );
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(hasPermission);
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(hasPermission);
  };

  // Convenience methods for common permission checks
  const canReclassify = hasPermission(PERMISSIONS.RECLASSIFY_ITEMS);
  const canManageTeams = hasPermission(PERMISSIONS.MANAGE_TEAMS);
  const canManageUsers = hasPermission(PERMISSIONS.MANAGE_USERS);
  const canUpdateSettings = hasPermission(PERMISSIONS.UPDATE_SETTINGS);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canReclassify,
    canManageTeams,
    canManageUsers,
    canUpdateSettings,
    PERMISSIONS,
  };
} 