import express from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { requireTeamMember, requireTeamRole } from '../middleware/teamAuth.js';
import { TeamService } from '../services/teamService.js';

const router = express.Router();

// Validation schemas
const createTeamSchema = z.object({
  name: z.string().min(1, "Team name is required").max(100, "Team name is too long")
});

const updateTeamSchema = z.object({
  name: z.string().min(1, "Team name is required").max(100, "Team name is too long")
});

const addMemberSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  role: z.enum(['ADMIN', 'MANAGER', 'USER'])
});

const updateMemberSchema = z.object({
  role: z.enum(['ADMIN', 'MANAGER', 'USER'])
});

// Get all teams for current user
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const teams = await TeamService.getUserTeams(req.user.id);
    res.json(teams);
  } catch (error) {
    next(error);
  }
});

// Create a new team
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const validatedData = createTeamSchema.parse(req.body);
    const team = await TeamService.createTeam(req.user.id, validatedData);
    res.status(201).json(team);
  } catch (error) {
    next(error);
  }
});

// Get team details
router.get('/:teamId', requireAuth, requireTeamMember, async (req, res, next) => {
  try {
    const team = await TeamService.getTeamById(req.params.teamId);
    res.json(team);
  } catch (error) {
    next(error);
  }
});

// Update team
router.patch('/:teamId', requireAuth, requireTeamRole('ADMIN'), async (req, res, next) => {
  try {
    const validatedData = updateTeamSchema.parse(req.body);
    const team = await TeamService.updateTeam(req.params.teamId, validatedData);
    res.json(team);
  } catch (error) {
    next(error);
  }
});

// Delete team
router.delete('/:teamId', requireAuth, requireTeamRole('ADMIN'), async (req, res, next) => {
  try {
    await TeamService.deleteTeam(req.params.teamId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Add team member
router.post('/:teamId/members', requireAuth, requireTeamRole('ADMIN'), async (req, res, next) => {
  try {
    const validatedData = addMemberSchema.parse(req.body);
    const member = await TeamService.addTeamMember(
      req.params.teamId,
      validatedData.userId,
      validatedData.role
    );
    res.status(201).json(member);
  } catch (error) {
    next(error);
  }
});

// Update team member role
router.patch('/:teamId/members/:userId', requireAuth, requireTeamRole('ADMIN'), async (req, res, next) => {
  try {
    const validatedData = updateMemberSchema.parse(req.body);
    const member = await TeamService.updateTeamMemberRole(
      req.params.teamId,
      req.params.userId,
      validatedData.role
    );
    res.json(member);
  } catch (error) {
    next(error);
  }
});

// Remove team member
router.delete('/:teamId/members/:userId', requireAuth, requireTeamRole('ADMIN'), async (req, res, next) => {
  try {
    await TeamService.removeTeamMember(req.params.teamId, req.params.userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router; 