import { supabase } from '../config/supabase.js';
import { z } from 'zod';
import { TeamService } from './teamService.js';

// Validation schemas
const createLoadSchema = z.object({
  teamId: z.string().uuid("Invalid team ID"),
  origin: z.string().min(1, "Origin is required"),
  destination: z.string().min(1, "Destination is required"),
  pickup_date: z.string().datetime("Invalid pickup date"),
  delivery_date: z.string().datetime("Invalid delivery date"),
  status: z.enum(['PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']).default('PENDING'),
  weight: z.number().min(0, "Weight must be positive").optional(),
  dimensions: z.object({
    length: z.number().min(0, "Length must be positive").optional(),
    width: z.number().min(0, "Width must be positive").optional(),
    height: z.number().min(0, "Height must be positive").optional()
  }).optional(),
  special_instructions: z.string().max(500, "Special instructions too long").optional()
});

const updateLoadSchema = z.object({
  origin: z.string().min(1, "Origin is required").optional(),
  destination: z.string().min(1, "Destination is required").optional(),
  pickup_date: z.string().datetime("Invalid pickup date").optional(),
  delivery_date: z.string().datetime("Invalid delivery date").optional(),
  status: z.enum(['PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']).optional(),
  weight: z.number().min(0, "Weight must be positive").optional(),
  dimensions: z.object({
    length: z.number().min(0, "Length must be positive").optional(),
    width: z.number().min(0, "Width must be positive").optional(),
    height: z.number().min(0, "Height must be positive").optional()
  }).optional(),
  special_instructions: z.string().max(500, "Special instructions too long").optional()
});

export class LoadService {
  /**
   * Create a new load for a user
   * @param {string} userId - The ID of the user creating the load
   * @param {Object} data - The load data
   * @returns {Promise<Object>} The created load
   */
  static async createLoad(userId, data) {
    const validatedData = createLoadSchema.parse(data);

    // Verify team access
    const hasAccess = await TeamService.verifyTeamAccess(userId, validatedData.teamId);
    if (!hasAccess) {
      throw new Error('Access denied: Not a team member');
    }

    const { data: load, error } = await supabase
      .from('loads')
      .insert({
        ...validatedData,
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;
    return load;
  }

  /**
   * Get all loads for a user
   * @param {string} userId - The ID of the user
   * @returns {Promise<Array>} Array of loads
   */
  static async getLoads(userId, teamId) {
    // Verify team access
    const hasAccess = await TeamService.verifyTeamAccess(userId, teamId);
    if (!hasAccess) {
      throw new Error('Access denied: Not a team member');
    }

    const { data, error } = await supabase
      .from('loads')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get a load by ID with its documents
   * @param {string} userId - The ID of the user
   * @param {string} loadId - The ID of the load
   * @returns {Promise<Object>} The load with its documents
   */
  static async getLoadById(teamId, loadId) {
    const { data, error } = await supabase
      .from('loads')
      .select('*')
      .eq('id', loadId)
      .eq('team_id', teamId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Verify load ownership
   * @param {string} userId - The ID of the user
   * @param {string} loadId - The ID of the load
   * @returns {Promise<boolean>} Whether the user owns the load
   */
  static async verifyLoadAccess(userId, teamId, loadId) {
    const { data: load } = await supabase
      .from('loads')
      .select('team_id')
      .eq('id', loadId)
      .single();

    if (!load) return false;

    return await TeamService.verifyTeamAccess(userId, load.team_id);
  }

  static async updateLoad(teamId, loadId, userId, data) {
    const validatedData = updateLoadSchema.parse(data);

    // Verify team access
    const hasAccess = await TeamService.verifyTeamAccess(userId, teamId);
    if (!hasAccess) {
      throw new Error('Access denied: Not a team member');
    }

    const { data: load, error } = await supabase
      .from('loads')
      .update(validatedData)
      .eq('id', loadId)
      .eq('team_id', teamId)
      .select()
      .single();

    if (error) throw error;
    return load;
  }

  static async deleteLoad(teamId, loadId, userId) {
    // Verify team access
    const hasAccess = await TeamService.verifyTeamAccess(userId, teamId);
    if (!hasAccess) {
      throw new Error('Access denied: Not a team member');
    }

    const { error } = await supabase
      .from('loads')
      .delete()
      .eq('id', loadId)
      .eq('team_id', teamId);

    if (error) throw error;
  }
} 