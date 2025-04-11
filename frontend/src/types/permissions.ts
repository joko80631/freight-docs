export type Resource = 
  | 'team'
  | 'team_member'
  | 'team_settings'
  | 'user'
  | 'settings';

export type Action = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'invite'
  | 'manage';

export interface Permission {
  resource: Resource;
  action: Action;
}

export const PERMISSIONS = {
  // Team permissions
  CREATE_TEAM: { resource: 'team', action: 'create' },
  READ_TEAM: { resource: 'team', action: 'read' },
  UPDATE_TEAM: { resource: 'team', action: 'update' },
  DELETE_TEAM: { resource: 'team', action: 'delete' },
  
  // Team member permissions
  INVITE_TEAM_MEMBER: { resource: 'team_member', action: 'invite' },
  READ_TEAM_MEMBER: { resource: 'team_member', action: 'read' },
  UPDATE_TEAM_MEMBER: { resource: 'team_member', action: 'update' },
  DELETE_TEAM_MEMBER: { resource: 'team_member', action: 'delete' },
  
  // Settings permissions
  READ_SETTINGS: { resource: 'settings', action: 'read' },
  UPDATE_SETTINGS: { resource: 'settings', action: 'update' },
} as const;

export type Role = 'owner' | 'admin' | 'member';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: Object.values(PERMISSIONS),
  admin: [
    PERMISSIONS.READ_TEAM,
    PERMISSIONS.UPDATE_TEAM,
    PERMISSIONS.INVITE_TEAM_MEMBER,
    PERMISSIONS.READ_TEAM_MEMBER,
    PERMISSIONS.UPDATE_TEAM_MEMBER,
    PERMISSIONS.DELETE_TEAM_MEMBER,
    PERMISSIONS.READ_SETTINGS,
    PERMISSIONS.UPDATE_SETTINGS,
  ],
  member: [
    PERMISSIONS.READ_TEAM,
    PERMISSIONS.READ_TEAM_MEMBER,
    PERMISSIONS.READ_SETTINGS,
  ],
}; 