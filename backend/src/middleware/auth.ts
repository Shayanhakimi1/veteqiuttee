import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    id: number;
    fullName: string;
    mobile: string;
    role: string;
    isAdmin?: boolean;
  };
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: { message: 'Access token required' } });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Get user from database to ensure they still exist and get latest info
    const user = await prisma.user.findUnique({
      where: { id: decoded.id || decoded.userId },
      select: {
        id: true,
        fullName: true,
        mobile: true,
        role: true,
      }
    });

    if (!user) {
      return res.status(401).json({ error: { message: 'User not found' } });
    }

    req.user = {
      userId: user.id,
      id: user.id,
      fullName: user.fullName,
      mobile: user.mobile,
      role: user.role,
      isAdmin: user.role === 'ADMIN'
    };
    next();
  } catch (error) {
    logger.error('Authentication error:', { error: error instanceof Error ? error.message : String(error) });
    return res.status(403).json({ error: { message: 'Invalid or expired token' } });
  }
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: { message: 'Authentication required' } });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: { message: 'Admin access required' } });
  }

  next();
};

// Middleware to check if user can access specific media file
export const checkMediaAccess = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    const mediaId = parseInt(id);

    if (isNaN(mediaId)) {
      return res.status(400).json({ error: { message: 'Invalid media ID' } });
    }

    // Admin can access all media
    if (req.user?.role === 'ADMIN') {
      return next();
    }

    // Check if user owns the media file
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      select: { userId: true, isActive: true }
    });

    if (!media) {
      return res.status(404).json({ error: { message: 'Media file not found' } });
    }

    if (!media.isActive) {
      return res.status(404).json({ error: { message: 'Media file not available' } });
    }

    if (media.userId !== req.user?.userId) {
      return res.status(403).json({ error: { message: 'Access denied' } });
    }

    next();
  } catch (error) {
    logger.error('Media access check error:', { error: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: { message: 'Internal server error' } });
  }
};

// Rate limiting middleware for file uploads
const uploadAttempts = new Map<string, { count: number; resetTime: number }>();

export const rateLimitUploads = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.userId?.toString();
  if (!userId) {
    return res.status(401).json({ error: { message: 'Authentication required' } });
  }

  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 50; // Max 50 uploads per 15 minutes per user

  const userAttempts = uploadAttempts.get(userId);

  if (!userAttempts || now > userAttempts.resetTime) {
    // Reset or initialize
    uploadAttempts.set(userId, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (userAttempts.count >= maxAttempts) {
    return res.status(429).json({ 
      error: { message: 'Too many upload attempts. Please try again later.' } 
    });
  }

  // Increment count
  userAttempts.count++;
  uploadAttempts.set(userId, userAttempts);
  
  next();
};