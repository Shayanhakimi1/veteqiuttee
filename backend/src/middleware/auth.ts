import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/database.js';
import { AppError } from './errorHandler.js';
import { logger } from '../utils/logger.js';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        mobile: string;
        role: string;
        isActive: boolean;
        isVerified: boolean;
      };
      admin?: {
        id: string;
        email: string;
        role: string;
        isActive: boolean;
      };
    }
  }
}

interface JWTPayload {
  userId: string;
  mobile: string;
  role: string;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
}

// Verify JWT token
export async function authenticateToken(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new AppError('Access token required', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env['JWT_SECRET']!) as JWTPayload;

    if (decoded.type !== 'access') {
      throw new AppError('Invalid token type', 401);
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        mobile: true,
        role: true,
        isActive: true,
        isVerified: true
      }
    });

    if (!user) {
      throw new AppError('User not found', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 401);
    }

    // Attach user to request
    req.user = user;
    
    logger.debug('User authenticated successfully', {
      userId: user.id,
      mobile: user.mobile,
      role: user.role
    });

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Token expired', 401));
    } else {
      next(error);
    }
  }
}

// Verify admin JWT token
export async function authenticateAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new AppError('Access token required', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env['JWT_SECRET']!) as JWTPayload;

    if (decoded.type !== 'access') {
      throw new AppError('Invalid token type', 401);
    }

    // Get admin from database
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true
      }
    });

    if (!admin) {
      throw new AppError('Admin not found', 401);
    }

    if (!admin.isActive) {
      throw new AppError('Admin account is deactivated', 401);
    }

    // Attach admin to request
    req.admin = admin;
    
    logger.debug('Admin authenticated successfully', {
      adminId: admin.id,
      email: admin.email,
      role: admin.role
    });

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Token expired', 401));
    } else {
      next(error);
    }
  }
}

// Check if user has required role
export function requireRole(roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      logger.security('Unauthorized role access attempt', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        path: req.path,
        method: req.method
      });
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
}

// Check if admin has required role
export function requireAdminRole(roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.admin) {
      return next(new AppError('Admin authentication required', 401));
    }

    if (!roles.includes(req.admin.role)) {
      logger.security('Unauthorized admin role access attempt', {
        adminId: req.admin.id,
        adminRole: req.admin.role,
        requiredRoles: roles,
        path: req.path,
        method: req.method
      });
      return next(new AppError('Insufficient admin permissions', 403));
    }

    next();
  };
}

// Check if user is verified
export function requireVerification(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  if (!req.user.isVerified) {
    return next(new AppError('Email verification required', 403));
  }

  next();
}

// Optional authentication (doesn't throw error if no token)
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env['JWT_SECRET']!) as JWTPayload;

    if (decoded.type === 'access') {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          mobile: true,
          role: true,
          isActive: true,
          isVerified: true
        }
      });

      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Ignore token errors in optional auth
    next();
  }
}

// Rate limiting per user
export function userRateLimit(maxRequests: number, windowMs: number) {
  const userRequests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, _res: Response, next: NextFunction): void => {
    const userId = req.user?.id || req.ip || 'unknown';
    const now = Date.now();
    
    const userLimit = userRequests.get(userId);
    
    if (!userLimit || now > userLimit.resetTime) {
      userRequests.set(userId, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    if (userLimit.count >= maxRequests) {
      logger.security('Rate limit exceeded', {
        userId: req.user?.id,
        ip: req.ip,
        path: req.path,
        method: req.method
      });
      return next(new AppError('Too many requests', 429));
    }
    
    userLimit.count++;
    next();
  };
}