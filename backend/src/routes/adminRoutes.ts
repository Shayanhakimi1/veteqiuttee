import { Router } from 'express';
import { Request, Response } from 'express';
import {
  getUsers,
  updateUserStatus,
  getUserStats
} from '../controllers/userController';
import {
  getPets,
  getPetStats
} from '../controllers/petController';
import {
  getConsultations,
  updateConsultationStatus,
  getConsultationStats
} from '../controllers/consultationController';
import {
  getPayments,
  updatePaymentStatus,
  refundPayment,
  getPaymentStats
} from '../controllers/paymentController';
import {
  getUsersValidator,
  updateUserStatusValidator,
  getUserStatsValidator
} from '../validators/userValidators';
import {
  getPetsValidator,
  getPetStatsValidator
} from '../validators/petValidators';
import {
  getConsultationsValidator,
  updateConsultationStatusValidator,
  getConsultationStatsValidator
} from '../validators/consultationValidators';
import {
  getPaymentsValidator,
  updatePaymentStatusValidator,
  refundPaymentValidator,
  getPaymentStatsValidator
} from '../validators/paymentValidators';
import {
  authenticateToken,
  requireAdmin,
  validateRequest
} from '../middleware';
import { logger } from '../utils/logger';
import { prisma } from '../config/database';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard overview
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const [userCount, petCount, consultationCount, paymentCount] = await Promise.all([
      prisma.user.count(),
      prisma.pet.count(),
      prisma.consultation.count(),
      prisma.payment.count()
    ]);

    const [recentUsers, recentConsultations, recentPayments] = await Promise.all([
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
          status: true
        }
      }),
      prisma.consultation.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
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
        }
      }),
      prisma.payment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          },
          consultation: {
            select: {
              type: true
            }
          }
        }
      })
    ]);

    logger.logAPI('info', 'Admin dashboard accessed', { userId: req.user?.id });

    res.json({
      success: true,
      data: {
        overview: {
          users: userCount,
          pets: petCount,
          consultations: consultationCount,
          payments: paymentCount
        },
        recent: {
          users: recentUsers,
          consultations: recentConsultations,
          payments: recentPayments
        }
      }
    });
  } catch (error) {
    logger.logAPI('error', 'Admin dashboard error', { error, userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'خطا در بارگذاری داشبورد مدیریت',
      code: 'DASHBOARD_ERROR'
    });
  }
});

// User management
router.get('/users',
  getUsersValidator,
  validateRequest,
  getUsers
);

router.get('/users/stats',
  getUserStatsValidator,
  validateRequest,
  getUserStats
);

router.put('/users/:id/status',
  updateUserStatusValidator,
  validateRequest,
  updateUserStatus
);

// Pet management
router.get('/pets',
  getPetsValidator,
  validateRequest,
  getPets
);

router.get('/pets/stats',
  getPetStatsValidator,
  validateRequest,
  getPetStats
);

// Consultation management
router.get('/consultations',
  getConsultationsValidator,
  validateRequest,
  getConsultations
);

router.get('/consultations/stats',
  getConsultationStatsValidator,
  validateRequest,
  getConsultationStats
);

router.put('/consultations/:id/status',
  updateConsultationStatusValidator,
  validateRequest,
  updateConsultationStatus
);

// Payment management
router.get('/payments',
  getPaymentsValidator,
  validateRequest,
  getPayments
);

router.get('/payments/stats',
  getPaymentStatsValidator,
  validateRequest,
  getPaymentStats
);

router.put('/payments/:id/status',
  updatePaymentStatusValidator,
  validateRequest,
  updatePaymentStatus
);

router.post('/payments/:id/refund',
  refundPaymentValidator,
  validateRequest,
  refundPayment
);

// System health and monitoring
router.get('/system/health', async (req: Request, res: Response) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Get system stats
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    logger.logAPI('info', 'System health checked', { userId: req.user?.id });

    res.json({
      success: true,
      data: {
        status: 'healthy',
        uptime: Math.floor(uptime),
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          external: Math.round(memoryUsage.external / 1024 / 1024)
        },
        database: 'connected',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.logAPI('error', 'System health check failed', { error, userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'خطا در بررسی سلامت سیستم',
      code: 'HEALTH_CHECK_ERROR'
    });
  }
});

// System logs (last 100 entries)
router.get('/system/logs', async (req: Request, res: Response) => {
  try {
    const { level = 'all', limit = 100 } = req.query;
    
    // This would typically read from log files or a logging service
    // For now, we'll return a placeholder response
    logger.logAPI('info', 'System logs accessed', { userId: req.user?.id, level, limit });

    res.json({
      success: true,
      message: 'برای مشاهده لاگ‌های سیستم، لطفاً به فایل‌های لاگ مراجعه کنید',
      data: {
        logPath: './logs/',
        availableFiles: ['error.log', 'combined.log', 'access.log']
      }
    });
  } catch (error) {
    logger.logAPI('error', 'System logs access failed', { error, userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'خطا در دسترسی به لاگ‌های سیستم',
      code: 'LOGS_ACCESS_ERROR'
    });
  }
});

// Bulk operations
router.post('/bulk/users/update-status', async (req: Request, res: Response) => {
  try {
    const { userIds, status } = req.body;
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'لیست کاربران نامعتبر است',
        code: 'INVALID_USER_LIST'
      });
    }

    if (!['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'وضعیت نامعتبر است',
        code: 'INVALID_STATUS'
      });
    }

    const result = await prisma.user.updateMany({
      where: {
        id: { in: userIds }
      },
      data: {
        status,
        updatedAt: new Date()
      }
    });

    logger.logAPI('info', 'Bulk user status update', {
      userId: req.user?.id,
      affectedUsers: result.count,
      newStatus: status
    });

    res.json({
      success: true,
      message: `وضعیت ${result.count} کاربر با موفقیت به‌روزرسانی شد`,
      data: {
        updatedCount: result.count
      }
    });
  } catch (error) {
    logger.logAPI('error', 'Bulk user status update failed', { error, userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'خطا در به‌روزرسانی گروهی وضعیت کاربران',
      code: 'BULK_UPDATE_ERROR'
    });
  }
});

export default router;