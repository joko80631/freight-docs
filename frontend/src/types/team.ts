export type TeamRole = 'owner' | 'admin' | 'member';
export type UserRole = 'admin' | 'manager' | 'user';

export interface Team {
  id: string;
  name: string;
  created_at: string;
  updated_at: string | null;
  created_by: string;
}

export interface TeamMember {
  team_id: string;
  user_id: string;
  role: TeamRole;
  created_at: string;
  updated_at: string | null;
  profile?: {
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface TeamWithRole extends Team {
  role: TeamRole;
  members?: TeamMember[];
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

export interface Database {
  public: {
    Tables: {
      teams: {
        Row: Team;
        Insert: Omit<Team, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Team, 'id'>>;
      };
      team_members: {
        Row: TeamMember;
        Insert: Omit<TeamMember, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TeamMember, 'team_id' | 'user_id'>>;
      };
    };
  };
} 