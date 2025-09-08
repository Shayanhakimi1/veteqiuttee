import express from 'express';
import { prisma } from '../utils/database.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { validate, userSchemas, querySchemas, paramSchemas } from '../middleware/validation.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get all users (Admin only)
router.get('/', 
  authenticateToken,
  requireRole(['ADMIN']),
  validate(querySchemas.pagination, 'query'),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Build where clause for search
    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { mobile: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Get users with pagination
    const [users, allUsers] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          mobile: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          role: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
          pets: {
            select: {
              id: true
            }
          },
          consultations: {
            select: {
              id: true
            }
          }
        },
        skip,
        take,
        orderBy: {
          [sortBy as string]: sortOrder
        }
      }),
      prisma.user.findMany({
        where,
        select: { id: true }
      })
    ]);

    const total = allUsers.length;

    const totalPages = Math.ceil(total / take);

    // Transform users to include counts instead of full arrays
    const usersWithCounts = users.map(user => ({
      ...user,
      pets: user.pets.length,
      consultations: user.consultations.length
    }));

    res.json({
      success: true,
      data: {
        users: usersWithCounts,
        pagination: {
          page: Number(page),
          limit: take,
          total,
          totalPages,
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1
        }
      }
    });
  })
);

// Get user by ID (Admin only or own profile)
router.get('/:id', 
  authenticateToken,
  validate(paramSchemas.id, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
      throw new AppError('User ID is required', 400);
    }
    const currentUser = req.user!;

    // Check if user is admin or accessing own profile
    if (currentUser.role !== 'ADMIN' && currentUser.id !== id) {
      throw new AppError('Access denied', 403);
    }

    const user = await prisma.user.findUnique({
      where: { id: id as string },
      select: {
        id: true,
        mobile: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        pets: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            age: true,
            gender: true,
            avatar: true,
            createdAt: true
          }
        },
        consultations: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            createdAt: true,
            pet: {
              select: {
                id: true,
                name: true,
                species: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        },
        _count: {
          select: {
            pets: true,
            consultations: true,
            payments: true
          }
        }
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: { user }
    });
  })
);

// Update user profile
router.patch('/:id', 
  authenticateToken,
  validate(paramSchemas.id, 'params'),
  validate(userSchemas.updateProfile),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const currentUser = req.user!;
    const { firstName, lastName, phone, avatar } = req.body;

    // Check if user is admin or updating own profile
    if (currentUser.role !== 'ADMIN' && currentUser.id !== id) {
      throw new AppError('Access denied', 403);
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: id as string }
    });

    if (!existingUser) {
      throw new AppError('User not found', 404);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: id as string },
      data: {
        firstName,
        lastName,
        phone,
        avatar
      },
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

    logger.info('User profile updated', {
      userId: id,
      updatedBy: currentUser.id,
      changes: { firstName, lastName, phone, avatar }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });
  })
);

// Deactivate user (Admin only)
router.patch('/:id/deactivate', 
  authenticateToken,
  requireRole(['ADMIN']),
  validate(paramSchemas.id, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const currentUser = req.user!;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: id as string }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.isActive) {
      throw new AppError('User is already deactivated', 400);
    }

    // Prevent admin from deactivating themselves
    if (user.id === currentUser.id) {
      throw new AppError('Cannot deactivate your own account', 400);
    }

    // Deactivate user and revoke all refresh tokens
    await prisma.$transaction([
      prisma.user.update({
        where: { id: id as string },
        data: { isActive: false }
      }),
      prisma.refreshToken.updateMany({
        where: {
          userId: id as string,
          isRevoked: false
        },
        data: {
          isRevoked: true
        }
      })
    ]);

    logger.info('User deactivated', {
      userId: id,
      deactivatedBy: currentUser.id,
      userEmail: user.email
    });

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  })
);

// Activate user (Admin only)
router.patch('/:id/activate', 
  authenticateToken,
  requireRole(['ADMIN']),
  validate(paramSchemas.id, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const currentUser = req.user!;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: id as string }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.isActive) {
      throw new AppError('User is already active', 400);
    }

    // Activate user
    await prisma.user.update({
      where: { id: id as string },
      data: { isActive: true }
    });

    logger.info('User activated', {
      userId: id,
      activatedBy: currentUser.id,
      userEmail: user.email
    });

    res.json({
      success: true,
      message: 'User activated successfully'
    });
  })
);

