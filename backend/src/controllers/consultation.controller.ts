import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';
import archiver from 'archiver';
import { saveMediaFile, determineCategory, determineMediaType } from '../services/media.service';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    fullName: string;
    mobile: string;
    role: string;
  };
}

// Create new consultation with file uploads
export const createConsultation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { consultationType, description } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: { message: 'User not authenticated' } });
    }

    if (!consultationType || !description) {
      return res.status(400).json({ 
        error: { message: 'Consultation type and description are required' } 
      });
    }

    // Get uploaded files
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const medicalDocuments = files?.medicalDocuments || [];
    const videos = files?.videos || [];
    const audioFiles = files?.audioFiles || [];

    // Get user's first pet (or create a default one if none exists)
    let userPet = await prisma.pet.findFirst({
      where: { ownerId: userId }
    });

    if (!userPet) {
      // Create a default pet if user doesn't have one
      userPet = await prisma.pet.create({
        data: {
          name: 'Default Pet',
          petType: 'other',
          breed: 'Unknown',
          age: 1,
          gender: 'Unknown',
          ownerId: userId
        }
      });
    }

    // Create consultation record
    const consultation = await prisma.consultation.create({
      data: {
        userId,
        petId: userPet.id,
        consultationType,
        description,
        status: 'PENDING'
      }
    });

    // Save media files to database
    const allFiles = [...medicalDocuments, ...videos, ...audioFiles];
    const mediaPromises = allFiles.map(async (file) => {
      const mediaFile = {
        fileName: file.filename,
        originalName: file.originalname,
        filePath: file.path,
        mimeType: file.mimetype,
        fileSize: file.size,
        mediaType: determineMediaType(file.mimetype),
        category: determineCategory(file.mimetype)
      };
      return saveMediaFile(mediaFile, consultation.id, userId);
    });

    await Promise.all(mediaPromises);

    logger.info('Consultation created successfully', { 
      consultationId: consultation.id, 
      userId,
      filesCount: allFiles.length 
    });

    res.status(201).json({
      message: 'Consultation created successfully',
      consultation: {
        id: consultation.id,
        consultationType: consultation.consultationType,
        description: consultation.description,
        status: consultation.status,
        createdAt: consultation.createdAt,
        filesUploaded: allFiles.length
      }
    });

  } catch (error: any) {
    logger.error('Failed to create consultation', { 
      error: error.message, 
      userId: req.user?.id 
    });
    res.status(500).json({ error: { message: error.message } });
  }
};

