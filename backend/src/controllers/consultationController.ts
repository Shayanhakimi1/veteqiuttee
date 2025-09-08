import { Request, Response } from 'express';
import { consultationService } from '../services/consultationService';
import { 
  CreateConsultationRequest,
  UpdateConsultationRequest,
  GetConsultationsQuery,
  ValidationError,
  NotFoundError,
  AuthorizationError
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
import multer from 'multer';
import path from 'path';

// Configure multer for voice file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/voice/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'voice-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('فرمت فایل صوتی پشتیبانی نمی‌شود'));
    }
  }
});

class ConsultationController {
  async createConsultation(req: AuthenticatedRequest, res: Response): Promise<void> {
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
      const consultationData: CreateConsultationRequest = {
        ...req.body,
        userId
      };
      
      const consultation = await consultationService.createConsultation(consultationData, userId);

      res.status(201).json({
        success: true,
        message: 'مشاوره با موفقیت ثبت شد',
        data: { consultation }
      });
    } catch (error) {
      logger.error('Create consultation controller error:', error);
      
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'خطا در ثبت مشاوره'
        });
      }
    }
  }

  async getConsultationById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const consultationId = req.params.id;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      
      const consultation = await consultationService.getConsultationById(consultationId, userId, userRole);

      res.status(200).json({
        success: true,
        data: { consultation }
      });
    } catch (error) {
      logger.error('Get consultation by id controller error:', error);
      
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
          message: 'خطا در دریافت اطلاعات مشاوره'
        });
      }
    }
  }

  async updateConsultation(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const consultationId = req.params.id;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const updateData: UpdateConsultationRequest = req.body;
      
      const updatedConsultation = await consultationService.updateConsultation(
        consultationId, 
        updateData, 
        userId, 
        userRole
      );

      res.status(200).json({
        success: true,
        message: 'اطلاعات مشاوره با موفقیت به‌روزرسانی شد',
        data: { consultation: updatedConsultation }
      });
    } catch (error) {
      logger.error('Update consultation controller error:', error);
      
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
          message: 'خطا در به‌روزرسانی اطلاعات مشاوره'
        });
      }
    }
  }

  async deleteConsultation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const consultationId = req.params.id;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      
      await consultationService.deleteConsultation(consultationId, userId, userRole);

      res.status(200).json({
        success: true,
        message: 'مشاوره با موفقیت حذف شد'
      });
    } catch (error) {
      logger.error('Delete consultation controller error:', error);
      
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
          message: 'خطا در حذف مشاوره'
        });
      }
    }
  }

  async getUserConsultations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const query: GetConsultationsQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
        status: req.query.status as any,
        priority: req.query.priority as any,
        petId: req.query.petId as string,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        sortBy: req.query.sortBy as any || 'createdAt',
        sortOrder: req.query.sortOrder as any || 'desc'
      };
      
      const result = await consultationService.getUserConsultations(userId, query);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get user consultations controller error:', error);
      
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت لیست مشاوره‌ها'
      });
    }
  }

  async getAllConsultations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Check if user is admin
      if (req.user!.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          message: 'دسترسی غیرمجاز'
        });
        return;
      }

      const query: GetConsultationsQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
        status: req.query.status as any,
        priority: req.query.priority as any,
        userId: req.query.userId as string,
        petId: req.query.petId as string,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        sortBy: req.query.sortBy as any || 'createdAt',
        sortOrder: req.query.sortOrder as any || 'desc'
      };
      
      const result = await consultationService.getAllConsultations(query);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get all consultations controller error:', error);
      
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت لیست همه مشاوره‌ها'
      });
    }
  }

  async getConsultationStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Check if user is admin
      if (req.user!.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          message: 'دسترسی غیرمجاز'
        });
        return;
      }

      const stats = await consultationService.getConsultationStats();

      res.status(200).json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      logger.error('Get consultation stats controller error:', error);
      
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت آمار مشاوره‌ها'
      });
    }
  }

  async getUserConsultationStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const stats = await consultationService.getUserConsultationStats(userId);

      res.status(200).json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      logger.error('Get user consultation stats controller error:', error);
      
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت آمار مشاوره‌های کاربر'
      });
    }
  }

  async uploadVoiceMedia(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const consultationId = req.params.id;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'فایل صوتی ارسال نشده است'
        });
        return;
      }

      const voiceMedia = await consultationService.uploadVoiceMedia(
        consultationId,
        req.file,
        userId,
        userRole
      );

      res.status(200).json({
        success: true,
        message: 'فایل صوتی با موفقیت آپلود شد',
        data: { voiceMedia }
      });
    } catch (error) {
      logger.error('Upload voice media controller error:', error);
      
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
          message: 'خطا در آپلود فایل صوتی'
        });
      }
    }
  }

  async getPetConsultations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const petId = req.params.petId;
      const userId = req.user!.id;
      
      const query: GetConsultationsQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
        status: req.query.status as any,
        priority: req.query.priority as any,
        petId: petId,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        sortBy: req.query.sortBy as any || 'createdAt',
        sortOrder: req.query.sortOrder as any || 'desc'
      };
      
      const result = await consultationService.getUserConsultations(userId, query);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get pet consultations controller error:', error);
      
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت لیست مشاوره‌های حیوان خانگی'
      });
    }
  }

  async updateConsultationStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const consultationId = req.params.id;
      const { status } = req.body;
      const userId = req.user!.id;
      
      const updatedConsultation = await consultationService.updateConsultation(
        consultationId,
        userId,
        { status }
      );

      res.status(200).json({
        success: true,
        message: 'وضعیت مشاوره با موفقیت به‌روزرسانی شد',
        data: { consultation: updatedConsultation }
      });
    } catch (error) {
      logger.error('Update consultation status controller error:', error);
      
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
          message: 'خطا در به‌روزرسانی وضعیت مشاوره'
        });
      }
    }
  }

  async getConsultationsByStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const status = req.params.status as any;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      
      const query: GetConsultationsQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
        priority: req.query.priority as any,
        petId: req.query.petId as string,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        sortBy: req.query.sortBy as any || 'createdAt',
        sortOrder: req.query.sortOrder as any || 'desc'
      };
      
      let result;
      if (userRole === 'ADMIN') {
        result = await consultationService.getAllConsultations({ ...query, status });
      } else {
        result = await consultationService.getUserConsultations(userId, { ...query, status });
      }

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get consultations by status controller error:', error);
      
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت لیست مشاوره‌ها بر اساس وضعیت'
      });
    }
  }

  // Middleware for voice upload
  uploadVoiceMiddleware = upload.single('voiceFile');
}

export const consultationController = new ConsultationController();

// Export individual functions for route imports
export const createConsultation = consultationController.createConsultation.bind(consultationController);
export const getConsultation = consultationController.getConsultationById.bind(consultationController); // Alias for getConsultationById
export const getConsultationById = consultationController.getConsultationById.bind(consultationController);
export const updateConsultation = consultationController.updateConsultation.bind(consultationController);
export const deleteConsultation = consultationController.deleteConsultation.bind(consultationController);
export const getConsultations = consultationController.getAllConsultations.bind(consultationController);
export const getUserConsultations = consultationController.getUserConsultations.bind(consultationController);
export const getPetConsultations = consultationController.getPetConsultations.bind(consultationController);
export const updateConsultationStatus = consultationController.updateConsultationStatus.bind(consultationController);
export const uploadVoiceMedia = consultationController.uploadVoiceMedia.bind(consultationController);
export const getConsultationStats = consultationController.getConsultationStats.bind(consultationController);

export default consultationController;