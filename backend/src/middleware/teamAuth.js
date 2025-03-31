import { TeamService } from '../services/teamService.js';

// Role hierarchy mapping
const ROLE_HIERARCHY = {
  'ADMIN': 3,
  'MANAGER': 2,
  'USER': 1
};

export const requireTeamMember = async (req, res, next) => {
  try {
    const teamId = req.params.teamId;
    if (!teamId) {
      return res.status(400).json({ error: 'Team ID is required' });
    }

    const hasAccess = await TeamService.verifyTeamAccess(req.user.id, teamId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied: Not a team member' });
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const requireTeamRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const teamId = req.params.teamId;
      if (!teamId) {
        return res.status(400).json({ error: 'Team ID is required' });
      }

      const userRole = await TeamService.getUserTeamRole(teamId, req.user.id);
      if (!userRole) {
        return res.status(403).json({ error: 'Access denied: Not a team member' });
      }

      const userRoleLevel = ROLE_HIERARCHY[userRole];
      const requiredRoleLevel = ROLE_HIERARCHY[requiredRole];

      if (userRoleLevel < requiredRoleLevel) {
        return res.status(403).json({ 
          error: `Access denied: Requires ${requiredRole} role or higher` 
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireTeamResourceAccess = (resourceType) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      if (!resourceId) {
        return res.status(400).json({ error: 'Resource ID is required' });
      }

      // Get the team_id from the resource
      const { data: resource, error } = await supabase
        .from(resourceType === 'load' ? 'loads' : 'documents')
        .select('team_id')
        .eq('id', resourceId)
        .single();

      if (error || !resource) {
        return res.status(404).json({ error: 'Resource not found' });
      }

      const hasAccess = await TeamService.verifyTeamAccess(req.user.id, resource.team_id);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied: Not a team member' });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}; 