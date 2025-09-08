import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { prisma } from '../utils/database.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { validate, querySchemas, paramSchemas } from '../middleware/validation.js';
import { authenticateAdmin, requireRole } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
const router = express.Router();

// Admin login validation schema
const adminLoginSchema = Joi.object({
  mobile: Joi.string().required().messages({
    'string.empty': 'Mobile is required',
    'any.required': 'Mobile is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'string.empty': 'Password is required',
    'any.required': 'Password is required'
  })
});

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

// Admin login endpoint
router.post('/login', validate(adminLoginSchema), asyncHandler(async (req, res) => {
  const { mobile, password } = req.body;

  // Find admin by mobile (we'll use email field to store mobile for admin)
  const admin = await prisma.admin.findFirst({
    where: {
      email: mobile
    }
  });

  if (!admin) {
    throw new AppError('اطلاعات ورود نادرست است', 401);
  }

  // Check if admin is active
  if (!admin.isActive) {
    throw new AppError('حساب کاربری غیرفعال است', 401);
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, admin.password);
  if (!isValidPassword) {
    throw new AppError('اطلاعات ورود نادرست است', 401);
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(admin.id, mobile, admin.role);

  // Note: Admin refresh tokens are not stored in the database
  // They are handled differently from user refresh tokens for security reasons

  // Update last login
  await prisma.admin.update({
    where: { id: admin.id },
    data: { lastLogin: new Date() }
  });

  logger.info('Admin logged in successfully', {
    adminId: admin.id,
    mobile: mobile
  });

  res.json({
    success: true,
    message: 'ورود موفقیت‌آمیز بود',
    data: {
      admin: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role
      },
      tokens: {
        accessToken,
        refreshToken
      }
    }
  });
}));

// Get dashboard overview (Admin only)
router.get('/dashboard', 
  authenticateAdmin,
  asyncHandler(async (_req, res) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get basic statistics
    const [allUsers, allPets, allConsultations, completedPayments] = await Promise.all([
      prisma.user.findMany({ select: { id: true } }),
      prisma.pet.findMany({ select: { id: true } }),
      prisma.consultation.findMany({ select: { id: true } }),
      prisma.payment.findMany({ 
        where: { status: 'COMPLETED' },
        select: { id: true }
      })
    ]);

    const totalUsers = allUsers.length;
    const totalPets = allPets.length;
    const totalConsultations = allConsultations.length;
    const totalPayments = completedPayments.length;

    // Get recent statistics (last 30 days)
    const [recentUsersData, recentConsultationsData, recentPaymentsData] = await Promise.all([
      prisma.user.findMany({ 
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { id: true }
      }),
      prisma.consultation.findMany({ 
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { id: true }
      }),
      prisma.payment.findMany({ 
        where: { 
          status: 'COMPLETED',
          createdAt: { gte: thirtyDaysAgo } 
        },
        select: { id: true }
      })
    ]);

    const recentUsers = recentUsersData.length;
    const recentConsultations = recentConsultationsData.length;
    const recentPayments = recentPaymentsData.length;

    // Get revenue statistics
    const [totalRevenue, monthlyRevenue, weeklyRevenue] = await Promise.all([
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      prisma.payment.aggregate({
        where: { 
          status: 'COMPLETED',
          createdAt: { gte: thirtyDaysAgo }
        },
        _sum: { amount: true }
      }),
      prisma.payment.aggregate({
        where: { 
          status: 'COMPLETED',
          createdAt: { gte: sevenDaysAgo }
        },
        _sum: { amount: true }
      })
    ]);

    // Get consultation status breakdown
    const consultationsByStatus = await prisma.consultation.findMany({
      select: {
        status: true
      }
    });

    // Get urgent consultations
    const urgentConsultationsData = await prisma.consultation.findMany({
      where: { 
        urgencyLevel: 'HIGH'
      },
      select: { id: true }
    });
    const urgentConsultations = urgentConsultationsData.length;

    // Get pending payments for verification
    const pendingPaymentsData = await prisma.payment.findMany({
      where: { status: 'PENDING' },
      select: { id: true }
    });
    const pendingPayments = pendingPaymentsData.length;

    // Get recent activities
    const recentActivities = await Promise.all([
      prisma.user.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          mobile: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.consultation.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: {
          id: true,
          title: true,
          status: true,
          urgencyLevel: true,
          createdAt: true,
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          pet: {
            select: {
              name: true,
              species: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalPets,
          totalConsultations,
          totalPayments,
          totalRevenue: totalRevenue._sum.amount || 0,
          urgentConsultations,
          pendingPayments
        },
        recent: {
          users: recentUsers,
          consultations: recentConsultations,
          payments: recentPayments,
          revenue: {
            monthly: monthlyRevenue._sum.amount || 0,
            weekly: weeklyRevenue._sum.amount || 0
          }
        },
        consultationsByStatus: consultationsByStatus.reduce((acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        recentActivities: {
          newUsers: recentActivities[0],
          newConsultations: recentActivities[1]
        }
      }
    });
  })
);

// Get all admins (Super Admin only)
router.get('/admins', 
  authenticateAdmin,
  requireRole(['SUPER_ADMIN']),
  validate(querySchemas.pagination, 'query'),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Build where clause for search
    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search as string } },
        { lastName: { contains: search as string } },
        { email: { contains: search as string } }
      ];
    }

    // Get admins with pagination
    const [admins, allAdmins] = await Promise.all([
      prisma.admin.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true
        },
        skip,
        take,
        orderBy: {
          [sortBy as string]: sortOrder
        }
      }),
      prisma.admin.findMany({
        where,
        select: { id: true }
      })
    ]);

    const totalAdmins = allAdmins.length;

    const totalPages = Math.ceil(totalAdmins / take);

    res.json({
      success: true,
      data: {
        admins,
        pagination: {
          page: Number(page),
          limit: take,
          total: totalAdmins,
          totalPages,
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1
        }
      }
    });
  })
);