// Get detailed user submissions with all media files
export const getUserSubmissions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { includeMedia = 'true' } = req.query;

    const parsedUserId = parseInt(userId);
    if (isNaN(parsedUserId)) {
      return res.status(400).json({ error: { message: 'Invalid user ID' } });
    }

    const user = await prisma.user.findUnique({
      where: { id: parsedUserId },
      include: {
        pets: true,
        consultations: {
          include: {
            pet: true,
            payment: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        payments: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }

    // Parse media files from consultation data
    const consultationsWithMedia = user.consultations.map(consultation => {
      const medicalDocuments = consultation.medicalDocuments 
        ? consultation.medicalDocuments.split(',').filter(doc => doc.trim()) 
        : [];
      const videos = consultation.videos 
        ? consultation.videos.split(',').filter(video => video.trim()) 
        : [];
      const audioFiles = consultation.audioFiles 
        ? consultation.audioFiles.split(',').filter(audio => audio.trim()) 
        : [];

      return {
        ...consultation,
        medicalDocuments,
        videos,
        audioFiles,
        mediaCount: medicalDocuments.length + videos.length + audioFiles.length
      };
    });

    const userSubmissions = {
      user: {
        id: user.id,
        fullName: user.fullName,
        mobile: user.mobile,
        createdAt: user.createdAt
      },
      pets: user.pets,
      consultations: consultationsWithMedia,
      payments: user.payments,
      totalSubmissions: consultationsWithMedia.length,
      totalMediaFiles: consultationsWithMedia.reduce((total, consultation) => 
        total + consultation.mediaCount, 0
      )
    };

    res.json(userSubmissions);
  } catch (error: any) {
    logger.error('Failed to get user submissions', { error: error.message, userId: req.params.userId });
    res.status(500).json({ error: { message: error.message } });
  }
};

// Get all consultations with detailed media information
export const getAllConsultationsDetailed = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 50, status, userId } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const whereClause: any = {};
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    if (userId) {
      whereClause.userId = parseInt(userId as string);
    }

    const [consultations, total] = await Promise.all([
      prisma.consultation.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              mobile: true
            }
          },
          pet: {
            select: {
              id: true,
              name: true,
              petType: true,
              breed: true,
              age: true,
              gender: true
            }
          },
          payment: {
            select: {
              id: true,
              amount: true,
              status: true,
              paymentReceipt: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.consultation.count({ where: whereClause })
    ]);

    // Parse media files for each consultation
    const consultationsWithMedia = consultations.map(consultation => {
      const medicalDocuments = consultation.medicalDocuments 
        ? consultation.medicalDocuments.split(',').filter(doc => doc.trim()) 
        : [];
      const videos = consultation.videos 
        ? consultation.videos.split(',').filter(video => video.trim()) 
        : [];
      const audioFiles = consultation.audioFiles 
        ? consultation.audioFiles.split(',').filter(audio => audio.trim()) 
        : [];

      return {
        ...consultation,
        medicalDocuments,
        videos,
        audioFiles,
        mediaCount: medicalDocuments.length + videos.length + audioFiles.length
      };
    });

    res.json({
      data: consultationsWithMedia,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error: any) {
    logger.error('Failed to get detailed consultations', { error: error.message });
    res.status(500).json({ error: { message: error.message } });
  }
};

// Download user's complete records as ZIP
export const downloadUserRecords = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { format = 'json' } = req.query;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        pets: true,
        consultations: {
          include: {
            pet: true,
            payment: true
          }
        },
        payments: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }

    // Create a temporary directory for the user's files
    const tempDir = path.join(__dirname, '../../temp', `user_${userId}_${Date.now()}`);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Prepare user data
    const userData = {
      user: {
        id: user.id,
        fullName: user.fullName,
        mobile: user.mobile,
        createdAt: user.createdAt
      },
      pets: user.pets,
      consultations: user.consultations.map(consultation => ({
        ...consultation,
        medicalDocuments: consultation.medicalDocuments 
          ? consultation.medicalDocuments.split(',').filter(doc => doc.trim()) 
          : [],
        videos: consultation.videos 
          ? consultation.videos.split(',').filter(video => video.trim()) 
          : [],
        audioFiles: consultation.audioFiles 
          ? consultation.audioFiles.split(',').filter(audio => audio.trim()) 
          : []
      })),
      payments: user.payments,
      exportDate: new Date().toISOString(),
      exportedBy: req.user?.fullName || 'Admin'
    };

    // Save user data as JSON
    const userDataPath = path.join(tempDir, 'user_data.json');
    fs.writeFileSync(userDataPath, JSON.stringify(userData, null, 2));

    // Create CSV format if requested
    if (format === 'csv') {
      const csvData = generateCSV(userData);
      const csvPath = path.join(tempDir, 'user_data.csv');
      fs.writeFileSync(csvPath, csvData);
    }

    // Set response headers for ZIP download
    const zipFileName = `user_${user.mobile}_records_${Date.now()}.zip`;
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);

    // Create ZIP archive
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    archive.on('error', (err) => {
      logger.error('Archive error', { error: err.message });
      res.status(500).json({ error: { message: 'Failed to create archive' } });
    });

    archive.pipe(res);

    // Add files to archive
    archive.directory(tempDir, false);
    
    await archive.finalize();

    // Clean up temporary directory
    setTimeout(() => {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }, 5000);

    logger.info('User records downloaded', { userId, adminId: req.user?.id });

  } catch (error: any) {
    logger.error('Failed to download user records', { error: error.message, userId: req.params.userId });
    res.status(500).json({ error: { message: error.message } });
  }
};

// Generate CSV format for user data
const generateCSV = (userData: any): string => {
  const headers = [
    'Type', 'ID', 'Date', 'Description', 'Status', 'Pet Name', 'Pet Type', 
    'Amount', 'Media Files Count', 'Details'
  ];
  
  let csvContent = headers.join(',') + '\n';

  // Add consultations
  userData.consultations.forEach((consultation: any) => {
    const mediaCount = (consultation.medicalDocuments?.length || 0) + 
                      (consultation.videos?.length || 0) + 
                      (consultation.audioFiles?.length || 0);
    
    const row = [
      'Consultation',
      consultation.id,
      new Date(consultation.createdAt).toLocaleDateString(),
      `"${consultation.description.replace(/"/g, '""')}"`,
      consultation.status,
      consultation.pet?.name || '',
      consultation.pet?.petType || '',
      consultation.payment?.amount || '',
      mediaCount,
      `"${consultation.consultationType}"`
    ];
    csvContent += row.join(',') + '\n';
  });

  // Add payments
  userData.payments.forEach((payment: any) => {
    const row = [
      'Payment',
      payment.id,
      new Date(payment.createdAt).toLocaleDateString(),
      `"${payment.description || 'Payment'}"`,
      payment.status,
      '',
      '',
      payment.amount,
      payment.paymentReceipt ? 1 : 0,
      `"${payment.paymentMethod}"`
    ];
    csvContent += row.join(',') + '\n';
  });

  return csvContent;
};

// Get media file by path (for serving files)
export const getMediaFile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { filePath } = req.params;
    const decodedPath = decodeURIComponent(filePath);
    
    // Security check - ensure file is in uploads directory
    const uploadsDir = path.join(__dirname, '../../uploads');
    const fullPath = path.join(uploadsDir, decodedPath);
    
    if (!fullPath.startsWith(uploadsDir)) {
      return res.status(403).json({ error: { message: 'Access denied' } });
    }

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: { message: 'File not found' } });
    }

    res.sendFile(fullPath);
  } catch (error: any) {
    logger.error('Failed to serve media file', { error: error.message, filePath: req.params.filePath });
    res.status(500).json({ error: { message: error.message } });
  }
};