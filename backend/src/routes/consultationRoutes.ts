import { Router } from 'express';
import {
  createConsultation,
  getConsultation,
  updateConsultation,
  deleteConsultation,
  getConsultations,
  getUserConsultations,
  getPetConsultations,
  updateConsultationStatus,
  uploadVoiceMedia,
  getConsultationStats
} from '../controllers/consultationController';
import {
  createConsultationValidator,
  getConsultationValidator,
  updateConsultationValidator,
  deleteConsultationValidator,
  getConsultationsValidator,
  getUserConsultationsValidator,
  getPetConsultationsValidator,
  updateConsultationStatusValidator,
  uploadVoiceMediaValidator,
  getConsultationStatsValidator
} from '../validators/consultationValidators';
import {
  authenticateToken,
  requireAdmin,
  requireVeterinarianOrAdmin,
  validateRequest,
  uploadVoiceMessage
} from '../middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Consultation management routes
router.post('/',
  createConsultationValidator,
  validateRequest,
  createConsultation
);

router.get('/',
  getConsultationsValidator,
  validateRequest,
  getConsultations
);

router.get('/stats',
  requireAdmin,
  getConsultationStatsValidator,
  validateRequest,
  getConsultationStats
);

router.get('/user/:userId',
  getUserConsultationsValidator,
  validateRequest,
  getUserConsultations
);

router.get('/pet/:petId',
  getPetConsultationsValidator,
  validateRequest,
  getPetConsultations
);

router.get('/:id',
  getConsultationValidator,
  validateRequest,
  getConsultation
);

router.put('/:id',
  updateConsultationValidator,
  validateRequest,
  updateConsultation
);

router.delete('/:id',
  requireAdmin,
  deleteConsultationValidator,
  validateRequest,
  deleteConsultation
);

// Status update (veterinarian or admin only)
router.put('/:id/status',
  requireVeterinarianOrAdmin,
  updateConsultationStatusValidator,
  validateRequest,
  updateConsultationStatus
);

// Voice media upload
router.post('/:id/voice',
  uploadVoiceMessage,
  (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'فایل صوتی ارائه نشده است',
        code: 'NO_FILE_PROVIDED'
      });
    }
    next();
  },
  uploadVoiceMediaValidator,
  validateRequest,
  uploadVoiceMedia
);

export default router;