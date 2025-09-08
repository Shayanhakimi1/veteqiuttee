import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { 
  RegisterRequest,
  LoginRequest,
  RefreshTokenRequest,
  VerifyCodeRequest,
  ResendCodeRequest,
  ValidationError,
  AuthenticationError,
  NotFoundError
} from '../types';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    mobile: string;
    role: string;
  };
}
import { logger } from '../utils/logger';
import { validationResult } from 'express-validator';

class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'اطلاعات وارد شده معتبر نیست',
          errors: errors.array()
        });
        return;
      }

      const registerData: RegisterRequest = req.body;
      const result = await authService.register(registerData);

      res.status(201).json({
        success: true,
        message: 'کد تأیید به شماره موبایل شما ارسال شد',
        data: {
          userId: result.user.id,
          mobile: result.user.mobile,
          verificationRequired: true
        }
      });
    } catch (error) {
      logger.error('Register controller error:', error);
      
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'خطا در ثبت‌نام. لطفاً دوباره تلاش کنید.'
        });
      }
    }
  }

  async verifyRegistration(req: Request, res: Response): Promise<void> {
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

      const verifyData: VerifyCodeRequest = req.body;
      const result = await authService.verifyRegistration(verifyData.mobile, verifyData.code);

      res.status(200).json({
        success: true,
        message: 'ثبت‌نام با موفقیت تکمیل شد',
        data: {
          user: result.user,
          tokens: result.tokens
        }
      });
    } catch (error) {
      logger.error('Verify registration controller error:', error);
      
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'خطا در تأیید کد. لطفاً دوباره تلاش کنید.'
        });
      }
    }
  }

  async login(req: Request, res: Response): Promise<void> {
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

      const loginData: LoginRequest = req.body;
      const result = await authService.login(loginData);

      res.status(200).json({
        success: true,
        message: 'ورود موفقیت‌آمیز',
        data: {
          user: result.user,
          tokens: result.tokens
        }
      });
    } catch (error) {
      logger.error('Login controller error:', error);
      
      if (error instanceof AuthenticationError || error instanceof ValidationError) {
        res.status(401).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'خطا در ورود. لطفاً دوباره تلاش کنید.'
        });
      }
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
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

      const { refreshToken }: RefreshTokenRequest = req.body;
      const result = await authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        message: 'توکن‌ها با موفقیت تجدید شدند',
        data: {
          tokens: result.tokens
        }
      });
    } catch (error) {
      logger.error('Refresh token controller error:', error);
      
      if (error instanceof AuthenticationError) {
        res.status(401).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'خطا در تجدید توکن. لطفاً دوباره وارد شوید.'
        });
      }
    }
  }

  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const refreshToken = req.body.refreshToken;

      await authService.logout(userId, refreshToken);

      res.status(200).json({
        success: true,
        message: 'خروج موفقیت‌آمیز'
      });
    } catch (error) {
      logger.error('Logout controller error:', error);
      
      res.status(500).json({
        success: false,
        message: 'خطا در خروج'
      });
    }
  }

  async logoutAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      await authService.logoutAll(userId);

      res.status(200).json({
        success: true,
        message: 'خروج از همه دستگاه‌ها موفقیت‌آمیز'
      });
    } catch (error) {
      logger.error('Logout all controller error:', error);
      
      res.status(500).json({
        success: false,
        message: 'خطا در خروج از همه دستگاه‌ها'
      });
    }
  }

  async resendVerificationCode(req: Request, res: Response): Promise<void> {
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

      const { mobile }: ResendCodeRequest = req.body;
      await authService.resendVerificationCode(mobile);

      res.status(200).json({
        success: true,
        message: 'کد تأیید مجدداً ارسال شد'
      });
    } catch (error) {
      logger.error('Resend verification code controller error:', error);
      
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'خطا در ارسال کد تأیید'
        });
      }
    }
  }

  async verifyCode(req: Request, res: Response): Promise<void> {
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

      const verifyData: VerifyCodeRequest = req.body;
      const result = await authService.verifyCode(verifyData);

      res.status(200).json({
        success: true,
        message: 'کد تأیید با موفقیت تأیید شد',
        data: result
      });
    } catch (error) {
      logger.error('Verify code controller error:', error);
      
      if (error instanceof ValidationError || error instanceof AuthenticationError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'خطا در تأیید کد'
        });
      }
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
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

      const { mobile } = req.body;
      await authService.forgotPassword(mobile);

      res.status(200).json({
        success: true,
        message: 'کد بازیابی رمز عبور به شماره موبایل شما ارسال شد'
      });
    } catch (error) {
      logger.error('Forgot password controller error:', error);
      
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'خطا در ارسال کد بازیابی'
        });
      }
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
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

      const { mobile, code, newPassword } = req.body;
      await authService.resetPassword(mobile, code, newPassword);

      res.status(200).json({
        success: true,
        message: 'رمز عبور با موفقیت تغییر یافت'
      });
    } catch (error) {
      logger.error('Reset password controller error:', error);
      
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'خطا در تغییر رمز عبور'
        });
      }
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
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
      const { currentPassword, newPassword } = req.body;
      
      await authService.changePassword(userId, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        message: 'رمز عبور با موفقیت تغییر یافت'
      });
    } catch (error) {
      logger.error('Change password controller error:', error);
      
      if (error instanceof AuthenticationError || error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'خطا در تغییر رمز عبور'
        });
      }
    }
  }

  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const user = await authService.getUserProfile(userId);

      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      logger.error('Get profile controller error:', error);
      
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'خطا در دریافت اطلاعات کاربری'
        });
      }
    }
  }

  async validateToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // If we reach here, token is valid (middleware already validated it)
      res.status(200).json({
        success: true,
        message: 'توکن معتبر است',
        data: {
          user: req.user
        }
      });
    } catch (error) {
      logger.error('Validate token controller error:', error);
      
      res.status(500).json({
        success: false,
        message: 'خطا در اعتبارسنجی توکن'
      });
    }
  }
}

export const authController = new AuthController();

// Export individual functions for route imports
export const register = authController.register.bind(authController);
export const login = authController.login.bind(authController);
export const refreshToken = authController.refreshToken.bind(authController);
export const logout = authController.logout.bind(authController);
export const logoutAll = authController.logoutAll.bind(authController);
export const sendVerificationCode = authController.resendVerificationCode.bind(authController);
export const verifyCode = authController.verifyCode.bind(authController);
export const getProfile = authController.getProfile.bind(authController);
export const validateToken = authController.validateToken.bind(authController);

// Add missing functions that routes expect
export const forgotPassword = async (req: any, res: any) => {
  res.status(501).json({
    success: false,
    message: 'این قابلیت هنوز پیاده‌سازی نشده است'
  });
};

export const resetPassword = async (req: any, res: any) => {
  res.status(501).json({
    success: false,
    message: 'این قابلیت هنوز پیاده‌سازی نشده است'
  });
};

export const updateProfile = async (req: any, res: any) => {
  res.status(501).json({
    success: false,
    message: 'این قابلیت هنوز پیاده‌سازی نشده است'
  });
};

export default authController;