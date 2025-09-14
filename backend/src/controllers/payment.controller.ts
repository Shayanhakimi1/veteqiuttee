import { Request, Response } from 'express';
import { createPaymentService, getPaymentByIdService, updatePaymentStatusService, getUserPaymentsService } from '../services/payment.service';
import { logger } from '../utils/logger';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    fullName: string;
    mobile: string;
    role: string;
  };
}

// Create new payment
export const createPayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    logger.info('Creating payment', { userId: req.user?.id, body: req.body });
    
    const paymentData = {
      ...req.body,
      userId: req.user?.id
    };
    
    const payment = await createPaymentService(paymentData);
    
    res.status(201).json({
      message: 'Payment created successfully',
      payment
    });
  } catch (error: any) {
    logger.error('Payment creation failed', { error: error.message, userId: req.user?.id });
    res.status(500).json({ error: { message: error.message } });
  }
};

// Get payment by ID
export const getPaymentById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: { message: 'User not authenticated' } });
    }
    
    const payment = await getPaymentByIdService(parseInt(id), userId);
    
    if (!payment) {
      return res.status(404).json({ error: { message: 'Payment not found' } });
    }
    
    res.json({ payment });
  } catch (error: any) {
    logger.error('Get payment failed', { error: error.message, paymentId: req.params.id });
    res.status(500).json({ error: { message: error.message } });
  }
};

// Update payment status
export const updatePaymentStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: { message: 'User not authenticated' } });
    }
    
    const payment = await updatePaymentStatusService(parseInt(id), status, userId);
    
    if (!payment) {
      return res.status(404).json({ error: { message: 'Payment not found' } });
    }
    
    res.json({
      message: 'Payment status updated successfully',
      payment
    });
  } catch (error: any) {
    logger.error('Update payment status failed', { error: error.message, paymentId: req.params.id });
    res.status(500).json({ error: { message: error.message } });
  }
};

// Get user payments
export const getUserPayments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 10 } = req.query;
    
    if (!userId) {
      return res.status(401).json({ error: { message: 'User not authenticated' } });
    }
    
    const payments = await getUserPaymentsService(userId, {
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    });
    
    res.json({ payments });
  } catch (error: any) {
    logger.error('Get user payments failed', { error: error.message, userId: req.user?.id });
    res.status(500).json({ error: { message: error.message } });
  }
};