import rateLimit from 'express-rate-limit';

// Rate limiter for load creation
export const loadCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests',
    message: 'You\'ve hit the rate limit. Try again later.'
  }
});

// Rate limiter for document uploads
export const documentUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests',
    message: 'You\'ve hit the rate limit. Try again later.'
  }
}); 