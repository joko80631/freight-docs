import { useTeamStore } from '@/store/teamStore';
import { Permission, PERMISSIONS, ROLE_PERMISSIONS, Role } from '@/types/permissions';

export function usePermissions() {
  const { currentTeam } = useTeamStore();
  const userRole = (currentTeam?.role || 'member') as Role;

  const hasPermission = (permission: Permission): boolean => {
    const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
    return rolePermissions.some(
      (p: Permission) => p.resource === permission.resource && p.action === permission.action
    );
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(hasPermission);
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(hasPermission);
  };

  // Convenience methods for common permission checks
  const canManageTeam = () => hasPermission(PERMISSIONS.UPDATE_TEAM);
  const canDeleteTeam = () => hasPermission(PERMISSIONS.DELETE_TEAM);
  const canInviteMembers = () => hasPermission(PERMISSIONS.INVITE_TEAM_MEMBER);
  const canManageMembers = () => hasPermission(PERMISSIONS.UPDATE_TEAM_MEMBER);
  const canAccessSettings = () => hasPermission(PERMISSIONS.READ_SETTINGS);
  const canUpdateSettings = () => hasPermission(PERMISSIONS.UPDATE_SETTINGS);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canManageTeam,
    canDeleteTeam,
    canInviteMembers,
    canManageMembers,
    canAccessSettings,
    canUpdateSettings,
    userRole,
  };
} 