import { Router } from 'express';
import { createPayment, getPaymentById, updatePaymentStatus, getUserPayments } from '../controllers/payment.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Create new payment
router.post('/payments', authenticateToken, createPayment);

// Get payment by ID
router.get('/payments/:id', authenticateToken, getPaymentById);

// Update payment status
router.put('/payments/:id/status', authenticateToken, updatePaymentStatus);

// Get user payments
router.get('/payments', authenticateToken, getUserPayments);

export default router;