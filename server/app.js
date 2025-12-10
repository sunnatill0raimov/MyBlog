import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
// import helmet from 'helmet';
import { createServer } from 'http';

import { env } from './config/env.js';
import connectDB from './config/db.js';
import logger from './utils/logger.js';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import postRoutes from './routes/post.routes.js';
import binaryRoutes from './routes/binary.routes.js';
import chatRoutes from './routes/chat.routes.js';
import messageRoutes from './routes/message.routes.js';
import errorMiddleware from './middleware/error.middleware.js';

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
// app.use(helmet()); // Temporarily disabled due to import issues

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(env.UPLOAD_PATH));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/binary', binaryRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// 404 handler
app.use((req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
});

// Error middleware (must be last)
app.use(errorMiddleware);

// Create HTTP server for Socket.io
const server = createServer(app);

export { app, server };
export default app;
