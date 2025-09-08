import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { prisma } from '../utils/database.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { validate, fileSchemas, querySchemas, paramSchemas } from '../middleware/validation.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Ensure upload directories exist
const ensureUploadDirs = async () => {
  const dirs = [
    'uploads',
    'uploads/images',
    'uploads/documents',
    'uploads/audio',
    'uploads/video',
    'uploads/thumbnails'
  ];

  for (const dir of dirs) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }
};

// Initialize upload directories
ensureUploadDirs().catch(console.error);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    let uploadPath = 'uploads/';
    
    if (file.mimetype.startsWith('image/')) {
      uploadPath += 'images/';
    } else if (file.mimetype.startsWith('audio/')) {
      uploadPath += 'audio/';
    } else if (file.mimetype.startsWith('video/')) {
      uploadPath += 'video/';
    } else {
      uploadPath += 'documents/';
    }
    
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = process.env['ALLOWED_FILE_TYPES']?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'video/mp4',
    'video/mpeg',
    'video/quicktime'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`File type ${file.mimetype} is not allowed`, 400));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env['MAX_FILE_SIZE'] || '10485760'), // 10MB default
    files: 10 // Maximum 10 files per request
  }
});

// Generate thumbnail for images
const generateThumbnail = async (imagePath: string, thumbnailPath: string) => {
  try {
    await sharp(imagePath)
      .resize(300, 300, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);
    return true;
  } catch (error) {
    logger.error('Failed to generate thumbnail', { error, imagePath });
    return false;
  }
};

// Upload files
router.post('/upload', 
  authenticateToken,
  upload.array('files', 10),
  validate(fileSchemas.upload),
  asyncHandler(async (_req, res) => {
    const { consultationId, description } = _req.body;
    const files = _req.files as Express.Multer.File[];
    const userId = _req.user!.id;

    if (!files || files.length === 0) {
      throw new AppError('No files uploaded', 400);
    }

    // Verify consultation exists and user has access
    if (consultationId) {
      const consultation = await prisma.consultation.findUnique({
        where: { id: consultationId }
      });

      if (!consultation) {
        throw new AppError('Consultation not found', 404);
      }

      if (_req.user!.role !== 'ADMIN' && consultation.userId !== userId) {
        throw new AppError('Access denied to this consultation', 403);
      }
    }

    const uploadedFiles = [];

    for (const file of files) {
      try {
        const fileUrl = `/uploads/${path.relative('uploads', file.path).replace(/\\/g, '/')}`;
        // Generate thumbnail for images
        if (file.mimetype.startsWith('image/')) {
          const thumbnailName = `thumb_${path.basename(file.filename, path.extname(file.filename))}.jpg`;
          const thumbnailPath = path.join('uploads/thumbnails', thumbnailName);
          
          await generateThumbnail(file.path, thumbnailPath);
        }

        // Save file record to database
        const fileData: any = {
          filename: file.filename,
          originalName: file.originalname,
          fileType: file.mimetype as any,
          size: file.size,
          path: fileUrl,
          description
        };

        if (consultationId) {
          fileData.consultationId = consultationId as string;
        }

        const fileRecord = await prisma.file.create({
          data: fileData
        });

        uploadedFiles.push(fileRecord);

        logger.info('File uploaded', {
          fileId: fileRecord.id,
          fileName: file.originalname,
          fileSize: file.size,
          uploadedBy: userId,
          consultationId
        });
      } catch (error) {
        logger.error('Failed to process uploaded file', {
          fileName: file.originalname,
          error
        });
        
        // Clean up the uploaded file if database save failed
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          logger.error('Failed to clean up file after error', { 
            filePath: file.path, 
            error: unlinkError 
          });
        }
      }
    }

    if (uploadedFiles.length === 0) {
      throw new AppError('Failed to upload any files', 500);
    }

    res.status(201).json({
      success: true,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      data: {
        files: uploadedFiles
      }
    });
  })
);

// Get files for consultation
router.get('/consultation/:consultationId', 
  authenticateToken,
  validate(paramSchemas.id, 'params'),
  validate(querySchemas.pagination, 'query'),
  asyncHandler(async (_req, res) => {
    const { consultationId } = _req.params;
    const { page = 1, limit = 20, fileType } = _req.query;
    const currentUser = _req.user!;
    
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Verify consultation exists and user has access
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId as string }
    });

    if (!consultation) {
      throw new AppError('Consultation not found', 404);
    }

    if (currentUser.role !== 'ADMIN' && consultation.userId !== currentUser.id) {
      throw new AppError('Access denied', 403);
    }

    // Build where clause
    const where: any = { consultationId };
    if (fileType) {
      where.fileType = { startsWith: fileType as string };
    }

    // Get files with pagination
    const [files, allFiles] = await Promise.all([
      prisma.file.findMany({
        where,
        include: {
          consultation: {
            select: {
              id: true,
              title: true,
              userId: true
            }
          }
        },
        skip,
        take,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.file.findMany({
        where,
        select: { id: true }
      })
    ]);

    const total = allFiles.length;

    const totalPages = Math.ceil(total / take);

    res.json({
      success: true,
      data: {
        files,
        pagination: {
          page: Number(page),
          limit: take,
          total,
          totalPages,
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1
        }
      }
    });
  })
);

