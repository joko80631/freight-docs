import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware to log incoming requests with contextual metadata
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const requestLogger = (req, res, next) => {
  // Generate request ID if not exists
  req.id = req.id || uuidv4();
  
  // Set request ID in response header
  res.setHeader('X-Request-ID', req.id);

  // Get timestamp in ISO format
  const timestamp = new Date().toISOString();

  // Get user ID if available
  const userId = req.user?.id ? req.user.id.slice(0, 8) : 'anonymous';

  // Log request details
  console.log(
    `[${timestamp}] ${req.method} ${req.path} - ` +
    `user: ${userId} - ` +
    `id: ${req.id}`
  );

  // Log request body for non-GET requests (excluding sensitive data)
  if (req.method !== 'GET' && req.body) {
    const sanitizedBody = { ...req.body };
    // Remove sensitive fields if present
    delete sanitizedBody.password;
    delete sanitizedBody.token;
    delete sanitizedBody.apiKey;
    
    console.log(
      `[${timestamp}] Request body:`,
      JSON.stringify(sanitizedBody, null, 2)
    );
  }

  next();
}; 