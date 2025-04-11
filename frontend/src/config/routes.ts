export const routes = {
  dashboard: '/dashboard',
  loads: {
    list: '/loads',
    detail: (id: string) => `/loads/${id}`,
    create: '/loads/create',
    edit: (id: string) => `/loads/${id}/edit`,
  },
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  // Add other route configurations as needed
} as const; 