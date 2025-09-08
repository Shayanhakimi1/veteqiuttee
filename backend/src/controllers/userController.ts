import { Request, Response } from 'express';
import { userService } from '../services/userService';
import { 
  AuthenticatedRequest,
  UpdateUserRequest,
  GetUsersQuery,
  ValidationError,
  NotFoundError,
  AuthorizationError
} from '../types';
import { logger } from '../utils/logger';
import { validationResult } from 'express-validator';

class UserController {
  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const user = await userService.getUserById(userId);

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

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
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
      const updateData: UpdateUserRequest = req.body;
      
      const updatedUser = await userService.updateUser(userId, updateData, userId);

      res.status(200).json({
        success: true,
        message: 'اطلاعات کاربری با موفقیت به‌روزرسانی شد',
        data: { user: updatedUser }
      });
    } catch (error) {
      logger.error('Update profile controller error:', error);
      
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
          message: 'خطا در به‌روزرسانی اطلاعات کاربری'
        });
      }
    }
  }

  async deleteAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      await userService.deleteUser(userId, userId);

      res.status(200).json({
        success: true,
        message: 'حساب کاربری با موفقیت حذف شد'
      });
    } catch (error) {
      logger.error('Delete account controller error:', error);
      
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'خطا در حذف حساب کاربری'
        });
      }
    }
  }

  // Admin endpoints
  async getAllUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Check if user is admin
      if (req.user!.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          message: 'دسترسی غیرمجاز'
        });
        return;
      }

      const query: GetUsersQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
        role: req.query.role as any,
        status: req.query.status as any,
        sortBy: req.query.sortBy as any || 'createdAt',
        sortOrder: req.query.sortOrder as any || 'desc'
      };

      const result = await userService.getAllUsers(query);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get all users controller error:', error);
      
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت لیست کاربران'
      });
    }
  }

  async getUserById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Check if user is admin or requesting own data
      const requestedUserId = req.params.id;
      const currentUserId = req.user!.id;
      
      if (req.user!.role !== 'ADMIN' && requestedUserId !== currentUserId) {
        res.status(403).json({
          success: false,
          message: 'دسترسی غیرمجاز'
        });
        return;
      }

      const user = await userService.getUserById(requestedUserId);

      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      logger.error('Get user by id controller error:', error);
      
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'خطا در دریافت اطلاعات کاربر'
        });
      }
    }
  }

  async updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const userId = req.params.id;
      const updateData: UpdateUserRequest = req.body;
      const currentUserId = req.user!.id;
      
      const updatedUser = await userService.updateUser(userId, updateData, currentUserId);

      res.status(200).json({
        success: true,
        message: 'اطلاعات کاربر با موفقیت به‌روزرسانی شد',
        data: { user: updatedUser }
      });
    } catch (error) {
      logger.error('Update user controller error:', error);
      
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
          message: 'خطا در به‌روزرسانی اطلاعات کاربر'
        });
      }
    }
  }

  async deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Check if user is admin
      if (req.user!.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          message: 'دسترسی غیرمجاز'
        });
        return;
      }

      const userId = req.params.id;
      const currentUserId = req.user!.id;
      
      await userService.deleteUser(userId, currentUserId);

      res.status(200).json({
        success: true,
        message: 'کاربر با موفقیت حذف شد'
      });
    } catch (error) {
      logger.error('Delete user controller error:', error);
      
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
          message: 'خطا در حذف کاربر'
        });
      }
    }
  }

  async updateUserStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const userId = req.params.id;
      const { status } = req.body;
      const currentUserId = req.user!.id;
      
      const updatedUser = await userService.updateUserStatus(userId, status, currentUserId);

      res.status(200).json({
        success: true,
        message: 'وضعیت کاربر با موفقیت به‌روزرسانی شد',
        data: { user: updatedUser }
      });
    } catch (error) {
      logger.error('Update user status controller error:', error);
      
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
          message: 'خطا در به‌روزرسانی وضعیت کاربر'
        });
      }
    }
  }

  async uploadProfilePicture(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'فایل تصویر ارسال نشده است'
        });
        return;
      }

      const result = await userService.uploadProfilePicture(userId, req.file);

      res.status(200).json({
        success: true,
        message: 'تصویر پروفایل با موفقیت آپلود شد',
        data: result
      });
    } catch (error) {
      logger.error('Upload profile picture controller error:', error);
      
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
          message: 'خطا در آپلود تصویر پروفایل'
        });
      }
    }
  }

  async getUserStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Check if user is admin
      if (req.user!.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          message: 'دسترسی غیرمجاز'
        });
        return;
      }

      const stats = await userService.getUserStats();

      res.status(200).json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      logger.error('Get user stats controller error:', error);
      
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت آمار کاربران'
      });
    }
  }
}

export const userController = new UserController();

// Export individual functions for route imports
export const getUsers = userController.getAllUsers.bind(userController);
export const getUser = userController.getUserById.bind(userController); // Alias for getUserById
export const getUserById = userController.getUserById.bind(userController);
export const updateUser = userController.updateUser.bind(userController);
export const updateUserStatus = userController.updateUserStatus.bind(userController);
export const uploadProfilePicture = userController.uploadProfilePicture.bind(userController);
export const getUserStats = userController.getUserStats.bind(userController);

// Add missing functions that routes expect
export const deleteUser = async (req: any, res: any) => {
  res.status(501).json({
    success: false,
    message: 'این قابلیت هنوز پیاده‌سازی نشده است'
  });
};

export default userController;