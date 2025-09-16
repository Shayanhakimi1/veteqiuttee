import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface MediaFile {
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  mediaType: 'audio' | 'video' | 'document' | 'image';
  category: 'medical_document' | 'audio_file' | 'video_file' | 'voice_recording';
}

export const saveMediaFile = async (
  file: MediaFile,
  consultationId: number,
  userId: number
) => {
  try {
    const media = await prisma.media.create({
      data: {
        fileName: file.fileName,
        originalName: file.originalName,
        filePath: file.filePath,
        fileSize: file.fileSize,
        mimeType: file.mimeType,
        mediaType: file.mediaType,
        category: file.category,
        consultationId,
        userId,
      },
    });

    logger.info('Media file saved to database', { mediaId: media.id, fileName: file.fileName });
    return media;
  } catch (error) {
    logger.error('Failed to save media file to database', { error, file });
    throw error;
  }
};

export const getMediaByConsultationId = async (consultationId: number) => {
  try {
    const media = await prisma.media.findMany({
      where: {
        consultationId,
        isActive: true,
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });

    return media;
  } catch (error) {
    logger.error('Failed to get media by consultation ID', { error, consultationId });
    throw error;
  }
};

export const getMediaByUserId = async (userId: number) => {
  try {
    const media = await prisma.media.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        consultation: {
          select: {
            id: true,
            consultationType: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });

    return media;
  } catch (error) {
    logger.error('Failed to get media by user ID', { error, userId });
    throw error;
  }
};

export const getAllMedia = async (filters?: {
  mediaType?: string;
  category?: string;
  userId?: number;
  page?: number;
  limit?: number;
}) => {
  try {
    const { mediaType, category, userId, page = 1, limit = 50 } = filters || {};
    const skip = (page - 1) * limit;

    const whereClause: any = {
      isActive: true,
    };

    if (mediaType) whereClause.mediaType = mediaType;
    if (category) whereClause.category = category;
    if (userId) whereClause.userId = userId;

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              mobile: true,
            },
          },
          consultation: {
            select: {
              id: true,
              consultationType: true,
              description: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          uploadedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.media.count({ where: whereClause }),
    ]);

    return {
      data: media,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Failed to get all media', { error, filters });
    throw error;
  }
};

export const getMediaById = async (mediaId: number) => {
  try {
    const media = await prisma.media.findUnique({
      where: {
        id: mediaId,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            mobile: true,
          },
        },
        consultation: {
          select: {
            id: true,
            consultationType: true,
            description: true,
            createdAt: true,
          },
        },
      },
    });

    return media;
  } catch (error) {
    logger.error('Failed to get media by ID', { error, mediaId });
    throw error;
  }
};

export const deleteMediaFile = async (mediaId: number) => {
  try {
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
    });

    if (!media) {
      throw new Error('Media file not found');
    }

    // Soft delete - mark as inactive
    await prisma.media.update({
      where: { id: mediaId },
      data: { isActive: false },
    });

    // Optionally delete the physical file
    try {
      if (fs.existsSync(media.filePath)) {
        fs.unlinkSync(media.filePath);
        logger.info('Physical file deleted', { filePath: media.filePath });
      }
    } catch (fileError) {
      logger.warn('Failed to delete physical file', { error: fileError, filePath: media.filePath });
    }

    logger.info('Media file deleted', { mediaId });
    return true;
  } catch (error) {
    logger.error('Failed to delete media file', { error, mediaId });
    throw error;
  }
};

export const getMediaStats = async () => {
  try {
    const [
      totalFiles,
      audioFiles,
      videoFiles,
      documentFiles,
      imageFiles,
      totalSize,
    ] = await Promise.all([
      prisma.media.count({ where: { isActive: true } }),
      prisma.media.count({ where: { mediaType: 'audio', isActive: true } }),
      prisma.media.count({ where: { mediaType: 'video', isActive: true } }),
      prisma.media.count({ where: { mediaType: 'document', isActive: true } }),
      prisma.media.count({ where: { mediaType: 'image', isActive: true } }),
      prisma.media.aggregate({
        where: { isActive: true },
        _sum: { fileSize: true },
      }),
    ]);

    return {
      totalFiles,
      filesByType: {
        audio: audioFiles,
        video: videoFiles,
        document: documentFiles,
        image: imageFiles,
      },
      totalSizeBytes: totalSize._sum.fileSize || 0,
    };
  } catch (error) {
    logger.error('Failed to get media stats', { error });
    throw error;
  }
};

export const ensureUploadDirectory = (uploadPath: string) => {
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
    logger.info('Upload directory created', { uploadPath });
  }
};

export const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension);
  
  return `${baseName}_${timestamp}_${random}${extension}`;
};

export const determineMediaType = (mimeType: string): MediaFile['mediaType'] => {
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('image/')) return 'image';
  return 'document';
};

export const determineCategory = (
  mimeType: string,
  isVoiceRecording: boolean = false
): MediaFile['category'] => {
  if (isVoiceRecording) return 'voice_recording';
  if (mimeType.startsWith('audio/')) return 'audio_file';
  if (mimeType.startsWith('video/')) return 'video_file';
  return 'medical_document';
};