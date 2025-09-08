import { PrismaClient } from '@prisma/client';
import { 
  CreateConsultationRequest,
  UpdateConsultationRequest,
  ConsultationWithRelations,
  ConsultationStatus,
  ConsultationType,
  NotFoundError,
  AuthorizationError,
  ValidationError
} from '../types';
import { logger } from '../utils/logger';
import { paymentService } from './paymentService';
import { smsService } from './smsService';

const prisma = new PrismaClient();

class ConsultationService {
  async createConsultation(userId: string, consultationData: CreateConsultationRequest): Promise<ConsultationWithRelations> {
    try {
      // Verify user and pet exist
      const [user, pet] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.pet.findUnique({ where: { id: consultationData.petId } })
      ]);

      if (!user) {
        throw new NotFoundError('کاربر یافت نشد');
      }

      if (!pet) {
        throw new NotFoundError('حیوان خانگی یافت نشد');
      }

      // Check if pet belongs to user
      if (pet.userId !== userId) {
        throw new AuthorizationError('این حیوان خانگی متعلق به شما نیست');
      }

      // Check if user has any pending consultations
      const pendingConsultation = await prisma.consultation.findFirst({
        where: {
          userId,
          status: { in: ['PENDING', 'IN_PROGRESS'] }
        }
      });

      if (pendingConsultation) {
        throw new ValidationError('شما یک مشاوره در حال انجام دارید. لطفاً ابتدا آن را تکمیل کنید.');
      }