// Get file by ID
router.get('/:id', 
  authenticateToken,
  validate(paramSchemas.id, 'params'),
  asyncHandler(async (_req, res) => {
    const { id } = _req.params;
    const currentUser = _req.user!;

    const file = await prisma.file.findUnique({
      where: { id: id as string },
      include: {
        consultation: {
          select: {
            id: true,
            title: true,
            userId: true
          }
        },
        medicalRecord: {
          select: {
            id: true,
            petId: true
          }
        }
      }
    });

    if (!file) {
      throw new AppError('File not found', 404);
    }

    // Check access permissions
    const hasAccess = currentUser.role === 'ADMIN' || 
                     (file.consultation && file.consultation.userId === currentUser.id);

    if (!hasAccess) {
      throw new AppError('Access denied', 403);
    }

    res.json({
      success: true,
      data: { file }
    });
  })
);

// Download file
router.get('/:id/download', 
  authenticateToken,
  validate(paramSchemas.id, 'params'),
  asyncHandler(async (_req, res) => {
    const { id } = _req.params;
    const currentUser = _req.user!;

    const file = await prisma.file.findUnique({
      where: { id: id as string },
      include: {
        consultation: {
          select: {
            userId: true
          }
        }
      }
    });

    if (!file) {
      throw new AppError('File not found', 404);
    }

    // Check access permissions
    const hasAccess = currentUser.role === 'ADMIN' || 
                     (file.consultation && file.consultation.userId === currentUser.id);

    if (!hasAccess) {
      throw new AppError('Access denied', 403);
    }

    const filePath = path.join(process.cwd(), file.path.substring(1)); // Remove leading slash

    try {
      await fs.access(filePath);
      
      res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
      res.setHeader('Content-Type', file.fileType);
      res.sendFile(path.resolve(filePath));

      logger.info('File downloaded', {
        fileId: id,
        fileName: file.originalName,
        downloadedBy: currentUser.id
      });
    } catch (error) {
      logger.error('File not found on disk', {
        fileId: id,
        filePath,
        error
      });
      throw new AppError('File not found on server', 404);
    }
  })
);

// Delete file
router.delete('/:id', 
  authenticateToken,
  validate(paramSchemas.id, 'params'),
  asyncHandler(async (_req, res) => {
    const { id } = _req.params;
    const currentUser = _req.user!;

    const file = await prisma.file.findUnique({
      where: { id: id as string },
      include: {
        consultation: {
          select: {
            userId: true,
            status: true
          }
        }
      }
    });

    if (!file) {
      throw new AppError('File not found', 404);
    }

    // Check permissions
    const canDelete = currentUser.role === 'ADMIN' || 
                     (file.consultation?.userId === currentUser.id && 
                      (!file.consultation || ['PENDING', 'DRAFT'].includes(file.consultation.status)));

    if (!canDelete) {
      throw new AppError('Cannot delete this file', 403);
    }

    // Delete file from database
    await prisma.file.delete({
      where: { id: id as string }
    });

    // Delete physical files
    const filePath = path.join(process.cwd(), file.path);
    const thumbnailPath = null; // No thumbnail support in current schema

    try {
      await fs.unlink(filePath);
      if (thumbnailPath) {
        await fs.unlink(thumbnailPath).catch(() => {}); // Ignore thumbnail deletion errors
      }
    } catch (error) {
      logger.error('Failed to delete physical file', {
        fileId: id,
        filePath,
        error
      });
    }

    logger.info('File deleted', {
      fileId: id,
      fileName: file.originalName,
      deletedBy: currentUser.id
    });

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  })
);

// Get file statistics (Admin only)
router.get('/stats/overview', 
  authenticateToken,
  requireRole(['ADMIN']),
  asyncHandler(async (_req, res) => {
    const [allFilesForTotal, totalSize, recentFilesData] = await Promise.all([
      prisma.file.findMany({
        select: { id: true }
      }),
      prisma.file.aggregate({
        _sum: {
          size: true
        }
      }),
      prisma.file.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        },
        select: { id: true }
      })
    ]);

    const totalFiles = allFilesForTotal.length;
    const recentFiles = recentFilesData.length;

    const allFiles = await prisma.file.findMany({
      select: {
        fileType: true,
        size: true
      }
    });

    const filesByType = allFiles.reduce((acc, file) => {
      if (!acc[file.fileType]) {
        acc[file.fileType] = { count: 0, totalSize: 0 };
      }
      acc[file.fileType]!.count += 1;
      acc[file.fileType]!.totalSize += file.size;
      return acc;
    }, {} as Record<string, { count: number; totalSize: number }>);

    res.json({
      success: true,
      data: {
        totalFiles,
        totalSize: totalSize._sum.size || 0,
        recentFiles,
        filesByType: Object.entries(filesByType).map(([type, data]) => ({
          type,
          count: data.count,
          totalSize: data.totalSize
        }))
      }
    });
  })
);

export default router;