import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

interface PaymentData {
  userId: number;
  amount: number;
  consultationId?: number;
  paymentMethod?: string;
  status?: string;
  paymentDate?: string;
  description?: string;
}

interface PaginationOptions {
  page: number;
  limit: number;
}

// Create new payment
export const createPaymentService = async (paymentData: PaymentData) => {
  try {
    const {
      userId,
      amount,
      consultationId,
      paymentMethod = 'card',
      status = 'pending',
      paymentDate,
      description
    } = paymentData;

    const payment = await prisma.payment.create({
    data: {
      userId,
      amount,
      consultationId,
      paymentMethod,
      status,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      description
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          mobile: true
        }
      },
      consultation: {
        select: {
          id: true,
          consultationType: true,
          status: true
        }
      }
    }
  });

    logger.info('Payment created successfully', { paymentId: payment.id, userId, amount });
    return payment;
  } catch (error) {
    logger.error('Failed to create payment', { error, paymentData });
    throw error;
  }
};

// Get payment by ID
export const getPaymentByIdService = async (paymentId: number, userId: number) => {
  try {
    const payment = await prisma.payment.findFirst({
    where: {
      id: paymentId,
      userId: userId
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          mobile: true
        }
      },
      consultation: {
        select: {
          id: true,
          consultationType: true,
          status: true
        }
      }
    }
  });

    return payment;
  } catch (error) {
    logger.error('Failed to get payment by ID', { error, paymentId, userId });
    throw error;
  }
};

// Update payment status
export const updatePaymentStatusService = async (paymentId: number, status: string, userId: number) => {
  try {
    const payment = await prisma.payment.updateMany({
    where: {
      id: paymentId,
      userId: userId
    },
    data: {
      status,
      updatedAt: new Date()
    }
  });

    if (payment.count === 0) {
      return null;
    }

    // Return the updated payment
    return await getPaymentByIdService(paymentId, userId);
  } catch (error) {
    logger.error('Failed to update payment status', { error, paymentId, status, userId });
    throw error;
  }
};

// Get user payments with pagination
export const getUserPaymentsService = async (userId: number, options: PaginationOptions) => {
  try {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where: {
        userId: userId
      },
      include: {
        consultation: {
          select: {
            id: true,
            consultationType: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    }),
    prisma.payment.count({
      where: {
        userId: userId
      }
    })
  ]);

    return {
      data: payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Failed to get user payments', { error, userId, options });
    throw error;
  }
};