import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { 
  CreatePaymentRequest,
  PaymentWithRelations,
  PaymentStatus,
  PaymentMethod,
  NotFoundError,
  AuthorizationError,
  ValidationError,
  PaymentError
} from '../types';
import { paymentConfig } from '../config';
import { logger } from '../utils/logger';
import { smsService } from './smsService';

const prisma = new PrismaClient();

class PaymentService {
  async createPayment(paymentData: CreatePaymentRequest): Promise<PaymentWithRelations> {
    try {
      // Verify user and consultation exist
      const [user, consultation] = await Promise.all([
        prisma.user.findUnique({ where: { id: paymentData.userId } }),
        paymentData.consultationId ? 
          prisma.consultation.findUnique({ where: { id: paymentData.consultationId } }) : 
          null
      ]);

      if (!user) {
        throw new NotFoundError('کاربر یافت نشد');
      }

      if (paymentData.consultationId && !consultation) {
        throw new NotFoundError('مشاوره یافت نشد');
      }

      // Check if consultation already has a payment
      if (paymentData.consultationId) {
        const existingPayment = await prisma.payment.findFirst({
          where: { consultationId: paymentData.consultationId }
        });

        if (existingPayment) {
          throw new ValidationError('این مشاوره قبلاً پرداخت شده است');
        }
      }

      // Generate unique tracking code
      const trackingCode = this.generateTrackingCode();

      const payment = await prisma.payment.create({
        data: {
          userId: paymentData.userId,
          consultationId: paymentData.consultationId,
          amount: paymentData.amount,
          description: paymentData.description,
          trackingCode,
          status: PaymentStatus.PENDING,
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
          consultation: {
            select: {
              id: true,
              type: true,
              symptoms: true,
              pet: {
                select: {
                  id: true,
                  name: true,
                  type: true
                }
              }
            }
          }
        }
      });

      logger.info(`Payment created successfully: ${payment.id} for user ${paymentData.userId}`);

      return payment;
    } catch (error) {
      logger.error('Create payment error:', error);
      throw error;
    }
  }

