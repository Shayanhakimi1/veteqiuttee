import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { 
  ensureUploadDirectory, 
  generateUniqueFileName, 
  determineMediaType, 
  determineCategory 
} from '../services/media.service';
import { logger } from '../utils/logger';

// Base upload directory
const UPLOAD_BASE_DIR = path.join(process.cwd(), 'uploads');

// Ensure base upload directory exists
ensureUploadDirectory(UPLOAD_BASE_DIR);

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create subdirectories based on media type
    const mediaType = determineMediaType(file.mimetype);
    const uploadPath = path.join(UPLOAD_BASE_DIR, mediaType);
    
    ensureUploadDirectory(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueFileName = generateUniqueFileName(file.originalname);
    cb(null, uniqueFileName);
  },
});

// File filter function
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Define allowed file types
  const allowedMimeTypes = [
    // Images
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    
    // Audio
    'audio/mpeg',
    'audio/wav',
    'audio/mp3',
    'audio/ogg',
    'audio/webm',
    'audio/mp4',
    
    // Video
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/webm',
    'video/ogg',
    'video/avi',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    logger.warn('File type not allowed', { 
      filename: file.originalname, 
      mimetype: file.mimetype 
    });
    cb(new Error(`File type ${file.mimetype} is not allowed`));
  }
};

// Configure multer with limits
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
    files: 10, // Maximum 10 files per request
  },
});

// Middleware for handling consultation file uploads
export const uploadConsultationFiles = upload.fields([
  { name: 'medicalDocuments', maxCount: 5 },
  { name: 'videos', maxCount: 2 },
  { name: 'audioFiles', maxCount: 5 },
]);

// Middleware for handling single file upload
export const uploadSingleFile = upload.single('file');

// Middleware for handling multiple files of same type
export const uploadMultipleFiles = upload.array('files', 10);

// Error handling middleware for multer
export const handleUploadError = (error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    logger.error('Multer upload error', { error: error.message, code: error.code });
    
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({ 
          error: { message: 'فایل بیش از حد مجاز بزرگ است. حداکثر اندازه مجاز 50MB می‌باشد.' } 
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({ 
          error: { message: 'تعداد فایل‌ها بیش از حد مجاز است.' } 
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({ 
          error: { message: 'فیلد فایل غیرمنتظره دریافت شد.' } 
        });
      default:
        return res.status(400).json({ 
          error: { message: 'خطا در آپلود فایل.' } 
        });
    }
  }
  
  if (error.message.includes('File type')) {
    return res.status(400).json({ 
      error: { message: 'نوع فایل پشتیبانی نمی‌شود.' } 
    });
  }
  
  logger.error('Upload error', { error: error.message });
  return res.status(500).json({ 
    error: { message: 'خطای داخلی سرور در آپلود فایل.' } 
  });
};

// Helper function to clean up uploaded files on error
export const cleanupUploadedFiles = (files: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] }) => {
  try {
    let filesToDelete: Express.Multer.File[] = [];
    
    if (Array.isArray(files)) {
      filesToDelete = files;
    } else if (files && typeof files === 'object') {
      filesToDelete = Object.values(files).flat();
    }
    
    filesToDelete.forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
        logger.info('Cleaned up uploaded file', { path: file.path });
      }
    });
  } catch (error) {
    logger.error('Error cleaning up uploaded files', { error });
  }
};