import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import fs from 'fs';

// Import routes
import routes from './routes/index.js';

// Import middleware
import {
  errorHandler,
  notFoundHandler,
  requestLogger,
  securityHeaders,
  corsOptions
} from './middleware/index.js';

// Import utilities
import { logger } from './utils/logger.js';
import { config } from './config/index.js';

// Add proper config structure access
const appConfig = {
  app: {
    environment: config.NODE_ENV
  },
  frontend: {
    url: config.CORS_ORIGIN
  }
};

// Create Express app
const app = express();
const server = createServer(app);

// Initialize Socket.IO for real-time features
const io = new SocketIOServer(server, {
  cors: {
    origin: appConfig.frontend.url,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Trust proxy (for deployment behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  }
}));

// CORS configuration
app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Security headers
app.use(securityHeaders);

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: 'تعداد درخواست‌های شما از حد مجاز بیشتر است. لطفاً کمی صبر کنید.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(globalLimiter);

// Create upload directories if they don't exist
const uploadDirs = [
  'uploads/profiles',
  'uploads/pets',
  'uploads/voice',
  'uploads/consultations'
];

uploadDirs.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    logger.logAPI('info', `Created upload directory: ${dir}`);
  }
});

// Serve static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check endpoint (before API routes)
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Veterinary Consultation API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: appConfig.app.environment
  });
});

// API routes
app.use('/api/v1', routes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.logAPI('info', 'Socket.IO client connected', { socketId: socket.id });

  // Join consultation room
  socket.on('join-consultation', (consultationId: string) => {
    socket.join(`consultation-${consultationId}`);
    logger.logAPI('info', 'Client joined consultation room', {
      socketId: socket.id,
      consultationId
    });
  });

  // Leave consultation room
  socket.on('leave-consultation', (consultationId: string) => {
    socket.leave(`consultation-${consultationId}`);
    logger.logAPI('info', 'Client left consultation room', {
      socketId: socket.id,
      consultationId
    });
  });

  // Handle consultation messages
  socket.on('consultation-message', (data) => {
    const { consultationId, message, senderId, senderType } = data;
    
    // Broadcast message to all clients in the consultation room
    socket.to(`consultation-${consultationId}`).emit('new-message', {
      id: Date.now().toString(),
      consultationId,
      message,
      senderId,
      senderType,
      timestamp: new Date().toISOString()
    });

    logger.logAPI('info', 'Consultation message sent', {
      consultationId,
      senderId,
      senderType
    });
  });

  // Handle consultation status updates
  socket.on('consultation-status-update', (data) => {
    const { consultationId, status, updatedBy } = data;
    
    // Broadcast status update to all clients in the consultation room
    socket.to(`consultation-${consultationId}`).emit('status-updated', {
      consultationId,
      status,
      updatedBy,
      timestamp: new Date().toISOString()
    });

    logger.logAPI('info', 'Consultation status updated', {
      consultationId,
      status,
      updatedBy
    });
  });

  // Handle typing indicators
  socket.on('typing-start', (data) => {
    const { consultationId, userId } = data;
    socket.to(`consultation-${consultationId}`).emit('user-typing', {
      consultationId,
      userId,
      isTyping: true
    });
  });

  socket.on('typing-stop', (data) => {
    const { consultationId, userId } = data;
    socket.to(`consultation-${consultationId}`).emit('user-typing', {
      consultationId,
      userId,
      isTyping: false
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    logger.logAPI('info', 'Socket.IO client disconnected', { socketId: socket.id });
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.logAPI('info', 'SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.logAPI('info', 'Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.logAPI('info', 'SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.logAPI('info', 'Process terminated');
    process.exit(0);
  });
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  logger.logAPI('error', 'Unhandled Rejection', { reason, promise });
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  logger.logAPI('error', 'Uncaught Exception', { error });
  process.exit(1);
});

export { app, server, io };
export default app;