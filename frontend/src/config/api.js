// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// API Endpoints
export const API_ENDPOINTS = {
  documents: {
    classify: `${API_BASE_URL}/api/documents/classify`,
    upload: `${API_BASE_URL}/api/documents/upload`,
    list: `${API_BASE_URL}/api/documents`,
    delete: (id) => `${API_BASE_URL}/api/documents/${id}`,
  },
  loads: {
    list: `${API_BASE_URL}/api/loads`,
    create: `${API_BASE_URL}/api/loads`,
    get: (id) => `${API_BASE_URL}/api/loads/${id}`,
    update: (id) => `${API_BASE_URL}/api/loads/${id}`,
    delete: (id) => `${API_BASE_URL}/api/loads/${id}`,
  },
};

// API Headers
export const getApiHeaders = (token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}; 