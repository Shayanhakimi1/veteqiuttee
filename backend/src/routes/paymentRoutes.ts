import { Router } from 'express';
import {
  createPayment,
  initiatePayment,
  verifyPayment,
  getPayment,
  getPayments,
  getUserPayments,
  refundPayment,
  updatePaymentStatus,
  getPaymentStats,
  zarinpalWebhook,
  mellatWebhook
} from '../controllers/paymentController';
import {
  createPaymentValidator,
  initiatePaymentValidator,
  verifyPaymentValidator,
  getPaymentValidator,
  getPaymentsValidator,
  getUserPaymentsValidator,
  refundPaymentValidator,
  updatePaymentStatusValidator,
  getPaymentStatsValidator,
  zarinpalWebhookValidator,
  mellatWebhookValidator
} from '../validators/paymentValidators';
import {
  authenticateToken,
  requireAdmin,
  validateRequest,
  skipAuthForWebhooks
} from '../middleware';

const router = Router();

// Webhook routes (no authentication required)
router.post('/webhook/zarinpal',
  skipAuthForWebhooks,
  zarinpalWebhookValidator,
  validateRequest,
  zarinpalWebhook
);

router.post('/webhook/mellat',
  skipAuthForWebhooks,
  mellatWebhookValidator,
  validateRequest,
  mellatWebhook
);

// All other routes require authentication
router.use(authenticateToken);

// Payment management routes
router.post('/',
  createPaymentValidator,
  validateRequest,
  createPayment
);

router.post('/initiate',
  initiatePaymentValidator,
  validateRequest,
  initiatePayment
);

router.post('/verify',
  verifyPaymentValidator,
  validateRequest,
  verifyPayment
);

router.get('/',
  requireAdmin,
  getPaymentsValidator,
  validateRequest,
  getPayments
);

router.get('/stats',
  requireAdmin,
  getPaymentStatsValidator,
  validateRequest,
  getPaymentStats
);

router.get('/user/:userId',
  getUserPaymentsValidator,
  validateRequest,
  getUserPayments
);

router.get('/:id',
  getPaymentValidator,
  validateRequest,
  getPayment
);

// Admin only routes
router.post('/:id/refund',
  requireAdmin,
  refundPaymentValidator,
  validateRequest,
  refundPayment
);

router.put('/:id/status',
  requireAdmin,
  updatePaymentStatusValidator,
  validateRequest,
  updatePaymentStatus
);

export default router;