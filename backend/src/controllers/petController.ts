import { Request, Response } from 'express';
import { petService } from '../services/petService';
import { 
  AuthenticatedRequest,
  CreatePetRequest,
  UpdatePetRequest,
  GetPetsQuery,
  ValidationError,
  NotFoundError,
  AuthorizationError
} from '../types';
import { logger } from '../utils/logger';
import { validationResult } from 'express-validator';

class PetController {
  async createPet(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'اطلاعات وارد شده معتبر نیست',
          errors: errors.array()
        });
        return;
      }

      const userId = req.user!.id;
      const petData: CreatePetRequest = {
        ...req.body,
        ownerId: userId
      };
      
      const pet = await petService.createPet(petData, userId);

      res.status(201).json({
        success: true,
        message: 'حیوان خانگی با موفقیت ثبت شد',
        data: { pet }
      });
    } catch (error) {
      logger.error('Create pet controller error:', error);
      
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'خطا در ثبت حیوان خانگی'
        });
      }
    }
  }

  async getPetById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const petId = req.params.id;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      
      const pet = await petService.getPetById(petId, userId, userRole);

      res.status(200).json({
        success: true,
        data: { pet }
      });
    } catch (error) {
      logger.error('Get pet by id controller error:', error);
      
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else if (error instanceof AuthorizationError) {
        res.status(403).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'خطا در دریافت اطلاعات حیوان خانگی'
        });
      }
    }
  }

  async updatePet(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'اطلاعات وارد شده معتبر نیست',
          errors: errors.array()
        });
        return;
      }

      const petId = req.params.id;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const updateData: UpdatePetRequest = req.body;
      
      const updatedPet = await petService.updatePet(petId, updateData, userId, userRole);

      res.status(200).json({
        success: true,
        message: 'اطلاعات حیوان خانگی با موفقیت به‌روزرسانی شد',
        data: { pet: updatedPet }
      });
    } catch (error) {
      logger.error('Update pet controller error:', error);
      
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else if (error instanceof AuthorizationError) {
        res.status(403).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'خطا در به‌روزرسانی اطلاعات حیوان خانگی'
        });
      }
    }
  }

  async deletePet(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const petId = req.params.id;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      
      await petService.deletePet(petId, userId, userRole);

      res.status(200).json({
        success: true,
        message: 'حیوان خانگی با موفقیت حذف شد'
      });
    } catch (error) {
      logger.error('Delete pet controller error:', error);
      
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else if (error instanceof AuthorizationError) {
        res.status(403).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'خطا در حذف حیوان خانگی'
        });
      }
    }
  }

  async getUserPets(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const query: GetPetsQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
        species: req.query.species as any,
        breed: req.query.breed as string,
        gender: req.query.gender as any,
        sortBy: req.query.sortBy as any || 'createdAt',
        sortOrder: req.query.sortOrder as any || 'desc'
      };
      
      const result = await petService.getUserPets(userId, query);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get user pets controller error:', error);
      
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت لیست حیوانات خانگی'
      });
    }
  }

  async getAllPets(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Check if user is admin
      if (req.user!.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          message: 'دسترسی غیرمجاز'
        });
        return;
      }

      const query: GetPetsQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
        species: req.query.species as any,
        breed: req.query.breed as string,
        gender: req.query.gender as any,
        ownerId: req.query.ownerId as string,
        sortBy: req.query.sortBy as any || 'createdAt',
        sortOrder: req.query.sortOrder as any || 'desc'
      };
      
      const result = await petService.getAllPets(query);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get all pets controller error:', error);
      
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت لیست همه حیوانات خانگی'
      });
    }
  }

  async getPetStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Check if user is admin
      if (req.user!.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          message: 'دسترسی غیرمجاز'
        });
        return;
      }

      const stats = await petService.getPetStats();

      res.status(200).json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      logger.error('Get pet stats controller error:', error);
      
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت آمار حیوانات خانگی'
      });
    }
  }

  async getUserPetStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const stats = await petService.getUserPetStats(userId);

      res.status(200).json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      logger.error('Get user pet stats controller error:', error);
      
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت آمار حیوانات خانگی کاربر'
      });
    }
  }

  async getPetsBySpecies(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const species = req.params.species as any;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      
      const query: GetPetsQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
        breed: req.query.breed as string,
        gender: req.query.gender as any,
        sortBy: req.query.sortBy as any || 'createdAt',
        sortOrder: req.query.sortOrder as any || 'desc'
      };
      
      let result;
      if (userRole === 'ADMIN') {
        result = await petService.getAllPets({ ...query, species });
      } else {
        result = await petService.getUserPets(userId, { ...query, species });
      }

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Get pets by species controller error:', error);
      
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت لیست حیوانات بر اساس نوع'
      });
    }
  }
}

export const petController = new PetController();

// Export individual functions for route imports
export const createPet = petController.createPet.bind(petController);
export const getPet = petController.getPetById.bind(petController); // Alias for getPetById
export const getPetById = petController.getPetById.bind(petController);
export const updatePet = petController.updatePet.bind(petController);
export const deletePet = petController.deletePet.bind(petController);
export const getPets = petController.getAllPets.bind(petController);
export const getUserPets = petController.getUserPets.bind(petController);
export const getPetStats = petController.getPetStats.bind(petController);

export default petController;