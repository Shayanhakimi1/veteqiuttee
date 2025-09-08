import express from 'express';
import { prisma } from '../utils/database.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { validate, consultationSchemas, querySchemas, paramSchemas } from '../middleware/validation.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get all consultations for current user
router.get('/', 
  authenticateToken,
  validate(querySchemas.consultationFilters, 'query'),
  asyncHandler(async (_req, res) => {
    const { page = 1, limit = 10, search, status, priority, sortBy = 'createdAt', sortOrder = 'desc' } = _req.query;
    const userId = _req.user!.id;
    const isAdmin = _req.user!.role === 'ADMIN';
    
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Build where clause
    const where: any = isAdmin ? {} : { userId };
    
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.urgencyLevel = priority;
    }

    // Get consultations with pagination
    const [consultations, allConsultations] = await Promise.all([
      prisma.consultation.findMany({
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
          pet: {
            select: {
              id: true,
              name: true,
              species: true,
              breed: true,
              age: true,
              avatar: true
            }
          },
          files: {
            select: {
              id: true,
              filename: true,
              fileType: true
            },
            take: 3
          },
          _count: {
            select: {
              files: true,
              medicalRecords: true,
              payments: true
            }
          }
        },
        skip,
        take,
        orderBy: {
          [sortBy as string]: sortOrder
        }
      }),
      prisma.consultation.findMany({
        where,
        select: { id: true }
      })
    ]);

    const total = allConsultations.length;

    const totalPages = Math.ceil(total / take);

    res.json({
      success: true,
      data: {
        consultations,
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

// Get consultation by ID
router.get('/:id', 
  authenticateToken,
  validate(paramSchemas.id, 'params'),
  asyncHandler(async (_req, res) => {
    const { id } = _req.params;
    const currentUser = _req.user!;

    const consultation = await prisma.consultation.findUnique({
      where: { id: id as string },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true
          }
        },
        pet: {
            select: {
              id: true,
              name: true,
              species: true,
              breed: true,
              age: true,
              gender: true,
              weight: true,
              color: true,
              avatar: true
            }
          },
        files: {
          select: {
            id: true,
            filename: true,
            originalName: true,
            fileType: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        medicalRecords: {
          select: {
            id: true,
            title: true,
            description: true,
            recordType: true,
            recordDate: true,
            createdAt: true
          },
          orderBy: {
            recordDate: 'desc'
          }
        },
        payments: {
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            paymentMethod: true,
            transactionId: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!consultation) {
      throw new AppError('Consultation not found', 404);
    }

    // Check if user is owner or admin
    if (currentUser.role !== 'ADMIN' && consultation.userId !== currentUser.id) {
      throw new AppError('Access denied', 403);
    }

    res.json({
      success: true,
      data: { consultation }
    });
  })
);

// Create new consultation
router.post('/', 
  authenticateToken,
  validate(consultationSchemas.create),
  asyncHandler(async (_req, res) => {
    const { title, description, petId, priority = 'MEDIUM', symptoms, urgentCare = false } = _req.body;
    const userId = _req.user!.id;

    // Check if pet exists and belongs to user
    const pet = await prisma.pet.findUnique({
      where: { id: petId }
    });

    if (!pet) {
      throw new AppError('Pet not found', 404);
    }

    if (pet.userId !== userId) {
      throw new AppError('Pet does not belong to you', 403);
    }

    const consultation = await prisma.consultation.create({
      data: {
        title,
        description,
        petId,
        userId,
        urgencyLevel: priority,
        symptoms,
        status: 'PENDING'
      },
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
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            age: true,
            avatar: true
          }
        }
      }
    });

    logger.info('Consultation created', {
      consultationId: consultation.id,
      userId,
      petId,
      title: consultation.title,
      urgencyLevel: consultation.urgencyLevel,
      urgentCare
    });

    res.status(201).json({
      success: true,
      message: 'Consultation created successfully',
      data: { consultation }
    });
  })
);

// Update consultation
router.patch('/:id', 
  authenticateToken,
  validate(paramSchemas.id, 'params'),
  validate(consultationSchemas.update),
  asyncHandler(async (_req, res) => {
    const { id } = _req.params;
    const currentUser = _req.user!;
    const { title, description, priority, symptoms, urgentCare } = _req.body;

    // Check if consultation exists
    const existingConsultation = await prisma.consultation.findUnique({
      where: { id: id as string }
    });

    if (!existingConsultation) {
      throw new AppError('Consultation not found', 404);
    }

    // Check if user is owner or admin
    if (currentUser.role !== 'ADMIN' && existingConsultation.userId !== currentUser.id) {
      throw new AppError('Access denied', 403);
    }

    // Users can only update their own consultations if status is PENDING or DRAFT
    if (currentUser.role !== 'ADMIN' && 
        !['PENDING', 'DRAFT'].includes(existingConsultation.status)) {
      throw new AppError('Cannot update consultation in current status', 400);
    }

    const updatedConsultation = await prisma.consultation.update({
      where: { id: id as string },
      data: {
        title,
        description,
        priority,
        symptoms,
        urgentCare,
        ...(urgentCare && existingConsultation.status === 'PENDING' && { status: 'URGENT' })
      },
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
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            age: true,
            avatar: true
          }
        }
      }
    });

    logger.info('Consultation updated', {
      consultationId: id,
      updatedBy: currentUser.id,
      changes: { title, description, priority, symptoms, urgentCare }
    });

    res.json({
      success: true,
      message: 'Consultation updated successfully',
      data: { consultation: updatedConsultation }
    });
  })
);