      // Create consultation
      const consultation = await prisma.consultation.create({
        data: {
          userId,
          petId: consultationData.petId,
          type: consultationData.type,
          symptoms: consultationData.symptoms,
          description: consultationData.description,
          urgencyLevel: consultationData.urgencyLevel || 'MEDIUM',
          status: ConsultationStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              mobile: true,
              email: true
            }
          },
          pet: {
            select: {
              id: true,
              name: true,
              type: true,
              breed: true,
              age: true,
              weight: true
            }
          },
          payment: true,
          voiceMedia: true
        }
      });

      // Create payment record
      const amount = this.calculateConsultationFee(consultationData.type, consultationData.urgencyLevel);
      await paymentService.createPayment({
        userId,
        consultationId: consultation.id,
        amount,
        description: `پرداخت مشاوره ${consultationData.type === 'VOICE' ? 'صوتی' : 'متنی'}`
      });

      // Send SMS notification
      await smsService.sendConsultationCreated(user.mobile, {
        consultationId: consultation.id,
        petName: pet.name,
        type: consultationData.type
      });

      logger.info(`Consultation created successfully: ${consultation.id} for user ${userId}`);

      return consultation;
    } catch (error) {
      logger.error('Create consultation error:', error);
      throw error;
    }
  }

  async getConsultationById(id: string, userId?: string): Promise<ConsultationWithRelations | null> {
    try {
      const consultation = await prisma.consultation.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              mobile: true,
              email: true
            }
          },
          pet: {
            select: {
              id: true,
              name: true,
              type: true,
              breed: true,
              age: true,
              weight: true,
              medicalHistory: true,
              allergies: true,
              medications: true
            }
          },
          payment: true,
          voiceMedia: true
        }
      });

      if (!consultation) {
        return null;
      }

      // Check authorization if userId is provided
      if (userId && consultation.userId !== userId) {
        // Check if user is admin or doctor
        const user = await prisma.user.findUnique({
          where: { id: userId }
        });

        if (!user || (user.role !== 'ADMIN' && user.role !== 'DOCTOR')) {
          throw new AuthorizationError('شما مجاز به مشاهده این مشاوره نیستید');
        }
      }

      return consultation;
    } catch (error) {
      logger.error('Get consultation by ID error:', error);
      throw error;
    }
  }

  async getUserConsultations(
    userId: string,
    page: number = 1,
    limit: number = 10,
    status?: ConsultationStatus
  ): Promise<{ consultations: ConsultationWithRelations[]; total: number; totalPages: number }> {
    try {
      const skip = (page - 1) * limit;
      
      const where: any = { userId };
      
      if (status) {
        where.status = status;
      }

      const [consultations, total] = await Promise.all([
        prisma.consultation.findMany({
          where,
          include: {
            pet: {
              select: {
                id: true,
                name: true,
                type: true,
                breed: true
              }
            },
            payment: {
              select: {
                id: true,
                amount: true,
                status: true,
                paidAt: true
              }
            },
            voiceMedia: true
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.consultation.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        consultations,
        total,
        totalPages
      };
    } catch (error) {
      logger.error('Get user consultations error:', error);
      throw error;
    }
  }

  async updateConsultation(
    id: string,
    userId: string,
    updateData: UpdateConsultationRequest
  ): Promise<ConsultationWithRelations> {
    try {
      // Check if consultation exists
      const existingConsultation = await prisma.consultation.findUnique({
        where: { id },
        include: {
          user: true,
          pet: true
        }
      });

      if (!existingConsultation) {
        throw new NotFoundError('مشاوره یافت نشد');
      }

      // Check authorization
      if (existingConsultation.userId !== userId) {
        // Check if user is admin or doctor
        const user = await prisma.user.findUnique({
          where: { id: userId }
        });

        if (!user || (user.role !== 'ADMIN' && user.role !== 'DOCTOR')) {
          throw new AuthorizationError('شما مجاز به ویرایش این مشاوره نیستید');
        }
      }

      // Validate status transition
      if (updateData.status && !this.isValidStatusTransition(existingConsultation.status, updateData.status)) {
        throw new ValidationError('تغییر وضعیت مشاوره معتبر نیست');
      }

      const updatedConsultation = await prisma.consultation.update({
        where: { id },
        data: {
          symptoms: updateData.symptoms,
          description: updateData.description,
          urgencyLevel: updateData.urgencyLevel,
          status: updateData.status,
          doctorNotes: updateData.doctorNotes,
          diagnosis: updateData.diagnosis,
          treatment: updateData.treatment,
          followUpRequired: updateData.followUpRequired,
          followUpDate: updateData.followUpDate ? new Date(updateData.followUpDate) : undefined,
          completedAt: updateData.status === ConsultationStatus.COMPLETED ? new Date() : undefined,
          updatedAt: new Date()
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              mobile: true,
              email: true
            }
          },
          pet: {
            select: {
              id: true,
              name: true,
              type: true,
              breed: true,
              age: true,
              weight: true
            }
          },
          payment: true,
          voiceMedia: true
        }
      });

      // Send SMS notification for status changes
      if (updateData.status && updateData.status !== existingConsultation.status) {
        await smsService.sendConsultationStatusUpdate(
          existingConsultation.user.mobile,
          {
            consultationId: id,
            status: updateData.status,
            petName: existingConsultation.pet.name
          }
        );
      }

      logger.info(`Consultation updated successfully: ${id}`);

      return updatedConsultation;
    } catch (error) {
      logger.error('Update consultation error:', error);
      throw error;
    }
  }

  async deleteConsultation(id: string, userId: string): Promise<void> {
    try {
      // Check if consultation exists
      const existingConsultation = await prisma.consultation.findUnique({
        where: { id },
        include: {
          payment: true
        }
      });

      if (!existingConsultation) {
        throw new NotFoundError('مشاوره یافت نشد');
      }

      // Check authorization
      if (existingConsultation.userId !== userId) {
        // Check if user is admin
        const user = await prisma.user.findUnique({
          where: { id: userId }
        });

        if (!user || user.role !== 'ADMIN') {
          throw new AuthorizationError('شما مجاز به حذف این مشاوره نیستید');
        }
      }

      // Check if consultation can be deleted
      if (existingConsultation.status === ConsultationStatus.IN_PROGRESS) {
        throw new ValidationError('نمی‌توان مشاوره در حال انجام را حذف کرد');
      }

      if (existingConsultation.payment && existingConsultation.payment.status === 'COMPLETED') {
        throw new ValidationError('نمی‌توان مشاوره پرداخت شده را حذف کرد');
      }

      // Soft delete
      await prisma.consultation.update({
        where: { id },
        data: {
          deletedAt: new Date()
        }
      });

      logger.info(`Consultation deleted successfully: ${id}`);
    } catch (error) {
      logger.error('Delete consultation error:', error);
      throw error;
    }
  }

  async getAllConsultations(
    page: number = 1,
    limit: number = 20,
    status?: ConsultationStatus,
    type?: ConsultationType,
    search?: string
  ): Promise<{ consultations: ConsultationWithRelations[]; total: number; totalPages: number }> {
    try {
      const skip = (page - 1) * limit;
      
      const where: any = {
        deletedAt: null
      };
      
      if (status) {
        where.status = status;
      }
      
      if (type) {
        where.type = type;
      }
      
      if (search) {
        where.OR = [
          { symptoms: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { diagnosis: { contains: search, mode: 'insensitive' } },
          { user: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { mobile: { contains: search } }
              ]
            }
          },
          { pet: {
              name: { contains: search, mode: 'insensitive' }
            }
          }
        ];
      }

      const [consultations, total] = await Promise.all([
        prisma.consultation.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                mobile: true,
                email: true
              }
            },
            pet: {
              select: {
                id: true,
                name: true,
                type: true,
                breed: true
              }
            },
            payment: {
              select: {
                id: true,
                amount: true,
                status: true,
                paidAt: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.consultation.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        consultations,
        total,
        totalPages
      };
    } catch (error) {
      logger.error('Get all consultations error:', error);
      throw error;
    }
  }

  async uploadVoiceMedia(consultationId: string, userId: string, fileData: any): Promise<any> {
    try {
      // Check if consultation exists and belongs to user
      const consultation = await prisma.consultation.findUnique({
        where: { id: consultationId }
      });

      if (!consultation) {
        throw new NotFoundError('مشاوره یافت نشد');
      }

      if (consultation.userId !== userId) {
        throw new AuthorizationError('شما مجاز به آپلود فایل برای این مشاوره نیستید');
      }

      if (consultation.type !== ConsultationType.VOICE) {
        throw new ValidationError('فقط برای مشاوره‌های صوتی می‌توان فایل صوتی آپلود کرد');
      }

      // Create media record
      const media = await prisma.media.create({
        data: {
          filename: fileData.filename,
          originalName: fileData.originalName,
          mimeType: fileData.mimeType,
          size: fileData.size,
          url: fileData.url,
          type: 'VOICE',
          uploadedBy: userId,
          createdAt: new Date()
        }
      });

      // Update consultation with voice media
      await prisma.consultation.update({
        where: { id: consultationId },
        data: {
          voiceMediaId: media.id,
          updatedAt: new Date()
        }
      });

      logger.info(`Voice media uploaded for consultation: ${consultationId}`);

      return media;
    } catch (error) {
      logger.error('Upload voice media error:', error);
      throw error;
    }
  }

  private calculateConsultationFee(type: ConsultationType, urgencyLevel?: string): number {
    let baseAmount = type === ConsultationType.VOICE ? 50000 : 30000; // Base price in Toman
    
    if (urgencyLevel === 'HIGH') {
      baseAmount *= 1.5; // 50% surcharge for urgent consultations
    }
    
    return baseAmount;
  }

  private isValidStatusTransition(currentStatus: ConsultationStatus, newStatus: ConsultationStatus): boolean {
    const validTransitions: Record<ConsultationStatus, ConsultationStatus[]> = {
      [ConsultationStatus.PENDING]: [ConsultationStatus.IN_PROGRESS, ConsultationStatus.CANCELLED],
      [ConsultationStatus.IN_PROGRESS]: [ConsultationStatus.COMPLETED, ConsultationStatus.CANCELLED],
      [ConsultationStatus.COMPLETED]: [], // No transitions from completed
      [ConsultationStatus.CANCELLED]: [] // No transitions from cancelled
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }
}

export const consultationService = new ConsultationService();