import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/database.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { validate, userSchemas } from '../middleware/validation.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';


const router = express.Router();



// Generate JWT tokens
function generateTokens(userId: string, mobile: string, role: string) {
  const accessToken = jwt.sign(
    { userId, mobile, role, type: 'access' },
    process.env['JWT_SECRET'] || 'default-secret',
    { expiresIn: process.env['JWT_EXPIRES_IN'] || '15m' } as jwt.SignOptions
  );

  const refreshToken = jwt.sign(
    { userId, mobile, role, type: 'refresh' },
    process.env['JWT_REFRESH_SECRET'] || 'default-refresh-secret',
    { expiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] || '7d' } as jwt.SignOptions
  );

  return { accessToken, refreshToken };
}

// Register new user
router.post('/register', validate(userSchemas.register), asyncHandler(async (req, res) => {
  const { mobile, password, firstName, lastName, petData } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { mobile }
  });

  if (existingUser) {
    throw new AppError('User with this mobile number already exists', 409);
  }

  // Hash password
  const saltRounds = parseInt(process.env['BCRYPT_SALT_ROUNDS'] || '12');
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create user
  const user = await prisma.user.create({
    data: {
      mobile,
      password: hashedPassword,
      firstName,
      lastName
    },
    select: {
      id: true,
      mobile: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      isVerified: true,
      createdAt: true
    }
  });

  // Create pet if petData is provided
  let pet = null;
  if (petData && Object.keys(petData).length > 0) {
    pet = await prisma.pet.create({
      data: {
        ...petData,
        userId: user.id
      }
    });
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user.id, user.mobile, user.role);

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
  });

  logger.info('User registered successfully', {
    userId: user.id,
    mobile: user.mobile,
    petCreated: !!pet
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token: accessToken,
    data: {
      user,
      pet,
      tokens: {
        accessToken,
        refreshToken
      }
    }
  });
}));

// Login user
router.post('/login', validate(userSchemas.login), asyncHandler(async (req, res) => {
  const { mobile, password } = req.body;

  // Find user
  const user = await prisma.user.findUnique({
    where: { mobile }
  });

  if (!user) {
    throw new AppError('Invalid mobile number or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('Account is deactivated', 401);
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    logger.security('Failed login attempt', {
      mobile,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    throw new AppError('Invalid mobile number or password', 401);
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user.id, user.mobile, user.role);

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
  });

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  logger.info('User logged in successfully', {
    userId: user.id,
    mobile: user.mobile
  });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: userWithoutPassword,
      tokens: {
        accessToken,
        refreshToken
      }
    }
  });
}));

// Refresh access token
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token required', 401);
  }

  // Verify refresh token
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env['JWT_REFRESH_SECRET'] || 'default-refresh-secret') as any;
  } catch (error) {
    throw new AppError('Invalid refresh token', 401);
  }

  if (decoded.type !== 'refresh') {
    throw new AppError('Invalid token type', 401);
  }

  // Check if refresh token exists in database
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true }
  });

  if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  if (!storedToken.user.isActive) {
    throw new AppError('Account is deactivated', 401);
  }

  // Generate new tokens
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(
    storedToken.user.id,
    storedToken.user.mobile,
    storedToken.user.role
  );

  // Revoke old refresh token and create new one
  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true }
    }),
    prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: storedToken.user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    })
  ]);

  res.json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      tokens: {
        accessToken,
        refreshToken: newRefreshToken
      }
    }
  });
}));

// Logout user
router.post('/logout', authenticateToken, asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    // Revoke refresh token
    await prisma.refreshToken.updateMany({
      where: {
        token: refreshToken,
        userId: req.user!.id
      },
      data: {
        isRevoked: true
      }
    });
  }

  logger.info('User logged out', {
    userId: req.user!.id,
    mobile: req.user!.mobile
  });

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

// Logout from all devices
router.post('/logout-all', authenticateToken, asyncHandler(async (req, res) => {
  // Revoke all refresh tokens for user
  await prisma.refreshToken.updateMany({
    where: {
      userId: req.user!.id,
      isRevoked: false
    },
    data: {
      isRevoked: true
    }
  });

  logger.info('User logged out from all devices', {
    userId: req.user!.id,
    mobile: req.user!.mobile
  });

  res.json({
    success: true,
    message: 'Logged out from all devices successfully'
  });
}));

// Get current user profile
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatar: true,
      role: true,
      isActive: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    data: { user }
  });
}));

// Change password
router.patch('/change-password', 
  authenticateToken, 
  validate(userSchemas.changePassword), 
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.id;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId as string }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Hash new password
    const saltRounds = parseInt(process.env['BCRYPT_SALT_ROUNDS'] || '12');
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: userId as string },
      data: { password: hashedNewPassword }
    });

    // Revoke all refresh tokens to force re-login
    await prisma.refreshToken.updateMany({
      where: {
        userId: userId as string,
        isRevoked: false
      },
      data: {
        isRevoked: true
      }
    });

    logger.info('Password changed successfully', {
      userId,
      email: user.email
    });

    res.json({
      success: true,
      message: 'Password changed successfully. Please login again.'
    });
  })
);

// Verify token (for frontend to check if token is valid)
router.get('/verify', optionalAuth, (req, res) => {
  res.json({
    success: true,
    data: {
      isAuthenticated: !!req.user,
      user: req.user || null
    }
  });
});



export default router;