import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { SMSStatus } from '../types';
import { smsConfig } from '../config';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

class SMSService {
  async sendVerificationCode(mobile: string, code: string): Promise<void> {
    const message = `کد تأیید شما: ${code}\nاین کد تا 5 دقیقه معتبر است.`;
    await this.sendSMS(mobile, message, 'VERIFICATION');
  }

  async sendAppointmentReminder(mobile: string, appointmentDate: string, doctorName: string): Promise<void> {
    const message = `یادآوری نوبت: نوبت شما با دکتر ${doctorName} در تاریخ ${appointmentDate} است.`;
    await this.sendSMS(mobile, message, 'APPOINTMENT_REMINDER');
  }

  async sendConsultationUpdate(mobile: string, status: string): Promise<void> {
    const statusText = this.getStatusText(status);
    const message = `وضعیت مشاوره شما به ${statusText} تغییر یافت.`;
    await this.sendSMS(mobile, message, 'CONSULTATION_UPDATE');
  }

  async sendPaymentConfirmation(mobile: string, amount: number, transactionId: string): Promise<void> {
    const message = `پرداخت شما به مبلغ ${amount.toLocaleString()} تومان با موفقیت انجام شد. کد پیگیری: ${transactionId}`;
    await this.sendSMS(mobile, message, 'PAYMENT_CONFIRMATION');
  }

  private async sendSMS(mobile: string, message: string, type: string): Promise<void> {
    try {
      let status = SMSStatus.PENDING;
      let providerId: string | null = null;
      let error: string | null = null;

      if (smsConfig.provider === 'mock') {
        // Mock SMS service for development
        logger.info(`Mock SMS sent to ${mobile}: ${message}`);
        status = SMSStatus.SENT;
        providerId = `mock_${Date.now()}`;
      } else {
        // Real SMS service implementation
        try {
          const response = await this.sendRealSMS(mobile, message);
          status = SMSStatus.SENT;
          providerId = response.messageId;
        } catch (smsError: any) {
          status = SMSStatus.FAILED;
          error = smsError.message;
          logger.error('SMS sending failed:', smsError);
        }
      }

      // Save SMS record
      await prisma.sMSMessage.create({
        data: {
          mobile,
          message,
          type,
          status,
          providerId,
          error,
          sentAt: status === SMSStatus.SENT ? new Date() : null
        }
      });

      if (status === SMSStatus.FAILED) {
        throw new Error(`Failed to send SMS: ${error}`);
      }

    } catch (error) {
      logger.error('SMS service error:', error);
      throw error;
    }
  }

  private async sendRealSMS(mobile: string, message: string): Promise<{ messageId: string }> {
    // This is a placeholder for real SMS service integration
    // You can integrate with services like Kavenegar, Melipayamak, etc.
    
    if (!smsConfig.apiKey || !smsConfig.sender) {
      throw new Error('SMS service not configured');
    }

    // Example implementation for a generic SMS service
    const response = await axios.post('https://api.sms-service.com/send', {
      sender: smsConfig.sender,
      receptor: mobile,
      message: message
    }, {
      headers: {
        'Authorization': `Bearer ${smsConfig.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.status !== 'success') {
      throw new Error(response.data.message || 'SMS sending failed');
    }

    return {
      messageId: response.data.messageId
    };
  }

  private getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'PENDING': 'در انتظار بررسی',
      'IN_PROGRESS': 'در حال بررسی',
      'COMPLETED': 'تکمیل شده',
      'CANCELLED': 'لغو شده'
    };

    return statusMap[status] || status;
  }

  async getSMSHistory(mobile?: string, limit: number = 50): Promise<any[]> {
    try {
      const messages = await prisma.sMSMessage.findMany({
        where: mobile ? { mobile } : undefined,
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return messages;
    } catch (error) {
      logger.error('Get SMS history error:', error);
      throw error;
    }
  }

  async updateSMSStatus(providerId: string, status: SMSStatus, deliveredAt?: Date): Promise<void> {
    try {
      await prisma.sMSMessage.updateMany({
        where: { providerId },
        data: {
          status,
          deliveredAt: deliveredAt || (status === SMSStatus.DELIVERED ? new Date() : undefined)
        }
      });
    } catch (error) {
      logger.error('Update SMS status error:', error);
      throw error;
    }
  }

  async getFailedMessages(limit: number = 100): Promise<any[]> {
    try {
      const messages = await prisma.sMSMessage.findMany({
        where: { status: SMSStatus.FAILED },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return messages;
    } catch (error) {
      logger.error('Get failed messages error:', error);
      throw error;
    }
  }

  async retrySMS(messageId: string): Promise<void> {
    try {
      const message = await prisma.sMSMessage.findUnique({
        where: { id: messageId }
      });

      if (!message) {
        throw new Error('SMS message not found');
      }

      if (message.status !== SMSStatus.FAILED) {
        throw new Error('Only failed messages can be retried');
      }

      // Retry sending
      await this.sendSMS(message.mobile, message.message, message.type);

      logger.info(`SMS retry successful for message: ${messageId}`);
    } catch (error) {
      logger.error('SMS retry error:', error);
      throw error;
    }
  }
}

export const smsService = new SMSService();