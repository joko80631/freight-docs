export const routes = {
  dashboard: '/dashboard',
  loads: {
    list: '/loads',
    detail: (id: string) => `/loads/${id}`,
    create: '/loads/create',
    edit: (id: string) => `/loads/${id}/edit`,
  },
  // Add other route configurations as needed
} as const; 