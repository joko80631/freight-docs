export const routes = {
  // Auth
  login: '/login',
  register: '/register',
  
  // Teams
  teams: '/teams',
  teamSelect: '/teams/select',
  
  // Documents
  documents: '/documents',
  documentUpload: '/document-upload',
  documentDetail: (id: string) => `/documents/${id}`,
  
  // API
  api: {
    documentUpload: '/api/document-upload',
    documents: '/api/documents',
  }
} as const; 