import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger.js';

// Custom error class
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error response interface
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    statusCode: number;
    timestamp: string;
    path: string;
    method: string;
    stack?: string;
    details?: any;
  };
}

// Handle Prisma errors
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): AppError {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const field = error.meta?.['target'] as string[] | undefined;
      const fieldName = field ? field[0] : 'field';
      return new AppError(`${fieldName} already exists`, 409);
    
    case 'P2025':
      // Record not found
      return new AppError('Record not found', 404);
    
    case 'P2003':
      // Foreign key constraint violation
      return new AppError('Related record not found', 400);
    
    case 'P2014':
      // Required relation violation
      return new AppError('Invalid relation data', 400);
    
    case 'P2021':
      // Table does not exist
      return new AppError('Database table not found', 500);
    
    case 'P2022':
      // Column does not exist
      return new AppError('Database column not found', 500);
    
    default:
      logger.error('Unhandled Prisma error:', { code: error.code, message: error.message });
      return new AppError('Database operation failed', 500);
  }
}

// Handle validation errors
function handleValidationError(error: any): AppError {
  if (error.details) {
    const messages = error.details.map((detail: any) => detail.message).join(', ');
    return new AppError(`Validation error: ${messages}`, 400);
  }
  return new AppError('Validation error', 400);
}

// Handle JWT errors
function handleJWTError(error: any): AppError {
  if (error.name === 'JsonWebTokenError') {
    return new AppError('Invalid token', 401);
  }
  if (error.name === 'TokenExpiredError') {
    return new AppError('Token expired', 401);
  }
  return new AppError('Authentication failed', 401);
}

// Handle Multer errors
function handleMulterError(error: any): AppError {
  switch (error.code) {
    case 'LIMIT_FILE_SIZE':
      return new AppError('File too large', 413);
    case 'LIMIT_FILE_COUNT':
      return new AppError('Too many files', 413);
    case 'LIMIT_UNEXPECTED_FILE':
      return new AppError('Unexpected file field', 400);
    default:
      return new AppError('File upload error', 400);
  }
}

// Send error response
function sendErrorResponse(error: AppError, req: Request, res: Response): void {
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      message: error.message,
      ...(error.code && { code: error.code }),
      statusCode: error.statusCode,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    }
  };

  // Include stack trace in development
  if (process.env['NODE_ENV'] === 'development' && error.stack) {
    errorResponse.error.stack = error.stack;
  }

  // Log error details
  logger.error('Error occurred:', {
    message: error.message,
    statusCode: error.statusCode,
    path: req.path,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    stack: error.stack
  });

  res.status(error.statusCode).json(errorResponse);
}

// Main error handler middleware
export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  let appError: AppError;

  // Handle known error types
  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    appError = handlePrismaError(error);
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    logger.error('Prisma Validation Error Details:', { originalError: error.message });
    appError = new AppError(`Database validation error: ${error.message}`, 400);
  } else if (error.name === 'ValidationError' || error.isJoi) {
    appError = handleValidationError(error);
  } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    appError = handleJWTError(error);
  } else if (error.code && error.code.startsWith('LIMIT_')) {
    appError = handleMulterError(error);
  } else if (error.type === 'entity.parse.failed') {
    appError = new AppError('Invalid JSON format', 400);
  } else if (error.type === 'entity.too.large') {
    appError = new AppError('Request entity too large', 413);
  } else {
    // Unknown error
    logger.error('Unknown error occurred:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    
    appError = new AppError(
      process.env['NODE_ENV'] === 'development' 
        ? error.message || 'Something went wrong'
        : 'Internal server error',
      500,
      false
    );
  }

  sendErrorResponse(appError, req, res);
}

// Async error wrapper
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// 404 Not Found handler
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
}