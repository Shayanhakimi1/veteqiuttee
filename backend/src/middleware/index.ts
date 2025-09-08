import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from '../config/index.js';
import { JWTPayload, UserRole, UserStatus } from '../types/index.js';
import { Request } from 'express';

// Extend Express Request interface
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    firstName: string | null;
    lastName: string | null;
  };
}
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Authentication Middleware
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'توکن احراز هویت ارائه نشده است',
        code: 'NO_TOKEN'
      });
      return;
    }

    const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET) as JWTPayload;
    
    // Check if user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        firstName: true,
        lastName: true
      }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'کاربر یافت نشد',
        code: 'USER_NOT_FOUND'
      });
      return;
    }

    if (user.status !== 'ACTIVE') {
      res.status(401).json({
        success: false,
        message: 'حساب کاربری غیرفعال است',
        code: 'ACCOUNT_INACTIVE'
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      status: user.status as UserStatus,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      firstName: user.firstName,
      lastName: user.lastName
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'توکن نامعتبر است',
        code: 'INVALID_TOKEN'
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'توکن منقضی شده است',
        code: 'TOKEN_EXPIRED'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'خطا در احراز هویت',
      code: 'AUTH_ERROR'
    });
  }
};

// Authorization Middleware
export const requireRole = (roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'احراز هویت مورد نیاز است',
        code: 'AUTHENTICATION_REQUIRED'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'دسترسی مجاز نیست',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
      return;
    }

    next();
  };
};

// Admin only middleware
export const requireAdmin = requireRole(['ADMIN']);

// Veterinarian or Admin middleware
export const requireVeterinarianOrAdmin = requireRole(['VETERINARIAN', 'ADMIN']);

// User verification middleware
export const requireEmailVerification = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user?.isEmailVerified) {
    res.status(403).json({
      success: false,
      message: 'تأیید ایمیل مورد نیاز است',
      code: 'EMAIL_VERIFICATION_REQUIRED'
    });
    return;
  }
  next();
};

export const requirePhoneVerification = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user?.isPhoneVerified) {
    res.status(403).json({
      success: false,
      message: 'تأیید شماره تلفن مورد نیاز است',
      code: 'PHONE_VERIFICATION_REQUIRED'
    });
    return;
  }
  next();
};

// Validation Middleware
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined
    }));

    res.status(400).json({
      success: false,
      message: 'داده‌های ورودی نامعتبر است',
      code: 'VALIDATION_ERROR',
      errors: formattedErrors
    });
    return;
  }
  
  next();
};

// Rate Limiting
export const createRateLimit = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
      code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        success: false,
        message,
        code: 'RATE_LIMIT_EXCEEDED'
      });
    }
  });
};

// Common rate limits
export const generalRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  'تعداد درخواست‌ها بیش از حد مجاز است. لطفاً کمی صبر کنید'
);

export const authRateLimit = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // limit each IP to 5 auth requests per windowMs
  'تعداد تلاش‌های احراز هویت بیش از حد مجاز است. لطفاً 15 دقیقه صبر کنید'
);

export const strictRateLimit = createRateLimit(
  60 * 1000, // 1 minute
  10, // limit each IP to 10 requests per minute
  'تعداد درخواست‌ها بیش از حد مجاز است. لطفاً یک دقیقه صبر کنید'
);

// CORS Options
export const corsOptions = {
  origin: config.CORS_ORIGIN.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Security Headers
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};

// Security Middleware
export const securityMiddleware = [
  helmet({
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
    },
    crossOriginEmbedderPolicy: false
  }),
  cors({
    origin: config.CORS_ORIGIN.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }),
  compression()
];

// Logging Middleware
export const requestLogger = morgan('combined', {
  stream: {
    write: (message: string) => {
      logger.info(message.trim());
    }
  }
});

