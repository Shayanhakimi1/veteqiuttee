import { Router } from 'express';
import {
  getDashboardStats,
  getAllUsers,
  getAllPets,
  getAllPayments,
  getAllConsultations,
  updatePaymentStatus,
  updateConsultationStatus,
  getUserById
} from '../controllers/admin.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
// router.use(requireAdmin); // Uncomment when admin role checking is needed

// Dashboard statistics
router.get('/admin/dashboard', getDashboardStats);

// User management
router.get('/admin/users', getAllUsers);
router.get('/admin/users/:userId', getUserById);

// Pet management
router.get('/admin/pets', getAllPets);

// Payment management
router.get('/admin/payments', getAllPayments);
router.put('/admin/payments/:paymentId/status', updatePaymentStatus);

// Consultation management
router.get('/admin/consultations', getAllConsultations);
router.put('/admin/consultations/:consultationId/status', updateConsultationStatus);

export default router;