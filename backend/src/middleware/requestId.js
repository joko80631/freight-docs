import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware to generate and track request IDs
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const requestId = (req, res, next) => {
  // Generate request ID if not exists
  req.id = req.id || uuidv4();
  
  // Set request ID in response header
  res.setHeader('X-Request-ID', req.id);

  next();
}; 