// Create new admin (Super Admin only)
router.post('/admins', 
  authenticateAdmin,
  requireRole(['SUPER_ADMIN']),
  asyncHandler(async (req, res) => {
    const { email, password, firstName, lastName, role = 'ADMIN' } = req.body;
    const currentAdmin = req.admin!;

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      throw new AppError('All fields are required', 400);
    }

    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters long', 400);
    }

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      throw new AppError('Admin with this email already exists', 409);
    }

    // Hash password
    const saltRounds = parseInt(process.env['BCRYPT_SALT_ROUNDS'] || '12');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    logger.info('Admin created', {
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
      createdBy: currentAdmin.id
    });

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: { admin }
    });
  })
);

// Update admin (Super Admin only)
router.patch('/admins/:id', 
  authenticateAdmin,
  requireRole(['SUPER_ADMIN']),
  validate(paramSchemas.id, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const { firstName, lastName, role, isActive } = req.body;
    const currentAdmin = req.admin!;

    // Check if admin exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { id: id as string }
    });

    if (!existingAdmin) {
      throw new AppError('Admin not found', 404);
    }

    // Prevent super admin from deactivating themselves
    if (existingAdmin.id === currentAdmin.id && isActive === false) {
      throw new AppError('Cannot deactivate your own account', 400);
    }

    // Update admin
    const updatedAdmin = await prisma.admin.update({
      where: { id: id as string },
      data: {
        firstName,
        lastName,
        role,
        isActive
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    logger.info('Admin updated', {
      adminId: id,
      updatedBy: currentAdmin.id,
      changes: { firstName, lastName, role, isActive }
    });

    res.json({
      success: true,
      message: 'Admin updated successfully',
      data: { admin: updatedAdmin }
    });
  })
);

// Delete admin (Super Admin only)
router.delete('/admins/:id', 
  authenticateAdmin,
  requireRole(['SUPER_ADMIN']),
  validate(paramSchemas.id, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const currentAdmin = req.admin!;

    // Check if admin exists
    const admin = await prisma.admin.findUnique({
      where: { id: id as string }
    });

    if (!admin) {
      throw new AppError('Admin not found', 404);
    }

    // Prevent super admin from deleting themselves
    if (admin.id === currentAdmin.id) {
      throw new AppError('Cannot delete your own account', 400);
    }

    // Delete admin
    await prisma.admin.delete({
      where: { id: id as string }
    });

    logger.info('Admin deleted', {
      adminId: id,
      deletedBy: currentAdmin.id,
      adminEmail: admin.email
    });

    res.json({
      success: true,
      message: 'Admin deleted successfully'
    });
  })
);

