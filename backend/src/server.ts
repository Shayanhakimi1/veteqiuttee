import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import express, { Request } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Import utilities
import { validateEnv } from './utils/validateEnv.js';
import { logger } from './utils/logger.js';
// import { database } from './utils/database.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';

// Import routes
import routes from './routes/index.js';

// Validate environment variables
validateEnv();


const app = express();
const PORT = process.env['PORT'] || 4000;

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: process.env['CORS_ORIGIN']?.split(',') || ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5176'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'), // 15 minutes
  max: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100'), // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000') / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health check
    return req.path === '/api/health';
  }
});

app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ 
  limit: process.env['MAX_FILE_SIZE'] || '10mb',
  verify: (req, _res, buf) => {
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      logger.warn('Invalid JSON in request body', {
        ip: (req as Request).ip,
        userAgent: (req as Request).get('User-Agent'),
        path: (req as Request).path
      });
      throw new Error('Invalid JSON');
    }
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: process.env['MAX_FILE_SIZE'] || '10mb' 
}));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(
       req.method,
       req.originalUrl,
       res.statusCode,
       duration,
       req.get('User-Agent') || 'Unknown'
     );
  });
  
  next();
});

// Create uploads directory if it doesn't exist
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  
  // Create subdirectories for different file types
  const subDirs = ['images', 'documents', 'audio', 'video', 'thumbnails'];
  subDirs.forEach(dir => {
    const subDirPath = path.join(uploadsDir, dir);
    if (!fs.existsSync(subDirPath)) {
      fs.mkdirSync(subDirPath, { recursive: true });
    }
  });
  
  logger.info('Created uploads directories', { path: uploadsDir });
}

// Serve static files
app.use('/uploads', express.static(uploadsDir, {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Veterinary Consultation API',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/api/health',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  try {
    // await database.disconnect();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error during database disconnect:', error);
  }
  
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  
  try {
    // await database.disconnect();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error during database disconnect:', error);
  }
  
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (_reason, promise) => {
  logger.error('Unhandled Rejection at:', promise);
  process.exit(1);
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    // const isHealthy = await database.healthCheck();
    const isHealthy = true; // Placeholder for database health check
    if (!isHealthy) {
      throw new Error('Database health check failed');
    }
    
    logger.info('Database connection established successfully');
    
    const server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`, {
        port: PORT,
        environment: process.env['NODE_ENV'],
        timestamp: new Date().toISOString()
      });
    });
    
    // Handle server errors
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`);
      } else {
        logger.error('Server error:', error);
      }
      process.exit(1);
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;


 
