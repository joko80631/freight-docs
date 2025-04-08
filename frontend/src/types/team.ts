export type TeamRole = 'ADMIN' | 'MEMBER';

export interface Team {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface TeamMember {
  team_id: string;
  user_id: string;
  role: TeamRole;
  created_at: string;
  updated_at: string;
  profile?: {
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface TeamWithRole extends Team {
  role: TeamRole;
  member_count?: number;
}

export interface CreateTeamPayload {
  name: string;
}

export interface UpdateTeamPayload {
  name: string;
}

export interface AddTeamMemberPayload {
  userId: string;
  role: TeamRole;
}

export interface UpdateTeamMemberPayload {
  role: TeamRole;
} 