// Get system logs (Super Admin only)
router.get('/logs', 
  authenticateAdmin,
  requireRole(['SUPER_ADMIN']),
  validate(querySchemas.pagination, 'query'),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 50 } = req.query;
    
    // This is a placeholder for log retrieval
    // In a real implementation, you would read from log files or a logging service
    
    res.json({
      success: true,
      message: 'Log retrieval not implemented yet. Please check log files directly.',
      data: {
        logs: [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      }
    });
  })
);

// Get system health (Admin only)
router.get('/health', 
  authenticateAdmin,
  asyncHandler(async (_req, res) => {
    try {
      // Check database connection
      await prisma.$queryRaw`SELECT 1`;
      
      // Get basic system info
      const [users, pets, consultations, payments, files] = await Promise.all([
        prisma.user.findMany({ select: { id: true } }),
        prisma.pet.findMany({ select: { id: true } }),
        prisma.consultation.findMany({ select: { id: true } }),
        prisma.payment.findMany({ select: { id: true } }),
        prisma.file.findMany({ select: { id: true } })
      ]);

      const dbStats = [
        users.length,
        pets.length,
        consultations.length,
        payments.length,
        files.length
      ];

      res.json({
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          database: {
            status: 'connected',
            tables: {
              users: dbStats[0],
              pets: dbStats[1],
              consultations: dbStats[2],
              payments: dbStats[3],
              files: dbStats[4]
            }
          },
          server: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            nodeVersion: process.version
          }
        }
      });
    } catch (error) {
      logger.error('Health check failed', { error });
      
      res.status(503).json({
        success: false,
        data: {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: 'Database connection failed'
        }
      });
    }
  })
);

// Export data (Super Admin only)
router.get('/export/:type', 
  authenticateAdmin,
  requireRole(['SUPER_ADMIN']),
  asyncHandler(async (req, res) => {
    const { type } = req.params;
    const { startDate, endDate, format = 'json' } = req.query;

    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate as string);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate as string);
    }

    let data: any;
    let filename: string;

    switch (type) {
      case 'users':
        data = await prisma.user.findMany({
          where: dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {},
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            isActive: true,
            isVerified: true,
            createdAt: true
          }
        });
        filename = `users_export_${new Date().toISOString().split('T')[0]}`;
        break;

      case 'consultations':
        data = await prisma.consultation.findMany({
          where: dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {},
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true
              }
            },
            pet: {
              select: {
                name: true,
                species: true,
                breed: true
              }
            }
          }
        });
        filename = `consultations_export_${new Date().toISOString().split('T')[0]}`;
        break;

      case 'payments':
        data = await prisma.payment.findMany({
          where: dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {},
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true
              }
            },
            consultation: {
              select: {
                title: true
              }
            }
          }
        });
        filename = `payments_export_${new Date().toISOString().split('T')[0]}`;
        break;

      default:
        throw new AppError('Invalid export type', 400);
    }

    if (format === 'csv') {
      // Convert to CSV (simplified implementation)
      const csv = data.length > 0 ? 
        Object.keys(data[0]).join(',') + '\n' +
        data.map((row: any) => Object.values(row).join(',')).join('\n') :
        '';
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
      res.json({
        success: true,
        exportDate: new Date().toISOString(),
        type,
        count: data.length,
        data
      });
    }

    logger.info('Data exported', {
      type,
      count: data.length,
      format,
      exportedBy: req.admin!.id
    });
  })
);

