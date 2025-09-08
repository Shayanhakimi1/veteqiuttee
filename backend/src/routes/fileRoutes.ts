import { Router } from 'express';
import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import {
  authenticateToken,
  uploadProfilePicture,
  uploadPetImage,
  uploadVoiceMessage,
  uploadConsultationFiles
} from '../middleware';
import { logger } from '../utils/logger';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// File upload endpoints
router.post('/upload/profile-picture',
  uploadProfilePicture,
  (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'فایل تصویر ارائه نشده است',
          code: 'NO_FILE_PROVIDED'
        });
      }

      const fileUrl = `/uploads/profiles/${req.file.filename}`;
      
      logger.logAPI('info', 'Profile picture uploaded', {
        userId: req.user?.id,
        filename: req.file.filename,
        size: req.file.size
      });

      res.json({
        success: true,
        message: 'تصویر پروفایل با موفقیت آپلود شد',
        data: {
          url: fileUrl,
          filename: req.file.filename,
          size: req.file.size
        }
      });
    } catch (error) {
      logger.logAPI('error', 'Profile picture upload failed', { error, userId: req.user?.id });
      res.status(500).json({
        success: false,
        message: 'خطا در آپلود تصویر پروفایل',
        code: 'UPLOAD_ERROR'
      });
    }
  }
);

router.post('/upload/pet-image',
  uploadPetImage,
  (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'فایل تصویر ارائه نشده است',
          code: 'NO_FILE_PROVIDED'
        });
      }

      const fileUrl = `/uploads/pets/${req.file.filename}`;
      
      logger.logAPI('info', 'Pet image uploaded', {
        userId: req.user?.id,
        filename: req.file.filename,
        size: req.file.size
      });

      res.json({
        success: true,
        message: 'تصویر حیوان خانگی با موفقیت آپلود شد',
        data: {
          url: fileUrl,
          filename: req.file.filename,
          size: req.file.size
        }
      });
    } catch (error) {
      logger.logAPI('error', 'Pet image upload failed', { error, userId: req.user?.id });
      res.status(500).json({
        success: false,
        message: 'خطا در آپلود تصویر حیوان خانگی',
        code: 'UPLOAD_ERROR'
      });
    }
  }
);

router.post('/upload/voice-message',
  uploadVoiceMessage,
  (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'فایل صوتی ارائه نشده است',
          code: 'NO_FILE_PROVIDED'
        });
      }

      const fileUrl = `/uploads/voice/${req.file.filename}`;
      
      logger.logAPI('info', 'Voice message uploaded', {
        userId: req.user?.id,
        filename: req.file.filename,
        size: req.file.size
      });

      res.json({
        success: true,
        message: 'پیام صوتی با موفقیت آپلود شد',
        data: {
          url: fileUrl,
          filename: req.file.filename,
          size: req.file.size,
          duration: req.body.duration || null
        }
      });
    } catch (error) {
      logger.logAPI('error', 'Voice message upload failed', { error, userId: req.user?.id });
      res.status(500).json({
        success: false,
        message: 'خطا در آپلود پیام صوتی',
        code: 'UPLOAD_ERROR'
      });
    }
  }
);

router.post('/upload/consultation-files',
  uploadConsultationFiles,
  (req: Request, res: Response) => {
    try {
      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        return res.status(400).json({
          success: false,
          message: 'فایل‌هایی ارائه نشده است',
          code: 'NO_FILES_PROVIDED'
        });
      }

      const files = Array.isArray(req.files) ? req.files : [req.files];
      const uploadedFiles = files.map(file => ({
        url: `/uploads/consultations/${file.filename}`,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      }));
      
      logger.logAPI('info', 'Consultation files uploaded', {
        userId: req.user?.id,
        fileCount: uploadedFiles.length,
        totalSize: uploadedFiles.reduce((sum, file) => sum + file.size, 0)
      });

      res.json({
        success: true,
        message: 'فایل‌های مشاوره با موفقیت آپلود شدند',
        data: {
          files: uploadedFiles,
          count: uploadedFiles.length
        }
      });
    } catch (error) {
      logger.logAPI('error', 'Consultation files upload failed', { error, userId: req.user?.id });
      res.status(500).json({
        success: false,
        message: 'خطا در آپلود فایل‌های مشاوره',
        code: 'UPLOAD_ERROR'
      });
    }
  }
);

// File download/serve endpoints
router.get('/download/:type/:filename', (req: Request, res: Response) => {
  try {
    const { type, filename } = req.params;
    const allowedTypes = ['profiles', 'pets', 'voice', 'consultations'];
    
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'نوع فایل نامعتبر است',
        code: 'INVALID_FILE_TYPE'
      });
    }

    const filePath = path.join(process.cwd(), 'uploads', type, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'فایل یافت نشد',
        code: 'FILE_NOT_FOUND'
      });
    }

    logger.logAPI('info', 'File downloaded', {
      userId: req.user?.id,
      type,
      filename
    });

    res.sendFile(filePath);
  } catch (error) {
    logger.logAPI('error', 'File download failed', { error, userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'خطا در دانلود فایل',
      code: 'DOWNLOAD_ERROR'
    });
  }
});

// File deletion endpoint (admin only)
router.delete('/:type/:filename', (req: Request, res: Response) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'دسترسی غیرمجاز',
        code: 'UNAUTHORIZED'
      });
    }

    const { type, filename } = req.params;
    const allowedTypes = ['profiles', 'pets', 'voice', 'consultations'];
    
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'نوع فایل نامعتبر است',
        code: 'INVALID_FILE_TYPE'
      });
    }

    const filePath = path.join(process.cwd(), 'uploads', type, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'فایل یافت نشد',
        code: 'FILE_NOT_FOUND'
      });
    }

    fs.unlinkSync(filePath);
    
    logger.logAPI('info', 'File deleted', {
      userId: req.user?.id,
      type,
      filename
    });

    res.json({
      success: true,
      message: 'فایل با موفقیت حذف شد'
    });
  } catch (error) {
    logger.logAPI('error', 'File deletion failed', { error, userId: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'خطا در حذف فایل',
      code: 'DELETE_ERROR'
    });
  }
});

export default router;