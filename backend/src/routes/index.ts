import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import petRoutes from './petRoutes.js';
import consultationRoutes from './consultationRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import fileRoutes from './fileRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/pets', petRoutes);
router.use('/consultations', consultationRoutes);
router.use('/files', fileRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin', adminRoutes);

// API documentation endpoint
router.get('/docs', (_req, res) => {
  res.json({
    success: true,
    message: 'Veterinary Consultation API Documentation',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'User login',
        'POST /api/auth/refresh': 'Refresh access token',
        'POST /api/auth/logout': 'User logout',
        'POST /api/auth/logout-all': 'Logout from all devices',
        'GET /api/auth/me': 'Get current user profile',
        'PATCH /api/auth/change-password': 'Change password',
        'GET /api/auth/verify': 'Verify token'
      },
      users: {
        'GET /api/users': 'Get all users (Admin only)',
        'GET /api/users/:id': 'Get user by ID',
        'PATCH /api/users/:id': 'Update user profile',
        'PATCH /api/users/:id/deactivate': 'Deactivate user (Admin only)',
        'PATCH /api/users/:id/activate': 'Activate user (Admin only)',
        'DELETE /api/users/:id': 'Delete user (Admin only)',
        'GET /api/users/stats/overview': 'Get user statistics (Admin only)'
      },
      pets: {
        'GET /api/pets': 'Get all pets for current user',
        'GET /api/pets/:id': 'Get pet by ID',
        'POST /api/pets': 'Create new pet',
        'PATCH /api/pets/:id': 'Update pet',
        'DELETE /api/pets/:id': 'Delete pet',
        'GET /api/pets/:id/medical-history': 'Get pet medical history',
        'GET /api/pets/stats/overview': 'Get pet statistics (Admin only)'
      },
      consultations: {
        'GET /api/consultations': 'Get all consultations for current user',
        'GET /api/consultations/:id': 'Get consultation by ID',
        'POST /api/consultations': 'Create new consultation',
        'PATCH /api/consultations/:id': 'Update consultation',
        'PATCH /api/consultations/:id/status': 'Update consultation status (Admin only)',
        'DELETE /api/consultations/:id': 'Delete consultation',
        'GET /api/consultations/stats/overview': 'Get consultation statistics (Admin only)'
      },
      files: {
        'POST /api/files/upload': 'Upload files',
        'GET /api/files/consultation/:consultationId': 'Get files for consultation',
        'GET /api/files/:id': 'Get file by ID',
        'GET /api/files/:id/download': 'Download file',
        'DELETE /api/files/:id': 'Delete file',
        'GET /api/files/stats/overview': 'Get file statistics (Admin only)'
      },
      payments: {
        'GET /api/payments': 'Get all payments for current user',
        'GET /api/payments/:id': 'Get payment by ID',
        'POST /api/payments': 'Create new payment',
        'PATCH /api/payments/:id/status': 'Update payment status (Admin only)',
        'PATCH /api/payments/:id/confirm': 'Confirm payment (User uploads receipt)',
        'PATCH /api/payments/:id/cancel': 'Cancel payment',
        'GET /api/payments/stats/overview': 'Get payment statistics (Admin only)',
        'GET /api/payments/pending-verification': 'Get pending payments for verification (Admin only)'
      },
      admin: {
        'GET /api/admin/dashboard': 'Get dashboard overview (Admin only)',
        'GET /api/admin/admins': 'Get all admins (Super Admin only)',
        'POST /api/admin/admins': 'Create new admin (Super Admin only)',
        'PATCH /api/admin/admins/:id': 'Update admin (Super Admin only)',
        'DELETE /api/admin/admins/:id': 'Delete admin (Super Admin only)',
        'GET /api/admin/logs': 'Get system logs (Super Admin only)',
        'GET /api/admin/health': 'Get system health (Admin only)',
        'GET /api/admin/export/:type': 'Export data (Super Admin only)'
      }
    },
    authentication: {
      description: 'Most endpoints require authentication via JWT token',
      header: 'Authorization: Bearer <token>',
      adminEndpoints: 'Admin endpoints require admin role',
      superAdminEndpoints: 'Some admin endpoints require super admin role'
    },
    fileUpload: {
      supportedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'video/mp4', 'video/mpeg', 'video/quicktime'],
      maxFileSize: '10MB',
      maxFilesPerRequest: 10
    },
    pagination: {
      defaultPage: 1,
      defaultLimit: 10,
      maxLimit: 100,
      queryParams: ['page', 'limit', 'search', 'sortBy', 'sortOrder']
    }
  });
});

export default router;