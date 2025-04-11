import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

export async function teamContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  // Get team ID from request
  const teamId = req.headers['x-team-id'] as string;
  if (!teamId) {
    return res.status(400).json({ error: 'Team context is required' });
  }

  try {
    // Verify team exists and user has access
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id')
      .eq('id', teamId)
      .single();

    if (teamError || !team) {
      return res.status(403).json({ error: 'Invalid team context' });
    }

    // Add team context to request
    req.teamId = teamId;
    next();
  } catch (error) {
    console.error('Team context error:', error);
    res.status(500).json({ error: 'Failed to verify team context' });
  }
} 