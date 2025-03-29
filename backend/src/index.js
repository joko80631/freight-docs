import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { loadRoutes } from './routes/loads.js';
import documentRoutes from './routes/documents.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/logger.js';
import { requestId } from './middleware/requestId.js';
import { loadCreationLimiter, documentUploadLimiter } from './middleware/rateLimit.js';
import { validateEnv } from './utils/env.js';

// Load environment variables
dotenv.config();

// Validate environment variables
try {
  validateEnv();
} catch (error) {
  console.error('Environment validation failed:', error.message);
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3001;

// Initialize Supabase client
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Health check endpoint
app.get('/healthz', async (req, res) => {
  try {
    // Check Supabase connection by querying the loads table
    const { data, error } = await supabase
      .from('loads')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    // Check storage bucket access
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from('documents')
      .list('', { limit: 1 });
    
    if (storageError) throw storageError;
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      supabase: {
        database: 'connected',
        storage: 'accessible'
      },
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Security middleware with error handling
try {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "https:", "data:"],
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
        connectSrc: ["'self'", process.env.SUPABASE_URL],
        styleSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'", "https:", "data:"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        sandbox: ['allow-forms', 'allow-scripts', 'allow-same-origin']
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    frameguard: { action: 'deny' },
    xssFilter: true,
    hidePoweredBy: true,
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));
} catch (error) {
  console.error('Failed to initialize Helmet:', error);
  // Fallback to basic security headers
  app.use(helmet());
}

// Request size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Request ID middleware
app.use(requestId);

// Request logging
app.use(requestLogger);

// Routes with rate limiting
app.use('/api/loads', loadCreationLimiter, loadRoutes);
app.use('/api/documents', documentUploadLimiter, documentRoutes);

// Error handling
app.use(errorHandler);

// Multer error handling
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'File too large',
        message: 'Maximum file size is 10MB'
      });
    }
  }
  next(err);
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 