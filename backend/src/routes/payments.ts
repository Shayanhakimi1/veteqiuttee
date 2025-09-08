import express from 'express';
import { prisma } from '../utils/database.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { validate, paymentSchemas, querySchemas, paramSchemas } from '../middleware/validation.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get all payments for current user
router.get('/', 
  authenticateToken,
  validate(querySchemas.pagination, 'query'),
  asyncHandler(async (_req, res) => {
    const { page = 1, limit = 10, status, paymentMethod, sortBy = 'createdAt', sortOrder = 'desc' } = _req.query;
     const userId = _req.user!.id;
    const isAdmin = _req.user!.role === 'ADMIN';
    
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Build where clause
    const where: any = isAdmin ? {} : { userId };
    
    if (status) {
      where.status = status;
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    // Get payments with pagination
    const [payments, allPayments] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          consultation: {
            select: {
              id: true,
              title: true,
              status: true,
              pet: {
                select: {
                  id: true,
                  name: true,
                  species: true
                }
              }
            }
          }
        },
        skip,
        take,
        orderBy: {
          [sortBy as string]: sortOrder
        }
      }),
      prisma.payment.findMany({
        where,
        select: { id: true }
      })
    ]);

    const total = allPayments.length;

    const totalPages = Math.ceil(total / take);

    res.json({
      success: true,
      data: {
        payments,
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

// Get payment by ID
router.get('/:id', 
  authenticateToken,
  validate(paramSchemas.id, 'params'),
  asyncHandler(async (_req, res) => {
    const { id } = _req.params;
     const currentUser = _req.user!;

    const payment = await prisma.payment.findUnique({
      where: { id: id as string },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        consultation: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,

            pet: {
              select: {
                id: true,
                name: true,
                species: true,
                breed: true
              }
            }
          }
        }
      }
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    // Check if user is owner or admin
    if (currentUser.role !== 'ADMIN' && payment.userId !== currentUser.id) {
      throw new AppError('Access denied', 403);
    }

    res.json({
      success: true,
      data: { payment }
    });
  })
);

// Create new payment
router.post('/', 
  authenticateToken,
  validate(paymentSchemas.create),
  asyncHandler(async (_req, res) => {
    const { 
      consultationId, 
      amount, 
      currency = 'USD', 
      paymentMethod, 
      description,

    } = _req.body;
    const userId = _req.user!.id;

    // Check if consultation exists and belongs to user
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId }
    });

    if (!consultation) {
      throw new AppError('Consultation not found', 404);
    }

    if (consultation.userId !== userId) {
      throw new AppError('Consultation does not belong to you', 403);
    }

    // Check if consultation already has a successful payment
    const existingPayment = await prisma.payment.findFirst({
      where: {
        consultationId,
        status: 'COMPLETED'
      }
    });

    if (existingPayment) {
      throw new AppError('Consultation already has a completed payment', 400);
    }

    // Generate transaction ID
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const payment = await prisma.payment.create({
      data: {
        consultationId,
        userId,
        amount,
        currency,
        paymentMethod,
        description,
        transactionId,
        status: 'PENDING' // Will be updated after payment gateway confirmation
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        consultation: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    logger.info('Payment created', {
      paymentId: payment.id,
      consultationId,
      userId,
      amount,
      currency,
      paymentMethod,
      transactionId
    });

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: { payment }
    });
  })
);

// Update payment status (Admin only or payment gateway webhook)
router.patch('/:id/status', 
  authenticateToken,
  validate(paramSchemas.id, 'params'),

  asyncHandler(async (_req, res) => {
    const { id } = _req.params;
    const { status, gatewayTransactionId, gatewayResponse } = _req.body;
    const currentUser = _req.user!;

    // Check if payment exists
    const existingPayment = await prisma.payment.findUnique({
      where: { id: id as string },
      include: {
        consultation: true
      }
    });

    if (!existingPayment) {
      throw new AppError('Payment not found', 404);
    }

    // Only admin can update payment status manually
    if (currentUser.role !== 'ADMIN') {
      throw new AppError('Access denied', 403);
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: id as string },
      data: {
        status,
        gatewayResponse
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
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
    });

    // If payment is completed, update consultation status if needed
    if (status === 'COMPLETED' && existingPayment.consultation && existingPayment.consultation.status === 'PENDING' && existingPayment.consultationId) {
      await prisma.consultation.update({
        where: { id: existingPayment.consultationId },
        data: { status: 'IN_PROGRESS' }
      });
    }

    logger.info('Payment status updated', {
      paymentId: id,
      newStatus: status,
      updatedBy: currentUser.id,
      gatewayTransactionId
    });

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: { payment: updatedPayment }
    });
  })
);