// Delete user (Admin only)
router.delete('/:id', 
  authenticateToken,
  requireRole(['ADMIN']),
  validate(paramSchemas.id, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const currentUser = req.user!;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: id as string },
      include: {
        pets: {
          select: {
            id: true
          }
        },
        consultations: {
          select: {
            id: true
          }
        },
        payments: {
          select: {
            id: true
          }
        }
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Prevent admin from deleting themselves
    if (user.id === currentUser.id) {
      throw new AppError('Cannot delete your own account', 400);
    }

    // Check if user has related data
    if (user.pets.length > 0 || user.consultations.length > 0 || user.payments.length > 0) {
      throw new AppError('Cannot delete user with existing pets, consultations, or payments. Deactivate instead.', 400);
    }

    // Delete user and all related refresh tokens
    await prisma.$transaction([
      prisma.refreshToken.deleteMany({
        where: { userId: id as string }
      }),
      prisma.user.delete({
        where: { id: id as string }
      })
    ]);

    logger.info('User deleted', {
      userId: id,
      deletedBy: currentUser.id,
      userEmail: user.email
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  })
);

// Get current user profile
router.get('/profile', 
  authenticateToken,
  asyncHandler(async (req, res) => {
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
  })
);

// Get user pets
router.get('/pets', 
  authenticateToken,
  asyncHandler(async (req, res) => {
    const pets = await prisma.pet.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { pets }
    });
  })
);

// Add new pet
router.post('/pets', 
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { name, species, breed, age, gender, weight, description } = req.body;

    const pet = await prisma.pet.create({
      data: {
        name,
        species,
        breed,
        age: age ? parseInt(age) : null,
        gender,
        weight: weight ? parseFloat(weight) : null,
        description,
        userId: req.user!.id
      }
    });

    res.json({
      success: true,
      message: 'Pet added successfully',
      data: { pet }
    });
  })
);

// Update pet
router.put('/pets/:petId', 
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { petId } = req.params;
    const { name, species, breed, age, gender, weight, description } = req.body;

    // Check if pet belongs to user
    const existingPet = await prisma.pet.findFirst({
      where: {
        id: petId,
        userId: req.user!.id
      }
    });

    if (!existingPet) {
      throw new AppError('Pet not found', 404);
    }

    const pet = await prisma.pet.update({
      where: { id: petId },
      data: {
        name,
        species,
        breed,
        age: age ? parseInt(age) : null,
        gender,
        weight: weight ? parseFloat(weight) : null,
        description
      }
    });

    res.json({
      success: true,
      message: 'Pet updated successfully',
      data: { pet }
    });
  })
);

// Delete pet
router.delete('/pets/:petId', 
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { petId } = req.params;

    // Check if pet belongs to user
    const existingPet = await prisma.pet.findFirst({
      where: {
        id: petId,
        userId: req.user!.id
      }
    });

    if (!existingPet) {
      throw new AppError('Pet not found', 404);
    }

    await prisma.pet.delete({
      where: { id: petId }
    });

    res.json({
      success: true,
      message: 'Pet deleted successfully'
    });
  })
);

// Get user statistics (Admin only)
router.get('/stats/overview', 
  authenticateToken,
  requireRole(['ADMIN']),
  asyncHandler(async (_req, res) => {
    const [allUsers, activeUsersData, verifiedUsersData, recentUsersData] = await Promise.all([
      prisma.user.findMany({ select: { id: true } }),
      prisma.user.findMany({ where: { isActive: true }, select: { id: true } }),
      prisma.user.findMany({ where: { isVerified: true }, select: { id: true } }),
      prisma.user.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        },
        select: { id: true }
      })
    ]);

    const totalUsers = allUsers.length;
    const activeUsers = activeUsersData.length;
    const verifiedUsers = verifiedUsersData.length;
    const recentUsers = recentUsersData.length;

    const usersWithRoles = await prisma.user.findMany({
      select: {
        role: true
      }
    });

    const usersByRole = usersWithRoles.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        verifiedUsers,
        recentUsers,
        usersByRole
      }
    });
  })
);

export default router;