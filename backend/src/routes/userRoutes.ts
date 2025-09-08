import { Router } from 'express';
import {
  getUser,
  updateUser,
  deleteUser,
  getUsers,
  updateUserStatus,
  getUserStats
} from '../controllers/userController';
import {
  getUserValidator,
  updateUserValidator,
  deleteUserValidator,
  getUsersValidator,
  updateUserStatusValidator,
  getUserStatsValidator
} from '../validators/userValidators';
import {
  authenticateToken,
  requireAdmin,
  validateRequest,
  uploadProfilePicture
} from '../middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Admin only routes
router.get('/',
  requireAdmin,
  getUsersValidator,
  validateRequest,
  getUsers
);

router.get('/stats',
  requireAdmin,
  getUserStatsValidator,
  validateRequest,
  getUserStats
);

router.put('/:id/status',
  requireAdmin,
  updateUserStatusValidator,
  validateRequest,
  updateUserStatus
);

// User routes (self or admin)
router.get('/:id',
  getUserValidator,
  validateRequest,
  getUser
);

router.put('/:id',
  updateUserValidator,
  validateRequest,
  updateUser
);

router.delete('/:id',
  deleteUserValidator,
  validateRequest,
  deleteUser
);

// Profile picture upload
router.post('/:id/profile-picture',
  uploadProfilePicture,
  (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'فایل تصویر ارائه نشده است',
        code: 'NO_FILE_PROVIDED'
      });
    }
    next();
  },
  updateUser
);

export default router;