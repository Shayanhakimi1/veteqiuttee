import express from 'express';
import { prisma } from '../utils/database.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { validate, petSchemas, querySchemas, paramSchemas } from '../middleware/validation.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get all pets for current user
router.get('/', 
  authenticateToken,
  validate(querySchemas.pagination, 'query'),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const userId = req.user!.id;
    const isAdmin = req.user!.role === 'ADMIN';
    
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Build where clause
    const where: any = isAdmin ? {} : { userId: userId };
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { species: { contains: search as string, mode: 'insensitive' } },
        { breed: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Get pets with pagination
    const [pets, allPets] = await Promise.all([
      prisma.pet.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          consultations: {
            select: {
              id: true
            }
          },
          medicalRecords: {
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
      prisma.pet.findMany({
        where,
        select: { id: true }
      })
    ]);

    const total = allPets.length;

    const totalPages = Math.ceil(total / take);

    // Transform pets to include counts
    const petsWithCounts = pets.map(pet => ({
      ...pet,
      consultations: pet.consultations.length,
      medicalRecords: pet.medicalRecords.length
    }));

    res.json({
      success: true,
      data: {
        pets: petsWithCounts,
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

// Get pet by ID
router.get('/:id', 
  authenticateToken,
  validate(paramSchemas.id, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const currentUser = req.user!;

    const pet = await prisma.pet.findUnique({
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
        consultations: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,

            createdAt: true,
            updatedAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
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
          },
          take: 10
        }
      }
    });

    if (!pet) {
      throw new AppError('Pet not found', 404);
    }

    // Check if user is owner or admin
    if (currentUser.role !== 'ADMIN' && pet.userId !== currentUser.id) {
      throw new AppError('Access denied', 403);
    }

    // Transform pet to include counts
    const petWithCounts = {
      ...pet,
      consultations: pet.consultations.length,
      medicalRecords: pet.medicalRecords.length
    };

    res.json({
      success: true,
      data: { pet: petWithCounts }
    });
  })
);

// Create new pet
router.post('/', 
  authenticateToken,
  validate(petSchemas.create),
  asyncHandler(async (req, res) => {
    const { name, species, breed, age, gender, weight, color, description, avatar } = req.body;
    const userId = req.user!.id;

    const pet = await prisma.pet.create({
      data: {
        name,
        species,
        breed,
        age,
        gender,
        weight,
        color,
        description,
        avatar,
        userId
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    logger.info('Pet created', {
      petId: pet.id,
      petName: pet.name,

      species: pet.species
    });

    res.status(201).json({
      success: true,
      message: 'Pet created successfully',
      data: { pet }
    });
  })
);

// Update pet
router.patch('/:id', 
  authenticateToken,
  validate(paramSchemas.id, 'params'),
  validate(petSchemas.update),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const currentUser = req.user!;
    const { name, species, breed, age, gender, weight, color, description, avatar } = req.body;

    // Check if pet exists
    const existingPet = await prisma.pet.findUnique({
      where: { id: id as string }
    });

    if (!existingPet) {
      throw new AppError('Pet not found', 404);
    }

    // Check if user is owner or admin
    if (currentUser.role !== 'ADMIN' && existingPet.userId !== currentUser.id) {
      throw new AppError('Access denied', 403);
    }

    const updatedPet = await prisma.pet.update({
      where: { id: id as string },
      data: {
        name,
        species,
        breed,
        age,
        gender,
        weight,
        color,
        description,
        avatar
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    logger.info('Pet updated', {
      petId: id,
      updatedBy: currentUser.id,
      changes: { name, species, breed, age, gender, weight, color, description, avatar }
    });

    res.json({
      success: true,
      message: 'Pet updated successfully',
      data: { pet: updatedPet }
    });
  })
);

// Delete pet
router.delete('/:id', 
  authenticateToken,
  validate(paramSchemas.id, 'params'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const currentUser = req.user!;

    // Check if pet exists
    const pet = await prisma.pet.findUnique({
      where: { id: id as string },
      include: {
        consultations: {
          select: {
            id: true
          }
        },
        medicalRecords: {
          select: {
            id: true
          }
        }
      }
    });

    if (!pet) {
      throw new AppError('Pet not found', 404);
    }

    // Check if user is owner or admin
    if (currentUser.role !== 'ADMIN' && pet.userId !== currentUser.id) {
      throw new AppError('Access denied', 403);
    }

    // Check if pet has related data
    if (pet.consultations.length > 0 || pet.medicalRecords.length > 0) {
      throw new AppError('Cannot delete pet with existing consultations or medical records', 400);
    }

    await prisma.pet.delete({
      where: { id: id as string }
    });

    logger.info('Pet deleted', {
      petId: id,
      petName: pet.name,
      deletedBy: currentUser.id
    });

    res.json({
      success: true,
      message: 'Pet deleted successfully'
    });
  })
);

// Get pet medical history
router.get('/:id/medical-history', 
  authenticateToken,
  validate(paramSchemas.id, 'params'),
  validate(querySchemas.pagination, 'query'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { page = 1, limit = 10, recordType } = req.query;
    const currentUser = req.user!;
    
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Check if pet exists and user has access
    const pet = await prisma.pet.findUnique({
      where: { id: id as string }
    });

    if (!pet) {
      throw new AppError('Pet not found', 404);
    }

    if (currentUser.role !== 'ADMIN' && pet.userId !== currentUser.id) {
      throw new AppError('Access denied', 403);
    }

    // Build where clause
    const where: any = { petId: id };
    if (recordType) {
      where.recordType = recordType;
    }

    // Get medical records with pagination
    const [medicalRecords, allMedicalRecords] = await Promise.all([
      prisma.medicalRecord.findMany({
        where,
        include: {
          consultation: {
            select: {
              id: true,
              title: true,
              status: true
            }
          },
          files: {
            select: {
              id: true,
              filename: true,
              fileType: true,


            }
          }
        },
        skip,
        take,
        orderBy: {
          recordDate: 'desc'
        }
      }),
      prisma.medicalRecord.findMany({
        where,
        select: { id: true }
      })
    ]);

    const total = allMedicalRecords.length;

    const totalPages = Math.ceil(total / take);

    res.json({
      success: true,
      data: {
        pet: {
          id: pet.id,
          name: pet.name,
          species: pet.species,
          breed: pet.breed
        },
        medicalRecords,
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

// Get pet statistics (Admin only)
router.get('/stats/overview', 
  authenticateToken,
  requireRole(['ADMIN']),
  asyncHandler(async (_req, res) => {
    const [allPetsData, recentPetsData] = await Promise.all([
      prisma.pet.findMany({ select: { id: true } }),
      prisma.pet.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        },
        select: { id: true }
      })
    ]);

    const totalPets = allPetsData.length;
    const recentPets = recentPetsData.length;

    const allPets = await prisma.pet.findMany({
      select: {
        species: true,
        gender: true
      }
    });

    const petsBySpecies = allPets.reduce((acc, pet) => {
      acc[pet.species] = (acc[pet.species] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const petsByGender = allPets.reduce((acc, pet) => {
      if (pet.gender) {
        acc[pet.gender] = (acc[pet.gender] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    res.json({
      success: true,
      data: {
        totalPets,
        recentPets,
        petsBySpecies,
        petsByGender
      }
    });
  })
);

export default router;