// Get all users (Admin only)
router.get('/users', 
  authenticateAdmin,
  validate(querySchemas.pagination, 'query'),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const searchStr = search as string;

    const where = searchStr ? {
      OR: [
        { firstName: { contains: searchStr } },
        { lastName: { contains: searchStr } },
        { mobile: { contains: searchStr } },
        { email: { contains: searchStr } }
      ]
    } : {};

    const [users, allUsers] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          mobile: true,
          email: true,
          isActive: true,
          createdAt: true,
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
        }
      }),
      prisma.user.findMany({
        where,
        select: { id: true }
      })
    ]);

    const totalUsers = allUsers.length;

    // Transform users to include counts
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
          limit: Number(limit),
          total: totalUsers,
          pages: Math.ceil(totalUsers / Number(limit))
        }
      }
    });
  })
);

// Get all pets (Admin only)
router.get('/pets', 
  authenticateAdmin,
  validate(querySchemas.pagination, 'query'),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const searchStr = search as string;

    const where = searchStr ? {
      OR: [
        { name: { contains: searchStr } },
        { species: { contains: searchStr } },
        { breed: { contains: searchStr } },
        { user: {
          OR: [
            { firstName: { contains: searchStr } },
          { lastName: { contains: searchStr } }
          ]
        }}
      ]
    } : {};

    const [pets, allPets] = await Promise.all([
      prisma.pet.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              mobile: true
            }
          },
          consultations: {
            select: {
              id: true
            }
          }
        }
      }),
      prisma.pet.findMany({
        where,
        select: { id: true }
      })
    ]);

    const totalPets = allPets.length;

    // Transform pets to include consultation counts
    const petsWithCounts = pets.map(pet => ({
      ...pet,
      consultations: pet.consultations.length
    }));

    res.json({
      success: true,
      data: {
        pets: petsWithCounts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalPets,
          pages: Math.ceil(totalPets / Number(limit))
        }
      }
    });
  })
);

// Get all consultations (Admin only)
router.get('/consultations', 
  authenticateAdmin,
  validate(querySchemas.pagination, 'query'),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status, urgencyLevel } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status;
    if (urgencyLevel) where.urgencyLevel = urgencyLevel;

    const [consultations, allConsultations] = await Promise.all([
      prisma.consultation.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              mobile: true
            }
          },
          pet: {
            select: {
              id: true,
              name: true,
              species: true,
              breed: true
            }
          }
        }
      }),
      prisma.consultation.findMany({
        where,
        select: { id: true }
      })
    ]);

    const totalConsultations = allConsultations.length;

    res.json({
      success: true,
      data: {
        consultations,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalConsultations,
          pages: Math.ceil(totalConsultations / Number(limit))
        }
      }
    });
  })
);

// Get all payments (Admin only)
router.get('/payments', 
  authenticateAdmin,
  validate(querySchemas.pagination, 'query'),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status;

    const [payments, allPayments] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              mobile: true
            }
          },
          consultation: {
            select: {
              id: true,
              title: true,
              status: true
            }
          }
        }
      }),
      prisma.payment.findMany({
        where,
        select: { id: true }
      })
    ]);

    const totalPayments = allPayments.length;

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalPayments,
          pages: Math.ceil(totalPayments / Number(limit))
        }
      }
    });
  })
);

// Update consultation status (Admin only)
router.patch('/consultations/:id/status', 
  authenticateAdmin,
  validate(paramSchemas.id, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const { status } = req.body;

    if (!['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    const consultation = await prisma.consultation.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            mobile: true
          }
        },
        pet: {
          select: {
            name: true
          }
        }
      }
    });

    logger.info(`Consultation ${id} status updated to ${status} by admin ${req.admin!.id}`);

    res.json({
      success: true,
      data: consultation,
      message: 'Consultation status updated successfully'
    });
  })
);

// Update payment status (Admin only)
router.patch('/payments/:id/status', 
  authenticateAdmin,
  validate(paramSchemas.id, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const { status } = req.body;

    if (!['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'].includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    const payment = await prisma.payment.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            mobile: true
          }
        },
        consultation: {
          select: {
            title: true
          }
        }
      }
    });

    logger.info(`Payment ${id} status updated to ${status} by admin ${req.admin!.id}`);

    res.json({
      success: true,
      data: payment,
      message: 'Payment status updated successfully'
    });
  })
);

export default router;