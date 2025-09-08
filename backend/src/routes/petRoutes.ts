import { Router } from 'express';
import {
  createPet,
  getPet,
  updatePet,
  deletePet,
  getPets,
  getUserPets,
  getPetStats
} from '../controllers/petController';
import {
  createPetValidator,
  getPetValidator,
  updatePetValidator,
  deletePetValidator,
  getPetsValidator,
  getUserPetsValidator,
  getPetStatsValidator
} from '../validators/petValidators';
import {
  authenticateToken,
  requireAdmin,
  validateRequest,
  uploadPetImage
} from '../middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Pet management routes
router.post('/',
  createPetValidator,
  validateRequest,
  createPet
);

router.get('/',
  getPetsValidator,
  validateRequest,
  getPets
);

router.get('/stats',
  requireAdmin,
  getPetStatsValidator,
  validateRequest,
  getPetStats
);

router.get('/user/:userId',
  getUserPetsValidator,
  validateRequest,
  getUserPets
);

router.get('/:id',
  getPetValidator,
  validateRequest,
  getPet
);

router.put('/:id',
  updatePetValidator,
  validateRequest,
  updatePet
);

router.delete('/:id',
  deletePetValidator,
  validateRequest,
  deletePet
);

// Pet image upload
router.post('/:id/image',
  uploadPetImage,
  (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'فایل تصویر ارائه نشده است',
        code: 'NO_FILE_PROVIDED'
      });
    }
    next();
  },
  updatePet
);

export default router;