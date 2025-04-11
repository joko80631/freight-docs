export const routes = {
  dashboard: '/dashboard',
  loads: {
    index: '/loads',
    list: '/loads',
    detail: (id: string) => `/loads/${id}`,
    create: '/loads/create',
    edit: (id: string) => `/loads/${id}/edit`,
  },
  documents: {
    index: '/documents',
    list: '/documents',
    detail: (id: string) => `/documents/${id}`,
    create: '/documents/create',
    edit: (id: string) => `/documents/${id}/edit`,
  },
  teams: {
    index: '/teams',
    list: '/teams',
    detail: (id: string) => `/teams/${id}`,
    create: '/teams/create',
    edit: (id: string) => `/teams/${id}/edit`,
    join: '/teams/join',
  },
  settings: {
    index: '/settings',
    profile: '/settings/profile',
    security: '/settings/security',
    notifications: '/settings/notifications',
    billing: '/settings/billing',
  },
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  support: '/support',
  comingSoon: (feature: string) => `/coming-soon/${feature}`,
  // Add other route configurations as needed
} as const; 