  async initiatePayment(paymentId: string, method: PaymentMethod): Promise<{ paymentUrl?: string; gatewayData?: any }> {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          user: true,
          consultation: {
            include: {
              pet: true
            }
          }
        }
      });

      if (!payment) {
        throw new NotFoundError('پرداخت یافت نشد');
      }

      if (payment.status !== PaymentStatus.PENDING) {
        throw new ValidationError('این پرداخت قبلاً پردازش شده است');
      }

      // Update payment method
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          method,
          updatedAt: new Date()
        }
      });

      // Initialize payment gateway based on method
      let gatewayResponse;
      
      switch (method) {
        case PaymentMethod.ZARINPAL:
          gatewayResponse = await this.initiateZarinpalPayment(payment);
          break;
        case PaymentMethod.MELLAT:
          gatewayResponse = await this.initiateMellatPayment(payment);
          break;
        case PaymentMethod.PARSIAN:
          gatewayResponse = await this.initiateParsianPayment(payment);
          break;
        default:
          throw new ValidationError('روش پرداخت نامعتبر است');
      }

      // Update payment with gateway data
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          gatewayTransactionId: gatewayResponse.transactionId,
          gatewayData: gatewayResponse.gatewayData,
          updatedAt: new Date()
        }
      });

      logger.info(`Payment initiated: ${paymentId} via ${method}`);

      return {
        paymentUrl: gatewayResponse.paymentUrl,
        gatewayData: gatewayResponse.gatewayData
      };
    } catch (error) {
      logger.error('Initiate payment error:', error);
      throw error;
    }
  }

  async verifyPayment(paymentId: string, gatewayData: any): Promise<PaymentWithRelations> {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          user: true,
          consultation: {
            include: {
              pet: true
            }
          }
        }
      });

      if (!payment) {
        throw new NotFoundError('پرداخت یافت نشد');
      }

      if (payment.status === PaymentStatus.COMPLETED) {
        throw new ValidationError('این پرداخت قبلاً تأیید شده است');
      }

      // Verify payment with gateway
      let verificationResult;
      
      switch (payment.method) {
        case PaymentMethod.ZARINPAL:
          verificationResult = await this.verifyZarinpalPayment(payment, gatewayData);
          break;
        case PaymentMethod.MELLAT:
          verificationResult = await this.verifyMellatPayment(payment, gatewayData);
          break;
        case PaymentMethod.PARSIAN:
          verificationResult = await this.verifyParsianPayment(payment, gatewayData);
          break;
        default:
          throw new ValidationError('روش پرداخت نامعتبر است');
      }

      // Update payment status
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: verificationResult.success ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
          paidAt: verificationResult.success ? new Date() : null,
          gatewayReferenceId: verificationResult.referenceId,
          gatewayData: {
            ...payment.gatewayData,
            verification: verificationResult
          },
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
          consultation: {
            select: {
              id: true,
              type: true,
              symptoms: true,
              pet: {
                select: {
                  id: true,
                  name: true,
                  type: true
                }
              }
            }
          }
        }
      });

      // If payment successful, update consultation status
      if (verificationResult.success && payment.consultationId) {
        await prisma.consultation.update({
          where: { id: payment.consultationId },
          data: {
            status: 'IN_PROGRESS',
            updatedAt: new Date()
          }
        });
      }

      // Send SMS notification
      if (verificationResult.success) {
        await smsService.sendPaymentConfirmation(payment.user.mobile, {
          amount: payment.amount,
          trackingCode: payment.trackingCode,
          consultationType: payment.consultation?.type
        });
      }

      logger.info(`Payment verification completed: ${paymentId} - ${verificationResult.success ? 'SUCCESS' : 'FAILED'}`);

      return updatedPayment;
    } catch (error) {
      logger.error('Verify payment error:', error);
      throw error;
    }
  }

  async getPaymentById(id: string, userId?: string): Promise<PaymentWithRelations | null> {
    try {
      const payment = await prisma.payment.findUnique({
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
          consultation: {
            select: {
              id: true,
              type: true,
              symptoms: true,
              status: true,
              pet: {
                select: {
                  id: true,
                  name: true,
                  type: true
                }
              }
            }
          }
        }
      });

      if (!payment) {
        return null;
      }

      // Check authorization if userId is provided
      if (userId && payment.userId !== userId) {
        // Check if user is admin
        const user = await prisma.user.findUnique({
          where: { id: userId }
        });

        if (!user || user.role !== 'ADMIN') {
          throw new AuthorizationError('شما مجاز به مشاهده این پرداخت نیستید');
        }
      }

      return payment;
    } catch (error) {
      logger.error('Get payment by ID error:', error);
      throw error;
    }
  }

  async getUserPayments(
    userId: string,
    page: number = 1,
    limit: number = 10,
    status?: PaymentStatus
  ): Promise<{ payments: PaymentWithRelations[]; total: number; totalPages: number }> {
    try {
      const skip = (page - 1) * limit;
      
      const where: any = { userId };
      
      if (status) {
        where.status = status;
      }

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where,
          include: {
            consultation: {
              select: {
                id: true,
                type: true,
                status: true,
                pet: {
                  select: {
                    id: true,
                    name: true,
                    type: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.payment.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        payments,
        total,
        totalPages
      };
    } catch (error) {
      logger.error('Get user payments error:', error);
      throw error;
    }
  }

  async getAllPayments(
    page: number = 1,
    limit: number = 20,
    status?: PaymentStatus,
    method?: PaymentMethod,
    search?: string
  ): Promise<{ payments: PaymentWithRelations[]; total: number; totalPages: number }> {
    try {
      const skip = (page - 1) * limit;
      
      const where: any = {};
      
      if (status) {
        where.status = status;
      }
      
      if (method) {
        where.method = method;
      }
      
      if (search) {
        where.OR = [
          { trackingCode: { contains: search } },
          { gatewayReferenceId: { contains: search } },
          { user: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { mobile: { contains: search } }
              ]
            }
          }
        ];
      }

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
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
            consultation: {
              select: {
                id: true,
                type: true,
                status: true,
                pet: {
                  select: {
                    id: true,
                    name: true,
                    type: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.payment.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        payments,
        total,
        totalPages
      };
    } catch (error) {
      logger.error('Get all payments error:', error);
      throw error;
    }
  }

  async refundPayment(paymentId: string, requesterId: string, reason?: string): Promise<PaymentWithRelations> {
    try {
      // Check if requester is admin
      const requester = await prisma.user.findUnique({
        where: { id: requesterId }
      });

      if (!requester || requester.role !== 'ADMIN') {
        throw new AuthorizationError('فقط مدیران می‌توانند پرداخت را بازگردانی کنند');
      }

      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          user: true,
          consultation: true
        }
      });

      if (!payment) {
        throw new NotFoundError('پرداخت یافت نشد');
      }

      if (payment.status !== PaymentStatus.COMPLETED) {
        throw new ValidationError('فقط پرداخت‌های تکمیل شده قابل بازگردانی هستند');
      }

      // Process refund with gateway
      let refundResult;
      
      switch (payment.method) {
        case PaymentMethod.ZARINPAL:
          refundResult = await this.processZarinpalRefund(payment);
          break;
        case PaymentMethod.MELLAT:
          refundResult = await this.processMellatRefund(payment);
          break;
        case PaymentMethod.PARSIAN:
          refundResult = await this.processParsianRefund(payment);
          break;
        default:
          throw new ValidationError('روش پرداخت برای بازگردانی پشتیبانی نمی‌شود');
      }

      // Update payment status
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.REFUNDED,
          refundedAt: new Date(),
          refundReason: reason,
          gatewayData: {
            ...payment.gatewayData,
            refund: refundResult
          },
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
          consultation: {
            select: {
              id: true,
              type: true,
              status: true
            }
          }
        }
      });

      // Update consultation status if exists
      if (payment.consultationId) {
        await prisma.consultation.update({
          where: { id: payment.consultationId },
          data: {
            status: 'CANCELLED',
            updatedAt: new Date()
          }
        });
      }

      logger.info(`Payment refunded successfully: ${paymentId}`);

      return updatedPayment;
    } catch (error) {
      logger.error('Refund payment error:', error);
      throw error;
    }
  }

  private generateTrackingCode(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `VET${timestamp.slice(-6)}${random}`;
  }

  // Gateway integration methods
  private async initiateZarinpalPayment(payment: any): Promise<any> {
    try {
      const response = await axios.post('https://api.zarinpal.com/pg/v4/payment/request.json', {
        merchant_id: paymentConfig.zarinpal.merchantId,
        amount: payment.amount,
        description: payment.description,
        callback_url: `${paymentConfig.callbackUrl}/zarinpal`,
        metadata: {
          mobile: payment.user.mobile,
          email: payment.user.email
        }
      });

      if (response.data.data.code === 100) {
        return {
          transactionId: response.data.data.authority,
          paymentUrl: `https://www.zarinpal.com/pg/StartPay/${response.data.data.authority}`,
          gatewayData: response.data
        };
      } else {
        throw new PaymentError('خطا در ایجاد درخواست پرداخت');
      }
    } catch (error) {
      logger.error('Zarinpal initiate error:', error);
      throw new PaymentError('خطا در اتصال به درگاه پرداخت');
    }
  }

  private async verifyZarinpalPayment(payment: any, gatewayData: any): Promise<any> {
    try {
      const response = await axios.post('https://api.zarinpal.com/pg/v4/payment/verify.json', {
        merchant_id: paymentConfig.zarinpal.merchantId,
        amount: payment.amount,
        authority: payment.gatewayTransactionId
      });

      return {
        success: response.data.data.code === 100,
        referenceId: response.data.data.ref_id,
        gatewayResponse: response.data
      };
    } catch (error) {
      logger.error('Zarinpal verify error:', error);
      return {
        success: false,
        error: 'خطا در تأیید پرداخت'
      };
    }
  }

  private async processZarinpalRefund(payment: any): Promise<any> {
    // Zarinpal refund implementation
    return { success: true, refundId: 'mock_refund_id' };
  }

  private async initiateMellatPayment(payment: any): Promise<any> {
    // Mellat Bank gateway implementation
    return { transactionId: 'mock_mellat_id', paymentUrl: 'mock_url', gatewayData: {} };
  }

  private async verifyMellatPayment(payment: any, gatewayData: any): Promise<any> {
    // Mellat Bank verification implementation
    return { success: true, referenceId: 'mock_ref_id' };
  }

  private async processMellatRefund(payment: any): Promise<any> {
    // Mellat Bank refund implementation
    return { success: true, refundId: 'mock_refund_id' };
  }

  private async initiateParsianPayment(payment: any): Promise<any> {
    // Parsian Bank gateway implementation
    return { transactionId: 'mock_parsian_id', paymentUrl: 'mock_url', gatewayData: {} };
  }

  private async verifyParsianPayment(payment: any, gatewayData: any): Promise<any> {
    // Parsian Bank verification implementation
    return { success: true, referenceId: 'mock_ref_id' };
  }

  private async processParsianRefund(payment: any): Promise<any> {
    // Parsian Bank refund implementation
    return { success: true, refundId: 'mock_refund_id' };
  }
}

export const paymentService = new PaymentService();