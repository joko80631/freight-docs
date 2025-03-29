import { supabase } from '../index.js';

export const LoadService = {
  /**
   * Create a new load for a user
   * @param {string} userId - The ID of the user creating the load
   * @param {Object} data - The load data
   * @returns {Promise<Object>} The created load
   */
  createLoad: async (userId, data) => {
    const { data: load, error } = await supabase
      .from('loads')
      .insert([{
        ...data,
        user_id: userId
      }])
      .select()
      .single();

    if (error) throw error;
    return load;
  },

  /**
   * Get all loads for a user
   * @param {string} userId - The ID of the user
   * @returns {Promise<Array>} Array of loads
   */
  getAllLoads: async (userId) => {
    const { data, error } = await supabase
      .from('loads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get a load by ID with its documents
   * @param {string} userId - The ID of the user
   * @param {string} loadId - The ID of the load
   * @returns {Promise<Object>} The load with its documents
   */
  getLoadById: async (userId, loadId) => {
    const { data, error } = await supabase
      .from('loads')
      .select(`
        *,
        documents (
          id,
          file_url,
          type,
          status,
          uploaded_at
        )
      `)
      .eq('id', loadId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    if (!data) {
      throw new Error('Load not found');
    }

    return data;
  },

  /**
   * Verify load ownership
   * @param {string} userId - The ID of the user
   * @param {string} loadId - The ID of the load
   * @returns {Promise<boolean>} Whether the user owns the load
   */
  verifyLoadOwnership: async (userId, loadId) => {
    const { data, error } = await supabase
      .from('loads')
      .select('id')
      .eq('id', loadId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return !!data;
  }
}; 