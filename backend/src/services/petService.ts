import { PrismaClient } from '@prisma/client';
import { 
  CreatePetRequest,
  UpdatePetRequest,
  PetWithRelations,
  PetType,
  PetGender,
  NotFoundError,
  AuthorizationError
} from '../types';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

class PetService {
  async createPet(userId: string, petData: CreatePetRequest): Promise<PetWithRelations> {
    try {
      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new NotFoundError('کاربر یافت نشد');
      }

      const pet = await prisma.pet.create({
        data: {
          name: petData.name,
          type: petData.type,
          breed: petData.breed,
          gender: petData.gender,
          birthDate: petData.birthDate ? new Date(petData.birthDate) : null,
          weight: petData.weight,
          color: petData.color,
          microchipId: petData.microchipId,
          medicalHistory: petData.medicalHistory,
          allergies: petData.allergies,
          medications: petData.medications,
          vaccinations: petData.vaccinations,
          notes: petData.notes,
          userId,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              mobile: true,
              email: true
            }
          },
          consultations: {
            include: {
              payment: true
            },
            orderBy: { createdAt: 'desc' }
          },
          appointments: {
            include: {
              doctor: {
                select: {
                  id: true,
                  name: true,
                  specialization: true
                }
              }
            },
            orderBy: { scheduledAt: 'desc' }
          }
        }
      });

      logger.info(`Pet created successfully: ${pet.name} for user ${userId}`);

      return pet;
    } catch (error) {
      logger.error('Create pet error:', error);
      throw error;
    }
  }

  async getPetById(id: string, userId?: string): Promise<PetWithRelations | null> {
    try {
      const pet = await prisma.pet.findUnique({
        where: { id },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              mobile: true,
              email: true
            }
          },
          consultations: {
            include: {
              payment: true,
              voiceMedia: true
            },
            orderBy: { createdAt: 'desc' }
          },
          appointments: {
            include: {
              doctor: {
                select: {
                  id: true,
                  name: true,
                  specialization: true,
                  mobile: true
                }
              }
            },
            orderBy: { scheduledAt: 'desc' }
          }
        }
      });

      if (!pet) {
        return null;
      }

      // Check authorization if userId is provided
      if (userId && pet.userId !== userId) {
        // Check if user is admin
        const user = await prisma.user.findUnique({
          where: { id: userId }
        });

        if (!user || user.role !== 'ADMIN') {
          throw new AuthorizationError('شما مجاز به مشاهده این حیوان خانگی نیستید');
        }
      }

      return pet;
    } catch (error) {
      logger.error('Get pet by ID error:', error);
      throw error;
    }
  }

  async getUserPets(userId: string): Promise<PetWithRelations[]> {
    try {
      const pets = await prisma.pet.findMany({
        where: { userId },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              mobile: true,
              email: true
            }
          },
          consultations: {
            include: {
              payment: true
            },
            orderBy: { createdAt: 'desc' },
            take: 5 // Only get recent consultations
          },
          appointments: {
            include: {
              doctor: {
                select: {
                  id: true,
                  name: true,
                  specialization: true
                }
              }
            },
            orderBy: { scheduledAt: 'desc' },
            take: 5 // Only get recent appointments
          },
          _count: {
            select: {
              consultations: true,
              appointments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return pets;
    } catch (error) {
      logger.error('Get user pets error:', error);
      throw error;
    }
  }

  async updatePet(id: string, userId: string, updateData: UpdatePetRequest): Promise<PetWithRelations> {
    try {
      // Check if pet exists and belongs to user
      const existingPet = await prisma.pet.findUnique({
        where: { id },
        include: {
          owner: true
        }
      });

      if (!existingPet) {
        throw new NotFoundError('حیوان خانگی یافت نشد');
      }

      // Check authorization
      if (existingPet.userId !== userId) {
        // Check if user is admin
        const user = await prisma.user.findUnique({
          where: { id: userId }
        });

        if (!user || user.role !== 'ADMIN') {
          throw new AuthorizationError('شما مجاز به ویرایش این حیوان خانگی نیستید');
        }
      }

      const updatedPet = await prisma.pet.update({
        where: { id },
        data: {
          name: updateData.name,
          type: updateData.type,
          breed: updateData.breed,
          gender: updateData.gender,
          birthDate: updateData.birthDate ? new Date(updateData.birthDate) : undefined,
          weight: updateData.weight,
          color: updateData.color,
          microchipId: updateData.microchipId,
          medicalHistory: updateData.medicalHistory,
          allergies: updateData.allergies,
          medications: updateData.medications,
          vaccinations: updateData.vaccinations,
          notes: updateData.notes,
          updatedAt: new Date()
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              mobile: true,
              email: true
            }
          },
          consultations: {
            include: {
              payment: true
            },
            orderBy: { createdAt: 'desc' }
          },
          appointments: {
            include: {
              doctor: {
                select: {
                  id: true,
                  name: true,
                  specialization: true
                }
              }
            },
            orderBy: { scheduledAt: 'desc' }
          }
        }
      });

      logger.info(`Pet updated successfully: ${updatedPet.name}`);

      return updatedPet;
    } catch (error) {
      logger.error('Update pet error:', error);
      throw error;
    }
  }

  async deletePet(id: string, userId: string): Promise<void> {
    try {
      // Check if pet exists and belongs to user
      const existingPet = await prisma.pet.findUnique({
        where: { id },
        include: {
          consultations: true,
          appointments: true
        }
      });

      if (!existingPet) {
        throw new NotFoundError('حیوان خانگی یافت نشد');
      }

      // Check authorization
      if (existingPet.userId !== userId) {
        // Check if user is admin
        const user = await prisma.user.findUnique({
          where: { id: userId }
        });

        if (!user || user.role !== 'ADMIN') {
          throw new AuthorizationError('شما مجاز به حذف این حیوان خانگی نیستید');
        }
      }

      // Check if pet has active consultations or appointments
      const activeConsultations = existingPet.consultations.filter(
        consultation => consultation.status === 'PENDING' || consultation.status === 'IN_PROGRESS'
      );

      const activeAppointments = existingPet.appointments.filter(
        appointment => appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED'
      );

      if (activeConsultations.length > 0 || activeAppointments.length > 0) {
        throw new ConflictError('نمی‌توان حیوان خانگی با مشاوره یا قرار ملاقات فعال را حذف کرد');
      }

      // Soft delete by setting deletedAt
      await prisma.pet.update({
        where: { id },
        data: {
          deletedAt: new Date()
        }
      });

      logger.info(`Pet deleted successfully: ${existingPet.name}`);
    } catch (error) {
      logger.error('Delete pet error:', error);
      throw error;
    }
  }

  async getAllPets(
    page: number = 1,
    limit: number = 20,
    search?: string,
    type?: PetType,
    userId?: string
  ): Promise<{ pets: PetWithRelations[]; total: number; totalPages: number }> {
    try {
      const skip = (page - 1) * limit;
      
      const where: any = {
        deletedAt: null
      };
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { breed: { contains: search, mode: 'insensitive' } },
          { microchipId: { contains: search } },
          { owner: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { mobile: { contains: search } }
              ]
            }
          }
        ];
      }
      
      if (type) {
        where.type = type;
      }
      
      if (userId) {
        where.userId = userId;
      }

      const [pets, total] = await Promise.all([
        prisma.pet.findMany({
          where,
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                mobile: true,
                email: true
              }
            },
            _count: {
              select: {
                consultations: true,
                appointments: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.pet.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        pets,
        total,
        totalPages
      };
    } catch (error) {
      logger.error('Get all pets error:', error);
      throw error;
    }
  }

  async getPetStats(petId: string, userId?: string): Promise<any> {
    try {
      const pet = await prisma.pet.findUnique({
        where: { id: petId },
        include: {
          owner: true,
          _count: {
            select: {
              consultations: true,
              appointments: true
            }
          }
        }
      });

      if (!pet) {
        throw new NotFoundError('حیوان خانگی یافت نشد');
      }

      // Check authorization if userId is provided
      if (userId && pet.userId !== userId) {
        const user = await prisma.user.findUnique({
          where: { id: userId }
        });

        if (!user || user.role !== 'ADMIN') {
          throw new AuthorizationError('شما مجاز به مشاهده آمار این حیوان خانگی نیستید');
        }
      }

      // Get additional stats
      const [completedConsultations, totalSpent, upcomingAppointments, lastConsultation] = await Promise.all([
        prisma.consultation.count({
          where: {
            petId,
            status: 'COMPLETED'
          }
        }),
        prisma.payment.aggregate({
          where: {
            consultation: {
              petId
            },
            status: 'COMPLETED'
          },
          _sum: {
            amount: true
          }
        }),
        prisma.appointment.count({
          where: {
            petId,
            scheduledAt: { gt: new Date() },
            status: { in: ['SCHEDULED', 'CONFIRMED'] }
          }
        }),
        prisma.consultation.findFirst({
          where: { petId },
          orderBy: { createdAt: 'desc' },
          include: {
            payment: true
          }
        })
      ]);

      // Calculate age if birthDate is available
      let ageInMonths: number | null = null;
      if (pet.birthDate) {
        const now = new Date();
        const birth = new Date(pet.birthDate);
        ageInMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
      }

      return {
        totalConsultations: pet._count.consultations,
        completedConsultations,
        totalAppointments: pet._count.appointments,
        upcomingAppointments,
        totalSpent: totalSpent._sum.amount || 0,
        lastConsultation: lastConsultation ? {
          date: lastConsultation.createdAt,
          status: lastConsultation.status,
          amount: lastConsultation.payment?.amount
        } : null,
        ageInMonths,
        registeredSince: pet.createdAt
      };
    } catch (error) {
      logger.error('Get pet stats error:', error);
      throw error;
    }
  }
}

export const petService = new PetService();