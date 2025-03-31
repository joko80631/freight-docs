import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import authRoutes from './routes/auth.js';
import loadRoutes from './routes/loads.js';
import documentRoutes from './routes/documents.js';
import teamRoutes from './routes/teams.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api', loadRoutes);
app.use('/api', documentRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app; 