// File Upload Middleware
const createUploadDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = '';
    
    if (file.fieldname === 'profilePicture') {
      uploadPath = path.join(config.upload.directory, 'profiles');
    } else if (file.fieldname === 'petImage') {
      uploadPath = path.join(config.upload.directory, 'pets');
    } else if (file.fieldname === 'voiceMessage') {
      uploadPath = path.join(config.upload.directory, 'consultations', 'voice');
    } else if (file.fieldname === 'document') {
      uploadPath = path.join(config.upload.directory, 'documents');
    } else {
      uploadPath = path.join(config.upload.directory, 'misc');
    }
    
    createUploadDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes: { [key: string]: string[] } = {
    profilePicture: ['image/jpeg', 'image/png', 'image/webp'],
    petImage: ['image/jpeg', 'image/png', 'image/webp'],
    voiceMessage: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'],
    document: ['application/pdf', 'image/jpeg', 'image/png']
  };

  const fieldAllowedTypes = allowedTypes[file.fieldname] || [];
  
  if (fieldAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`نوع فایل ${file.mimetype} برای فیلد ${file.fieldname} مجاز نیست`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: config.upload.maxFiles
  }
});

// Specific upload middlewares
export const uploadProfilePicture = upload.single('profilePicture');
export const uploadPetImage = upload.single('petImage');
export const uploadVoiceMessage = upload.single('voiceMessage');
export const uploadDocument = upload.single('document');
export const uploadMultiple = upload.array('files', 5);

// Error Handling Middleware
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Multer errors
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        message: 'حجم فایل بیش از حد مجاز است',
        code: 'FILE_TOO_LARGE'
      });
      return;
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({
        success: false,
        message: 'تعداد فایل‌ها بیش از حد مجاز است',
        code: 'TOO_MANY_FILES'
      });
      return;
    }
  }

  // File type errors
  if (error.message.includes('نوع فایل')) {
    res.status(400).json({
      success: false,
      message: error.message,
      code: 'INVALID_FILE_TYPE'
    });
    return;
  }

  // Prisma errors
  if (error.code === 'P2002') {
    res.status(409).json({
      success: false,
      message: 'داده تکراری وجود دارد',
      code: 'DUPLICATE_ENTRY'
    });
    return;
  }

  if (error.code === 'P2025') {
    res.status(404).json({
      success: false,
      message: 'رکورد مورد نظر یافت نشد',
      code: 'RECORD_NOT_FOUND'
    });
    return;
  }

  // JWT errors
  if (error instanceof jwt.JsonWebTokenError) {
    res.status(401).json({
      success: false,
      message: 'توکن نامعتبر است',
      code: 'INVALID_TOKEN'
    });
    return;
  }

  // Default error
  const statusCode = error.statusCode || error.status || 500;
  const message = error.message || 'خطای داخلی سرور';
  
  res.status(statusCode).json({
    success: false,
    message,
    code: error.code || 'INTERNAL_SERVER_ERROR',
    ...(config.NODE_ENV === 'development' && { stack: error.stack })
  });
};

// Not Found Middleware
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    message: 'مسیر مورد نظر یافت نشد',
    code: 'ROUTE_NOT_FOUND',
    path: req.originalUrl
  });
};

// Request ID Middleware
export const requestId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const id = Math.random().toString(36).substring(2, 15);
  req.headers['x-request-id'] = id;
  res.setHeader('X-Request-ID', id);
  next();
};

// Response Time Middleware
export const responseTime = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    res.setHeader('X-Response-Time', `${duration}ms`);
    
    if (duration > 1000) {
      logger.warn(`Slow request: ${req.method} ${req.url} took ${duration}ms`);
    }
  });
  
  next();
};

// Health Check Middleware
export const healthCheck = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.path === '/health' || req.path === '/ping') {
    res.status(200).json({
      success: true,
      message: 'سرور در حال اجرا است',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
    return;
  }
  next();
};

// Skip authentication for webhook endpoints
export const skipAuthForWebhooks = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Skip authentication for webhook endpoints
  next();
};

// Upload consultation files middleware
export const uploadConsultationFiles = upload.array('files', 10);

export default {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireVeterinarianOrAdmin,
  requireEmailVerification,
  requirePhoneVerification,
  validateRequest,
  generalRateLimit,
  authRateLimit,
  strictRateLimit,
  securityMiddleware,
  requestLogger,
  upload,
  uploadProfilePicture,
  uploadPetImage,
  uploadVoiceMessage,
  uploadDocument,
  uploadMultiple,
  errorHandler,
  notFoundHandler,
  requestId,
  responseTime,
  healthCheck,
  skipAuthForWebhooks,
  uploadConsultationFiles
};