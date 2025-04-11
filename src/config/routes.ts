export const routes = {
  auth: {
    login: '/login',
    register: '/register',
    verifyEmail: '/verify-email',
    resetPassword: '/reset-password',
  },
  dashboard: '/dashboard',
  loads: {
    index: '/loads',
    create: '/loads/create',
    detail: (id: string) => `/loads/${id}`,
    edit: (id: string) => `/loads/${id}/edit`,
  },
  documents: {
    index: '/documents',
    upload: '/document-upload',
    detail: (id: string) => `/documents/${id}`,
    edit: (id: string) => `/documents/${id}/edit`,
  },
  teams: {
    index: '/teams',
    select: '/teams/select',
    create: '/teams/create',
    settings: '/settings/team',
    members: (teamId: string) => `/teams/${teamId}/members`,
    invite: (teamId: string) => `/teams/${teamId}/invite`,
  },
  settings: {
    index: '/settings',
    profile: '/settings/profile',
    notifications: '/settings/notifications',
    team: '/settings/team',
  },
  support: '/support',
  reports: '/reports',
  fleet: {
    index: '/fleet',
    detail: (id: string) => `/fleet/${id}`,
  },
  comingSoon: (feature: string) => `/coming-soon/${feature}`,
} as const;

// Type helper for route parameters
export type RouteParams<T extends string> = T extends `${infer Start}:${infer Param}${infer Rest}`
  ? Param extends ''
    ? RouteParams<Rest>
    : { [K in Param]: string } & RouteParams<Rest>
  : {};

// Type-safe route builder - removed as it's not being used
// If needed in the future, implement with proper typing 