// Update consultation status (Admin only)
router.patch('/:id/status', 
  authenticateToken,
  requireRole(['ADMIN']),
  validate(paramSchemas.id, 'params'),
  validate(consultationSchemas.adminUpdate),
  asyncHandler(async (_req, res) => {
    const { id } = _req.params;
    const { status, veterinarianNotes, diagnosis, treatment } = _req.body;
    const currentUser = _req.user!;

    // Check if consultation exists
    const existingConsultation = await prisma.consultation.findUnique({
      where: { id: id as string }
    });

    if (!existingConsultation) {
      throw new AppError('Consultation not found', 404);
    }

    const updatedConsultation = await prisma.consultation.update({
      where: { id: id as string },
      data: {
        status,
        veterinarianNotes,
        diagnosis,
        treatment
      },
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
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true
          }
        }
      }
    });

    logger.info('Consultation status updated by admin', {
      consultationId: id,
      newStatus: status,
      adminId: currentUser.id,
      diagnosis,
      treatment
    });

    res.json({
      success: true,
      message: 'Consultation status updated successfully',
      data: { consultation: updatedConsultation }
    });
  })
);

// Delete consultation
router.delete('/:id', 
  authenticateToken,
  validate(paramSchemas.id, 'params'),
  asyncHandler(async (_req, res) => {
    const { id } = _req.params;
    const currentUser = _req.user!;

    // Check if consultation exists
    const consultation = await prisma.consultation.findUnique({
      where: { id: id as string },
      include: {
        files: {
          select: {
            id: true
          }
        },
        medicalRecords: {
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

    if (!consultation) {
      throw new AppError('Consultation not found', 404);
    }

    // Check if user is owner or admin
    if (currentUser.role !== 'ADMIN' && consultation.userId !== currentUser.id) {
      throw new AppError('Access denied', 403);
    }

    // Users can only delete their own consultations if status is PENDING or DRAFT
    if (currentUser.role !== 'ADMIN' && 
        !['PENDING', 'DRAFT'].includes(consultation.status)) {
      throw new AppError('Cannot delete consultation in current status', 400);
    }

    // Check if consultation has related data
    if (consultation.files.length > 0 || consultation.medicalRecords.length > 0 || consultation.payments.length > 0) {
      throw new AppError('Cannot delete consultation with existing files, medical records, or payments', 400);
    }

    await prisma.consultation.delete({
      where: { id: id as string }
    });

    logger.info('Consultation deleted', {
      consultationId: id,
      deletedBy: currentUser.id,
      title: consultation.title
    });

    res.json({
      success: true,
      message: 'Consultation deleted successfully'
    });
  })
);

// Get consultation statistics (Admin only)
router.get('/stats/overview', 
  authenticateToken,
  requireRole(['ADMIN']),
  asyncHandler(async (_req, res) => {
    const [allConsultationsForTotal, recentConsultationsData, urgentConsultationsData] = await Promise.all([
      prisma.consultation.findMany({
        select: { id: true }
      }),
      prisma.consultation.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        },
        select: { id: true }
      }),
      prisma.consultation.findMany({
        where: {
          urgencyLevel: 'HIGH'
        },
        select: { id: true }
      })
    ]);

    const totalConsultations = allConsultationsForTotal.length;
    const recentConsultations = recentConsultationsData.length;
    const urgentConsultations = urgentConsultationsData.length;

    const allConsultations = await prisma.consultation.findMany({
      select: {
        status: true,
        urgencyLevel: true
      }
    });

    const consultationsByStatus = allConsultations.reduce((acc, consultation) => {
      acc[consultation.status] = (acc[consultation.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const consultationsByPriority = allConsultations.reduce((acc, consultation) => {
      acc[consultation.urgencyLevel] = (acc[consultation.urgencyLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      success: true,
      data: {
        totalConsultations,
        recentConsultations,
        urgentConsultations,
        consultationsByStatus,
        consultationsByPriority
      }
    });
  })
);

export default router;