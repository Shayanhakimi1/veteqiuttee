import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  sendVerificationCode,
  verifyCode,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile
} from '../controllers/authController';
import {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
  sendVerificationCodeValidator,
  verifyCodeValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  updateProfileValidator
} from '../validators/authValidators';
import {
  authenticateToken,
  validateRequest,
  authRateLimit,
  strictRateLimit
} from '../middleware';

const router = Router();

// Public routes with strict rate limiting
router.post('/register', 
  authRateLimit,
  registerValidator,
  validateRequest,
  register
);

router.post('/login',
  authRateLimit,
  loginValidator,
  validateRequest,
  login
);

router.post('/refresh',
  authRateLimit,
  refreshTokenValidator,
  validateRequest,
  refreshToken
);

router.post('/send-verification-code',
  strictRateLimit,
  sendVerificationCodeValidator,
  validateRequest,
  sendVerificationCode
);

router.post('/verify-code',
  strictRateLimit,
  verifyCodeValidator,
  validateRequest,
  verifyCode
);

router.post('/forgot-password',
  strictRateLimit,
  forgotPasswordValidator,
  validateRequest,
  forgotPassword
);

router.post('/reset-password',
  authRateLimit,
  resetPasswordValidator,
  validateRequest,
  resetPassword
);

// Protected routes
router.post('/logout',
  authenticateToken,
  logout
);

router.get('/profile',
  authenticateToken,
  getProfile
);

router.put('/profile',
  authenticateToken,
  updateProfileValidator,
  validateRequest,
  updateProfile
);

export default router;