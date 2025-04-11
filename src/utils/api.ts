import { useTeamStore } from '../store/team-store';

/**
 * Get API headers for authenticated requests
 * @returns {Object} Headers object with content type and authorization
 */
export const getApiHeaders = (): HeadersInit => {
  return {
    'Content-Type': 'application/json',
  };
};

/**
 * Handle API response and return JSON or throw error
 * @param {Response} response - Fetch API response
 * @returns {Promise<any>} JSON response
 */
export const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'API request failed');
  }
  return response.json();
};

interface TeamScopedApi {
  get: <T>(endpoint: string) => Promise<T>;
  post: <T>(endpoint: string, data: unknown) => Promise<T>;
  patch: <T>(endpoint: string, data: unknown) => Promise<T>;
  delete: <T>(endpoint: string) => Promise<T>;
  upload: <T>(endpoint: string, file: File) => Promise<T>;
}

export const createTeamScopedApi = (): TeamScopedApi => {
  const { currentTeam } = useTeamStore.getState();

  if (!currentTeam) {
    throw new Error('No team selected');
  }

  const teamId = currentTeam.id;

  return {
    get: async <T>(endpoint: string): Promise<T> => {
      const response = await fetch(`/api/teams/${teamId}${endpoint}`);
      if (!response.ok) throw new Error('API request failed');
      return response.json();
    },

    post: async <T>(endpoint: string, data: unknown): Promise<T> => {
      const response = await fetch(`/api/teams/${teamId}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('API request failed');
      return response.json();
    },

    patch: async <T>(endpoint: string, data: unknown): Promise<T> => {
      const response = await fetch(`/api/teams/${teamId}${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('API request failed');
      return response.json();
    },

    delete: async <T>(endpoint: string): Promise<T> => {
      const response = await fetch(`/api/teams/${teamId}${endpoint}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('API request failed');
      return response.json();
    },

    upload: async <T>(endpoint: string, file: File): Promise<T> => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/teams/${teamId}${endpoint}`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('API request failed');
      return response.json();
    }
  };
}; 