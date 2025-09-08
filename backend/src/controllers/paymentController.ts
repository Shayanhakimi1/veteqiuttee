import { Request, Response } from 'express';
import { paymentService } from '../services/paymentService';
import { 
  AuthenticatedRequest,
  CreatePaymentRequest,
  InitiatePaymentRequest,
  VerifyPaymentRequest,
  RefundPaymentRequest,
  GetPaymentsQuery,
  ValidationError,
  NotFoundError,
  AuthorizationError
} from '../types';
import { logger } from '../utils/logger';
import { validationResult } from 'express-validator';

class PaymentController {
  async createPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'اطلاعات وارد شده معتبر نیست',
          errors: errors.array()
        });
        return;
      }

      const userId = req.user!.id;
      const paymentData: CreatePaymentRequest = {
        ...req.body,
        userId
      };
      
      const payment = await paymentService.createPayment(paymentData, userId);

      res.status(201).json({
        success: true,
        message: 'پرداخت با موفقیت ایجاد شد',
        data: { payment }
      });
    } catch (error) {
      logger.error('Create payment controller error:', error);
      
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'خطا در ایجاد پرداخت'
        });
      }
    }
  }

  async initiatePayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'اطلاعات وارد شده معتبر نیست',
          errors: errors.array()
        });
        return;
      }

      const userId = req.user!.id;
      const initiateData: InitiatePaymentRequest = req.body;
      
      const result = await paymentService.initiatePayment(initiateData, userId);

      res.status(200).json({
        success: true,
        message: 'پرداخت آماده انجام است',
        data: result
      });
    } catch (error) {
      logger.error('Initiate payment controller error:', error);
      
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'خطا در آماده‌سازی پرداخت'
        });
      }
    }
  }

  async verifyPayment(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'اطلاعات وارد شده معتبر نیست',
          errors: errors.array()
        });
        return;
      }

      const verifyData: VerifyPaymentRequest = req.body;
      const result = await paymentService.verifyPayment(verifyData);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'پرداخت با موفقیت تأیید شد',
          data: result
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'پرداخت تأیید نشد',
          data: result
        });
      }
    } catch (error) {
      logger.error('Verify payment controller error:', error);
      
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'خطا در تأیید پرداخت'
        });
      }
    }
  }

  async getPaymentById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const paymentId = req.params.id;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      
      const payment = await paymentService.getPaymentById(paymentId, userId, userRole);

      res.status(200).json({
        success: true,
        data: { payment }
      });
    } catch (error) {
      logger.error('Get payment by id controller error:', error);
      
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else if (error instanceof AuthorizationError) {
        res.status(403).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'خطا در دریافت اطلاعات پرداخت'
        });
      }
    }
  }

  async getUserPayments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const query: GetPaymentsQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
        status: req.query.status as any,
        gateway: req.query.gateway as any,
        consultationId: req.query.consultationId as string,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        sortBy: req.query.sortBy as any || 'createdAt',
        sortOrder: req.query.sortOrder as any || 'desc'
      };
      
      const result = await paymentService.getUserPayments(userId, query);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get user payments controller error:', error);
      
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت لیست پرداخت‌ها'
      });
    }
  }

  async getAllPayments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Check if user is admin
      if (req.user!.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          message: 'دسترسی غیرمجاز'
        });
        return;
      }

      const query: GetPaymentsQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
        status: req.query.status as any,
        gateway: req.query.gateway as any,
        userId: req.query.userId as string,
        consultationId: req.query.consultationId as string,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        sortBy: req.query.sortBy as any || 'createdAt',
        sortOrder: req.query.sortOrder as any || 'desc'
      };
      
      const result = await paymentService.getAllPayments(query);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get all payments controller error:', error);
      
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت لیست همه پرداخت‌ها'
      });
    }
  }

  async refundPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Check if user is admin
      if (req.user!.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          message: 'دسترسی غیرمجاز'
        });
        return;
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'اطلاعات وارد شده معتبر نیست',
          errors: errors.array()
        });
        return;
      }

      const paymentId = req.params.id;
      const refundData: RefundPaymentRequest = {
        ...req.body,
        paymentId
      };
      const adminId = req.user!.id;
      
      const result = await paymentService.refundPayment(refundData, adminId);

      res.status(200).json({
        success: true,
        message: 'بازپرداخت با موفقیت انجام شد',
        data: result
      });
    } catch (error) {
      logger.error('Refund payment controller error:', error);
      
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else if (error instanceof AuthorizationError) {
        res.status(403).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'خطا در انجام بازپرداخت'
        });
      }
    }
  }

  async getPaymentStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Check if user is admin
      if (req.user!.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          message: 'دسترسی غیرمجاز'
        });
        return;
      }

      const stats = await paymentService.getPaymentStats();

      res.status(200).json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      logger.error('Get payment stats controller error:', error);
      
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت آمار پرداخت‌ها'
      });
    }
  }

  async getUserPaymentStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const stats = await paymentService.getUserPaymentStats(userId);

      res.status(200).json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      logger.error('Get user payment stats controller error:', error);
      
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت آمار پرداخت‌های کاربر'
      });
    }
  }

  async getPaymentsByStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const status = req.params.status as any;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      
      const query: GetPaymentsQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
        gateway: req.query.gateway as any,
        consultationId: req.query.consultationId as string,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        sortBy: req.query.sortBy as any || 'createdAt',
        sortOrder: req.query.sortOrder as any || 'desc'
      };
      
      let result;
      if (userRole === 'ADMIN') {
        result = await paymentService.getAllPayments({ ...query, status });
      } else {
        result = await paymentService.getUserPayments(userId, { ...query, status });
      }

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get payments by status controller error:', error);
      
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت لیست پرداخت‌ها بر اساس وضعیت'
      });
    }
  }

  async getPaymentsByGateway(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const gateway = req.params.gateway as any;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      
      const query: GetPaymentsQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
        status: req.query.status as any,
        consultationId: req.query.consultationId as string,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        sortBy: req.query.sortBy as any || 'createdAt',
        sortOrder: req.query.sortOrder as any || 'desc'
      };
      
      let result;
      if (userRole === 'ADMIN') {
        result = await paymentService.getAllPayments({ ...query, gateway });
      } else {
        result = await paymentService.getUserPayments(userId, { ...query, gateway });
      }

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get payments by gateway controller error:', error);
      
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت لیست پرداخت‌ها بر اساس درگاه'
      });
    }
  }

  // Webhook endpoints for payment gateways
  async updatePaymentStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const paymentId = req.params.id;
      const { status } = req.body;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      
      // Check if user is admin
      if (userRole !== 'ADMIN') {
        res.status(403).json({
          success: false,
          message: 'دسترسی غیرمجاز'
        });
        return;
      }
      
      const updatedPayment = await paymentService.updatePaymentStatus(
        paymentId,
        status,
        userId
      );

      res.status(200).json({
        success: true,
        message: 'وضعیت پرداخت با موفقیت به‌روزرسانی شد',
        data: { payment: updatedPayment }
      });
    } catch (error) {
      logger.error('Update payment status controller error:', error);
      
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else if (error instanceof AuthorizationError) {
        res.status(403).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'خطا در به‌روزرسانی وضعیت پرداخت'
        });
      }
    }
  }

  async zarinpalCallback(req: Request, res: Response): Promise<void> {
    try {
      const { Authority, Status } = req.query;
      
      if (Status === 'OK' && Authority) {
        // Handle successful payment callback
        const verifyData: VerifyPaymentRequest = {
          gateway: 'ZARINPAL',
          authority: Authority as string,
          transactionId: Authority as string
        };
        
        const result = await paymentService.verifyPayment(verifyData);
        
        if (result.success) {
          res.redirect(`${process.env.FRONTEND_URL}/payment/success?ref=${Authority}`);
        } else {
          res.redirect(`${process.env.FRONTEND_URL}/payment/failed?ref=${Authority}`);
        }
      } else {
        res.redirect(`${process.env.FRONTEND_URL}/payment/failed`);
      }
    } catch (error) {
      logger.error('Zarinpal callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/payment/failed`);
    }
  }

  async mellatCallback(req: Request, res: Response): Promise<void> {
    try {
      const { RefId, ResCode } = req.body;
      
      if (ResCode === '0' && RefId) {
        // Handle successful payment callback
        const verifyData: VerifyPaymentRequest = {
          gateway: 'MELLAT',
          authority: RefId,
          transactionId: RefId
        };
        
        const result = await paymentService.verifyPayment(verifyData);
        
        if (result.success) {
          res.redirect(`${process.env.FRONTEND_URL}/payment/success?ref=${RefId}`);
        } else {
          res.redirect(`${process.env.FRONTEND_URL}/payment/failed?ref=${RefId}`);
        }
      } else {
        res.redirect(`${process.env.FRONTEND_URL}/payment/failed`);
      }
    } catch (error) {
      logger.error('Mellat callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/payment/failed`);
    }
  }
}

export const paymentController = new PaymentController();

// Export individual functions
export const createPayment = paymentController.createPayment.bind(paymentController);
export const initiatePayment = paymentController.initiatePayment.bind(paymentController);
export const verifyPayment = paymentController.verifyPayment.bind(paymentController);
export const getPayment = paymentController.getPaymentById.bind(paymentController);
export const getPayments = paymentController.getAllPayments.bind(paymentController);
export const getUserPayments = paymentController.getUserPayments.bind(paymentController);
export const refundPayment = paymentController.refundPayment.bind(paymentController);
export const updatePaymentStatus = paymentController.updatePaymentStatus.bind(paymentController);
export const getPaymentStats = paymentController.getPaymentStats.bind(paymentController);
export const zarinpalWebhook = paymentController.zarinpalCallback.bind(paymentController);
export const mellatWebhook = paymentController.mellatCallback.bind(paymentController);

export default paymentController;