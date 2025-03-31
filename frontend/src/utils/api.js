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