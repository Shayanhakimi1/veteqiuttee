import { Router } from 'express';
import { 
  createConsultation,
  getUserSubmissions, 
  getAllConsultationsDetailed, 
  downloadUserRecords,
  getMediaFile 
} from '../controllers/consultation.controller';
import { authenticateToken } from '../middleware/auth';
import { uploadConsultationFiles } from '../middleware/upload';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Create new consultation with file uploads
router.post('/', uploadConsultationFiles, createConsultation);

// Get detailed user submissions with all media files
router.get('/user/:userId/submissions', getUserSubmissions);

// Get all consultations with detailed media information
router.get('/detailed', getAllConsultationsDetailed);

// Download user's complete records as ZIP
router.get('/user/:userId/download', downloadUserRecords);

// Serve media files
router.get('/media/:filePath(*)', getMediaFile);

export default router;