// Confirm payment (User uploads receipt)
router.patch('/:id/confirm', 
  authenticateToken,
  validate(paramSchemas.id, 'params'),

  asyncHandler(async (_req, res) => {
    const { id } = _req.params;
     const currentUser = _req.user!;

    // Check if payment exists
    const payment = await prisma.payment.findUnique({
      where: { id: id as string }
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    // Check if user owns the payment
    if (payment.userId !== currentUser.id) {
      throw new AppError('Access denied', 403);
    }

    // Check if payment is in correct status
    if (payment.status !== 'PENDING') {
      throw new AppError('Payment cannot be confirmed in current status', 400);
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: id as string },
      data: {
        status: 'COMPLETED'
      },
      include: {
        consultation: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    logger.info('Payment confirmed by user', {
      paymentId: id,
      userId: currentUser.id
    });

    res.json({
      success: true,
      message: 'Payment confirmation submitted successfully. Awaiting admin verification.',
      data: { payment: updatedPayment }
    });
  })
);

// Cancel payment
router.patch('/:id/cancel', 
  authenticateToken,
  validate(paramSchemas.id, 'params'),
  asyncHandler(async (_req, res) => {
    const { id } = _req.params;
    const { reason } = _req.body;
    const currentUser = _req.user!;

    // Check if payment exists
    const payment = await prisma.payment.findUnique({
      where: { id: id as string }
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    // Check permissions
    const canCancel = currentUser.role === 'ADMIN' || 
                     (payment.userId === currentUser.id && 
                      ['PENDING', 'PENDING_VERIFICATION'].includes(payment.status));

    if (!canCancel) {
      throw new AppError('Cannot cancel this payment', 403);
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: id as string },
      data: {
        status: 'CANCELLED'
      }
    });

    logger.info('Payment cancelled', {
      paymentId: id,
      cancelledBy: currentUser.id,
      reason
    });

    res.json({
      success: true,
      message: 'Payment cancelled successfully',
      data: { payment: updatedPayment }
    });
  })
);

// Get payment statistics (Admin only)
router.get('/stats/overview', 
  authenticateToken,
  requireRole(['ADMIN']),
  asyncHandler(async (_req, res) => {
    const [allPaymentsForTotal, totalRevenue, recentPaymentsData] = await Promise.all([
      prisma.payment.findMany({
        select: { id: true }
      }),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      prisma.payment.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        },
        select: { id: true }
      })
    ]);

    const totalPayments = allPaymentsForTotal.length;
    const recentPayments = recentPaymentsData.length;

    const allPayments = await prisma.payment.findMany({
      select: {
        id: true,
        status: true,
        paymentMethod: true,
        amount: true,
        createdAt: true
      }
    });

    const paymentsByStatus = allPayments.reduce((acc, payment) => {
      if (!acc[payment.status]) {
        acc[payment.status] = { count: 0, total: 0 };
      }
      acc[payment.status]!.count += 1;
      acc[payment.status]!.total += payment.amount;
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    const paymentsByMethod = allPayments.reduce((acc, payment) => {
      if (!acc[payment.paymentMethod]) {
        acc[payment.paymentMethod] = { count: 0, total: 0 };
      }
      acc[payment.paymentMethod]!.count += 1;
      acc[payment.paymentMethod]!.total += payment.amount;
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    const completedPayments = allPayments.filter(p => 
      p.status === 'COMPLETED' && 
      p.createdAt >= new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000)
    );

    const monthlyRevenue = completedPayments.reduce((acc, payment) => {
      const monthKey = payment.createdAt.toISOString().substring(0, 7); // YYYY-MM
      if (!acc[monthKey]) {
        acc[monthKey] = 0;
      }
      acc[monthKey] += payment.amount;
      return acc;
    }, {} as Record<string, number>);

    const monthlyRevenueArray = Object.entries(monthlyRevenue)
      .map(([month, revenue]) => ({ month: new Date(month + '-01'), revenue }))
      .sort((a, b) => a.month.getTime() - b.month.getTime());

    res.json({
      success: true,
      data: {
        totalPayments,
        totalRevenue: totalRevenue._sum.amount || 0,
        recentPayments,
        paymentsByStatus,
        paymentsByMethod,
        monthlyRevenue: monthlyRevenueArray
      }
    });
  })
);

// Get pending payments for verification (Admin only)
router.get('/pending-verification', 
  authenticateToken,
  requireRole(['ADMIN']),
  validate(querySchemas.pagination, 'query'),
  asyncHandler(async (_req, res) => {
    const { page = 1, limit = 10 } = _req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [payments, allPendingPayments] = await Promise.all([
      prisma.payment.findMany({
        where: { status: 'PENDING' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          },
          consultation: {
            select: {
              id: true,
              title: true,

              pet: {
                select: {
                  id: true,
                  name: true,
                  species: true
                }
              }
            }
          }
        },
        skip,
        take,
        orderBy: {
          createdAt: 'asc'
        }
      }),
      prisma.payment.findMany({
        where: { status: 'PENDING' },
        select: { id: true }
      })
    ]);

    const total = allPendingPayments.length;

    const totalPages = Math.ceil(total / take);

    res.json({
      success: true,
      data: {
        payments,
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

export default router;