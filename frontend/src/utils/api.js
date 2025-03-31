/**
 * Get API headers for authenticated requests
 * @returns {Object} Headers object with content type and authorization
 */
export const getApiHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};

/**
 * Handle API response and return JSON or throw error
 * @param {Response} response - Fetch API response
 * @returns {Promise<any>} JSON response
 */
export const handleApiResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'API request failed');
  }
  return response.json();
};

import useTeamStore from '../store/teamStore';

export const createTeamScopedApi = () => {
  const { teamId } = useTeamStore.getState();

  if (!teamId) {
    throw new Error('No team selected');
  }

  return {
    get: async (endpoint) => {
      const response = await fetch(`/api/teams/${teamId}${endpoint}`);
      if (!response.ok) throw new Error('API request failed');
      return response.json();
    },

    post: async (endpoint, data) => {
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

    patch: async (endpoint, data) => {
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

    delete: async (endpoint) => {
      const response = await fetch(`/api/teams/${teamId}${endpoint}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('API request failed');
      return response.json();
    },

    upload: async (endpoint, file) => {
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