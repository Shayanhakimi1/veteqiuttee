import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    fullName: string;
    mobile: string;
    role: string;
  };
}

// Get dashboard statistics
export const getDashboardStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [totalUsers, totalPayments, totalConsultations, pendingPayments] = await Promise.all([
      prisma.user.count(),
      prisma.payment.count(),
      prisma.consultation.count(),
      prisma.payment.count({
        where: {
          status: 'PENDING_VERIFICATION'
        }
      })
    ]);

    const stats = {
      totalUsers,
      totalPayments,
      totalConsultations,
      pendingPayments
    };

    res.json(stats);
  } catch (error: any) {
    logger.error('Failed to get dashboard stats', { error: error.message });
    res.status(500).json({ error: { message: error.message } });
  }
};

// Get all users with their pets
export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    
    const parsedPage = parseInt(page as string);
    const parsedLimit = parseInt(limit as string);
    
    if (isNaN(parsedPage) || parsedPage < 1) {
      return res.status(400).json({ error: { message: 'Invalid page number' } });
    }
    
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      return res.status(400).json({ error: { message: 'Invalid limit (must be between 1 and 100)' } });
    }
    
    const skip = (parsedPage - 1) * parsedLimit;
    
    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { fullName: { contains: search as string } },
        { mobile: { contains: search as string } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        include: {
          pets: true,
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              createdAt: true
            }
          },
          consultations: {
            select: {
              id: true,
              consultationType: true,
              status: true,
              createdAt: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.user.count({ where: whereClause })
    ]);

    res.json({
      data: users,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error: any) {
    logger.error('Failed to get all users', { error: error.message });
    res.status(500).json({ error: { message: error.message } });
  }
};

// Get all pets
export const getAllPets = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [pets, total] = await Promise.all([
      prisma.pet.findMany({
        include: {
          owner: {
            select: {
              id: true,
              fullName: true,
              mobile: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.pet.count()
    ]);

    res.json({
      data: pets,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error: any) {
    logger.error('Failed to get all pets', { error: error.message });
    res.status(500).json({ error: { message: error.message } });
  }
};

// Get all payments
export const getAllPayments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const whereClause: any = {};
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: whereClause,
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
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.payment.count({ where: whereClause })
    ]);

    res.json({
      data: payments,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error: any) {
    logger.error('Failed to get all payments', { error: error.message });
    res.status(500).json({ error: { message: error.message } });
  }
};

// Get all consultations
export const getAllConsultations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const whereClause: any = {};
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const [consultations, total] = await Promise.all([
      prisma.consultation.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              mobile: true
            }
          },
          pet: {
            select: {
              id: true,
              name: true,
              petType: true,
              breed: true
            }
          },
          payment: {
            select: {
              id: true,
              amount: true,
              status: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.consultation.count({ where: whereClause })
    ]);

    res.json({
      data: consultations,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error: any) {
    logger.error('Failed to get all consultations', { error: error.message });
    res.status(500).json({ error: { message: error.message } });
  }
};

// Update payment status
export const updatePaymentStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { paymentId } = req.params;
    const { status } = req.body;

    const parsedPaymentId = parseInt(paymentId);
    if (isNaN(parsedPaymentId)) {
      return res.status(400).json({ error: { message: 'Invalid payment ID' } });
    }

    const payment = await prisma.payment.update({
      where: {
        id: parsedPaymentId
      },
      data: {
        status,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            mobile: true
          }
        }
      }
    });

    logger.info('Payment status updated', { paymentId, status, adminId: req.user?.id });
    res.json({ message: 'Payment status updated successfully', payment });
  } catch (error: any) {
    logger.error('Failed to update payment status', { error: error.message, paymentId: req.params.paymentId });
    res.status(500).json({ error: { message: error.message } });
  }
};

// Update consultation status
export const updateConsultationStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { consultationId } = req.params;
    const { status } = req.body;

    const parsedConsultationId = parseInt(consultationId);
    if (isNaN(parsedConsultationId)) {
      return res.status(400).json({ error: { message: 'Invalid consultation ID' } });
    }

    const consultation = await prisma.consultation.update({
      where: {
        id: parsedConsultationId
      },
      data: {
        status,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            mobile: true
          }
        },
        pet: {
          select: {
            id: true,
            name: true,
            petType: true
          }
        }
      }
    });

    logger.info('Consultation status updated', { consultationId, status, adminId: req.user?.id });
    res.json({ message: 'Consultation status updated successfully', consultation });
  } catch (error: any) {
    logger.error('Failed to update consultation status', { error: error.message, consultationId: req.params.consultationId });
    res.status(500).json({ error: { message: error.message } });
  }
};

// Get user details by ID
export const getUserById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(userId)
      },
      include: {
        pets: true,
        payments: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        consultations: {
          include: {
            pet: {
              select: {
                name: true,
                petType: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }

    res.json({ user });
  } catch (error: any) {
    logger.error('Failed to get user by ID', { error: error.message, userId: req.params.userId });
    res.status(500).json({ error: { message: error.message } });
  }
};