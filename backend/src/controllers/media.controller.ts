import { Request, Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import {
  getAllMedia,
  getMediaById,
  getMediaByUserId,
  getMediaByConsultationId,
  deleteMediaFile,
  getMediaStats,
} from '../services/media.service';
import { logger } from '../utils/logger';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    fullName: string;
    mobile: string;
    role: string;
  };
}

// Get all media files (Admin only)
export const getAllMediaFiles = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { mediaType, category, userId, page, limit } = req.query;

    const filters = {
      mediaType: mediaType as string,
      category: category as string,
      userId: userId ? parseInt(userId as string) : undefined,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 50,
    };

    const result = await getAllMedia(filters);

    res.json({
      message: 'Media files retrieved successfully',
      ...result,
    });
  } catch (error: any) {
    logger.error('Failed to get all media files', { error: error.message });
    res.status(500).json({ error: { message: error.message } });
  }
};

// Get media file by ID
export const getMediaFileById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const mediaId = parseInt(id);

    if (isNaN(mediaId)) {
      return res.status(400).json({ error: { message: 'Invalid media ID' } });
    }

    const media = await getMediaById(mediaId);

    if (!media) {
      return res.status(404).json({ error: { message: 'Media file not found' } });
    }

    // Check if user has permission to access this media
    if (req.user?.role !== 'ADMIN' && req.user?.id !== media.userId) {
      return res.status(403).json({ error: { message: 'Access denied' } });
    }

    res.json({
      message: 'Media file retrieved successfully',
      media,
    });
  } catch (error: any) {
    logger.error('Failed to get media file by ID', { error: error.message, mediaId: req.params.id });
    res.status(500).json({ error: { message: error.message } });
  }
};

// Get media files by user ID
export const getMediaFilesByUserId = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const targetUserId = parseInt(userId);

    if (isNaN(targetUserId)) {
      return res.status(400).json({ error: { message: 'Invalid user ID' } });
    }

    // Check if user has permission to access this data
    if (req.user?.role !== 'ADMIN' && req.user?.id !== targetUserId) {
      return res.status(403).json({ error: { message: 'Access denied' } });
    }

    const media = await getMediaByUserId(targetUserId);

    res.json({
      message: 'User media files retrieved successfully',
      media,
    });
  } catch (error: any) {
    logger.error('Failed to get media files by user ID', { error: error.message, userId: req.params.userId });
    res.status(500).json({ error: { message: error.message } });
  }
};

// Get media files by consultation ID
export const getMediaFilesByConsultationId = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { consultationId } = req.params;
    const targetConsultationId = parseInt(consultationId);

    if (isNaN(targetConsultationId)) {
      return res.status(400).json({ error: { message: 'Invalid consultation ID' } });
    }

    const media = await getMediaByConsultationId(targetConsultationId);

    res.json({
      message: 'Consultation media files retrieved successfully',
      media,
    });
  } catch (error: any) {
    logger.error('Failed to get media files by consultation ID', { 
      error: error.message, 
      consultationId: req.params.consultationId 
    });
    res.status(500).json({ error: { message: error.message } });
  }
};

// Serve media file (with access control)
export const serveMediaFile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const mediaId = parseInt(id);

    if (isNaN(mediaId)) {
      return res.status(400).json({ error: { message: 'Invalid media ID' } });
    }

    const media = await getMediaById(mediaId);

    if (!media) {
      return res.status(404).json({ error: { message: 'Media file not found' } });
    }

    // Check if user has permission to access this media
    if (req.user?.role !== 'ADMIN' && req.user?.id !== media.userId) {
      return res.status(403).json({ error: { message: 'Access denied' } });
    }

    // Check if file exists
    if (!fs.existsSync(media.filePath)) {
      logger.error('Physical file not found', { filePath: media.filePath, mediaId });
      return res.status(404).json({ error: { message: 'Physical file not found' } });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', media.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${media.originalName}"`);
    res.setHeader('Content-Length', media.fileSize.toString());

    // Stream the file
    const fileStream = fs.createReadStream(media.filePath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      logger.error('Error streaming file', { error, mediaId, filePath: media.filePath });
      if (!res.headersSent) {
        res.status(500).json({ error: { message: 'Error serving file' } });
      }
    });

  } catch (error: any) {
    logger.error('Failed to serve media file', { error: error.message, mediaId: req.params.id });
    if (!res.headersSent) {
      res.status(500).json({ error: { message: error.message } });
    }
  }
};

// Delete media file (Admin only)
export const deleteMediaFileById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const mediaId = parseInt(id);

    if (isNaN(mediaId)) {
      return res.status(400).json({ error: { message: 'Invalid media ID' } });
    }

    // Only admins can delete media files
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: { message: 'Admin access required' } });
    }

    await deleteMediaFile(mediaId);

    res.json({
      message: 'Media file deleted successfully',
    });
  } catch (error: any) {
    logger.error('Failed to delete media file', { error: error.message, mediaId: req.params.id });
    res.status(500).json({ error: { message: error.message } });
  }
};

// Get media statistics (Admin only)
export const getMediaStatistics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Only admins can view media statistics
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: { message: 'Admin access required' } });
    }

    const stats = await getMediaStats();

    res.json({
      message: 'Media statistics retrieved successfully',
      stats,
    });
  } catch (error: any) {
    logger.error('Failed to get media statistics', { error: error.message });
    res.status(500).json({ error: { message: error.message } });
  }
};