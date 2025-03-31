import { supabase } from '../config/supabase.js';
import { z } from 'zod';

// Validation schemas
const createTeamSchema = z.object({
  name: z.string().min(1, "Team name is required").max(100, "Team name is too long")
});

const updateTeamSchema = z.object({
  name: z.string().min(1, "Team name is required").max(100, "Team name is too long")
});

const teamMemberSchema = z.object({
  role: z.enum(['ADMIN', 'MANAGER', 'USER'])
});

export class TeamService {
  static async createTeam(userId, data) {
    const validatedData = createTeamSchema.parse(data);
    
    // Create team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        name: validatedData.name,
        created_by: userId
      })
      .select()
      .single();

    if (teamError) throw teamError;

    // Add creator as admin
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: userId,
        role: 'ADMIN'
      });

    if (memberError) throw memberError;

    return team;
  }

  static async getUserTeams(userId) {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        team:teams (
          id,
          name,
          created_at,
          updated_at
        ),
        role
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data.map(item => ({ ...item.team, role: item.role }));
  }

  static async getTeamById(teamId) {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        members:team_members (
          user_id,
          role,
          user:users (
            email,
            full_name
          )
        )
      `)
      .eq('id', teamId)
      .single();

    if (error) throw error;
    return data;
  }

  static async addTeamMember(teamId, userId, role) {
    const validatedRole = teamMemberSchema.parse({ role }).role;

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('team_members')
      .select()
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .single();

    if (existingMember) {
      throw new Error('User is already a member of this team');
    }

    const { data, error } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: userId,
        role: validatedRole
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateTeamMemberRole(teamId, userId, role) {
    const validatedRole = teamMemberSchema.parse({ role }).role;

    // Check if user is a member
    const { data: member } = await supabase
      .from('team_members')
      .select()
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .single();

    if (!member) {
      throw new Error('User is not a member of this team');
    }

    const { data, error } = await supabase
      .from('team_members')
      .update({ role: validatedRole })
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async removeTeamMember(teamId, userId) {
    // Check if user is a member
    const { data: member } = await supabase
      .from('team_members')
      .select()
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .single();

    if (!member) {
      throw new Error('User is not a member of this team');
    }

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  static async getUserTeamRole(teamId, userId) {
    const { data, error } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data?.role;
  }

  static async isTeamAdmin(teamId, userId) {
    const role = await this.getUserTeamRole(teamId, userId);
    return role === 'ADMIN';
  }

  static async updateTeam(teamId, data) {
    const validatedData = updateTeamSchema.parse(data);

    const { data: team, error } = await supabase
      .from('teams')
      .update(validatedData)
      .eq('id', teamId)
      .select()
      .single();

    if (error) throw error;
    return team;
  }

  static async deleteTeam(teamId) {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);

    if (error) throw error;
  }

  static async verifyTeamAccess(userId, teamId) {
    const { data, error } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .single();

    if (error || !data) return false;
    return true;
  }
} 