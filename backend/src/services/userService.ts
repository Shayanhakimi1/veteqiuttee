import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { 
  UpdateUserRequest, 
  UserWithRelations,
  UserRole,
  UserStatus,
  NotFoundError,
  ConflictError,
  AuthorizationError
} from '../types';
import { securityConfig } from '../config';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

class UserService {
  async getUserById(id: string): Promise<UserWithRelations | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          pets: true,
          consultations: {
            include: {
              pet: true,
              payment: true
            },
            orderBy: { createdAt: 'desc' }
          },
          payments: {
            include: {
              consultation: {
                include: {
                  pet: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          },
          appointments: {
            include: {
              pet: true,
              doctor: true
            },
            orderBy: { scheduledAt: 'desc' }
          }
        }
      });

      if (user) {
        return this.sanitizeUser(user);
      }

      return null;
    } catch (error) {
      logger.error('Get user by ID error:', error);
      throw error;
    }
  }

  async getUserByMobile(mobile: string): Promise<UserWithRelations | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { mobile },
        include: {
          pets: true,
          consultations: {
            include: {
              pet: true,
              payment: true
            },
            orderBy: { createdAt: 'desc' }
          },
          payments: {
            include: {
              consultation: {
                include: {
                  pet: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (user) {
        return this.sanitizeUser(user);
      }

      return null;
    } catch (error) {
      logger.error('Get user by mobile error:', error);
      throw error;
    }
  }

  async updateUser(id: string, updateData: UpdateUserRequest, requesterId?: string): Promise<UserWithRelations> {
    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id }
      });

      if (!existingUser) {
        throw new NotFoundError('کاربر یافت نشد');
      }

      // Check authorization (users can only update their own profile, admins can update any)
      if (requesterId && requesterId !== id) {
        const requester = await prisma.user.findUnique({
          where: { id: requesterId }
        });

        if (!requester || requester.role !== UserRole.ADMIN) {
          throw new AuthorizationError('شما مجاز به ویرایش این کاربر نیستید');
        }
      }

      // Check email uniqueness if email is being updated
      if (updateData.email && updateData.email !== existingUser.email) {
        const emailExists = await prisma.user.findFirst({
          where: {
            email: updateData.email,
            id: { not: id }
          }
        });

        if (emailExists) {
          throw new ConflictError('این ایمیل قبلاً استفاده شده است');
        }
      }

      // Hash password if provided
      let hashedPassword: string | undefined;
      if (updateData.password) {
        hashedPassword = await bcrypt.hash(updateData.password, securityConfig.bcryptSaltRounds);
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          name: updateData.name,
          email: updateData.email,
          password: hashedPassword,
          updatedAt: new Date()
        },
        include: {
          pets: true,
          consultations: {
            include: {
              pet: true,
              payment: true
            },
            orderBy: { createdAt: 'desc' }
          },
          payments: {
            include: {
              consultation: {
                include: {
                  pet: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      logger.info(`User updated successfully: ${updatedUser.mobile}`);

      return this.sanitizeUser(updatedUser);
    } catch (error) {
      logger.error('Update user error:', error);
      throw error;
    }
  }

  async deleteUser(id: string, requesterId?: string): Promise<void> {
    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id }
      });

      if (!existingUser) {
        throw new NotFoundError('کاربر یافت نشد');
      }

      // Check authorization (users can delete their own account, admins can delete any)
      if (requesterId && requesterId !== id) {
        const requester = await prisma.user.findUnique({
          where: { id: requesterId }
        });

        if (!requester || requester.role !== UserRole.ADMIN) {
          throw new AuthorizationError('شما مجاز به حذف این کاربر نیستید');
        }
      }

      // Soft delete by setting status to inactive
      await prisma.user.update({
        where: { id },
        data: {
          status: UserStatus.INACTIVE,
          deletedAt: new Date()
        }
      });

      // Delete all refresh tokens
      await prisma.refreshToken.deleteMany({
        where: { userId: id }
      });

      logger.info(`User deleted successfully: ${existingUser.mobile}`);
    } catch (error) {
      logger.error('Delete user error:', error);
      throw error;
    }
  }

  async getAllUsers(
    page: number = 1,
    limit: number = 20,
    search?: string,
    role?: UserRole,
    status?: UserStatus
  ): Promise<{ users: UserWithRelations[]; total: number; totalPages: number }> {
    try {
      const skip = (page - 1) * limit;
      
      const where: any = {};
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { mobile: { contains: search } },
          { email: { contains: search, mode: 'insensitive' } }
        ];
      }
      
      if (role) {
        where.role = role;
      }
      
      if (status) {
        where.status = status;
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          include: {
            pets: true,
            consultations: {
              include: {
                pet: true
              }
            },
            _count: {
              select: {
                pets: true,
                consultations: true,
                payments: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.user.count({ where })
      ]);

      const sanitizedUsers = users.map(user => this.sanitizeUser(user));
      const totalPages = Math.ceil(total / limit);

      return {
        users: sanitizedUsers,
        total,
        totalPages
      };
    } catch (error) {
      logger.error('Get all users error:', error);
      throw error;
    }
  }

  async updateUserStatus(id: string, status: UserStatus, requesterId: string): Promise<UserWithRelations> {
    try {
      // Check if requester is admin
      const requester = await prisma.user.findUnique({
        where: { id: requesterId }
      });

      if (!requester || requester.role !== UserRole.ADMIN) {
        throw new AuthorizationError('فقط مدیران می‌توانند وضعیت کاربران را تغییر دهند');
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id }
      });

      if (!existingUser) {
        throw new NotFoundError('کاربر یافت نشد');
      }

      // Update user status
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          status,
          updatedAt: new Date()
        },
        include: {
          pets: true,
          consultations: {
            include: {
              pet: true,
              payment: true
            }
          }
        }
      });

      // If user is suspended or deactivated, delete all refresh tokens
      if (status === UserStatus.SUSPENDED || status === UserStatus.INACTIVE) {
        await prisma.refreshToken.deleteMany({
          where: { userId: id }
        });
      }

      logger.info(`User status updated: ${existingUser.mobile} -> ${status}`);

      return this.sanitizeUser(updatedUser);
    } catch (error) {
      logger.error('Update user status error:', error);
      throw error;
    }
  }

  async getUserStats(userId: string): Promise<any> {
    try {
      const stats = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          _count: {
            select: {
              pets: true,
              consultations: true,
              payments: true,
              appointments: true
            }
          }
        }
      });

      if (!stats) {
        throw new NotFoundError('کاربر یافت نشد');
      }

      // Get additional stats
      const [completedConsultations, totalSpent, upcomingAppointments] = await Promise.all([
        prisma.consultation.count({
          where: {
            userId,
            status: 'COMPLETED'
          }
        }),
        prisma.payment.aggregate({
          where: {
            userId,
            status: 'COMPLETED'
          },
          _sum: {
            amount: true
          }
        }),
        prisma.appointment.count({
          where: {
            userId,
            scheduledAt: { gt: new Date() },
            status: { in: ['SCHEDULED', 'CONFIRMED'] }
          }
        })
      ]);

      return {
        totalPets: stats._count.pets,
        totalConsultations: stats._count.consultations,
        completedConsultations,
        totalPayments: stats._count.payments,
        totalSpent: totalSpent._sum.amount || 0,
        totalAppointments: stats._count.appointments,
        upcomingAppointments,
        memberSince: stats.createdAt,
        lastLogin: stats.lastLoginAt
      };
    } catch (error) {
      logger.error('Get user stats error:', error);
      throw error;
    }
  }

  private sanitizeUser(user: any): any {
    const { password, verificationCode, verificationCodeExpiresAt, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}

export const userService = new UserService();