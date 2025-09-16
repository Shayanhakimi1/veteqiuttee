import { Router } from 'express';
import {
  getAllMediaFiles,
  getMediaFileById,
  getMediaFilesByUserId,
  getMediaFilesByConsultationId,
  serveMediaFile,
  deleteMediaFileById,
  getMediaStatistics,
} from '../controllers/media.controller';
import { authenticateToken, requireAdmin, checkMediaAccess, rateLimitUploads } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all media files (Admin only)
router.get('/', requireAdmin, getAllMediaFiles);

// Get media statistics (Admin only)
router.get('/stats', requireAdmin, getMediaStatistics);

// Get media files by user ID (with access control)
router.get('/user/:userId', getMediaFilesByUserId);

// Get media files by consultation ID (with access control)
router.get('/consultation/:consultationId', getMediaFilesByConsultationId);

// Serve media file (with strict access control)
router.get('/serve/:id', checkMediaAccess, serveMediaFile);

// Get media file by ID (with access control)
router.get('/:id', getMediaFileById);

// Delete media file (Admin only)
router.delete('/:id', requireAdmin, deleteMediaFileById);

export default router;