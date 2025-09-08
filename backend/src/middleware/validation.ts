import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from './errorHandler.js';
import { logger } from '../utils/logger.js';

// Validation middleware factory
export function validate(schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message.replace(/"/g, ''))
        .join(', ');
      
      logger.warn('Validation error', {
        property,
        errors: error.details,
        path: req.path,
        method: req.method
      });
      
      return next(new AppError(`Validation error: ${errorMessage}`, 400));
    }

    // Replace the original data with validated and sanitized data
    req[property] = value;
    next();
  };
}

// Common validation schemas
export const commonSchemas = {
  // ID validation
  id: Joi.string().required().messages({
    'string.empty': 'ID is required',
    'any.required': 'ID is required'
  }),

  // Email validation
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email is required',
    'any.required': 'Email is required'
  }),

  // Password validation
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
    'any.required': 'Password is required'
  }),

  // Phone validation (Iranian mobile format)
  phone: Joi.string().pattern(/^09[0-9]{9}$/).messages({
    'string.pattern.base': 'Please provide a valid mobile number (09xxxxxxxxx)'
  }),

  // Name validation
  name: Joi.string().min(2).max(50).pattern(/^[a-zA-Z\u0600-\u06FF\s]+$/).required().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name must not exceed 50 characters',
    'string.pattern.base': 'Name can only contain letters and spaces',
    'string.empty': 'Name is required',
    'any.required': 'Name is required'
  }),

  // Optional name validation
  optionalName: Joi.string().min(2).max(50).pattern(/^[a-zA-Z\u0600-\u06FF\s]+$/).messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name must not exceed 50 characters',
    'string.pattern.base': 'Name can only contain letters and spaces'
  }),

  // Pagination
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  
  // Search
  search: Joi.string().max(100).allow(''),
  
  // Sort
  sortBy: Joi.string().valid('createdAt', 'updatedAt', 'name', 'email').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
};

// User validation schemas
export const userSchemas = {
  register: Joi.object({
    mobile: commonSchemas.phone.required().messages({
      'string.empty': 'Mobile number is required',
      'any.required': 'Mobile number is required',
      'string.pattern.base': 'Please provide a valid mobile number'
    }),
    password: commonSchemas.password,
    firstName: commonSchemas.name,
    lastName: commonSchemas.name,
    petData: Joi.object({
      name: commonSchemas.name,
      species: Joi.string().valid('dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'reptile', 'other').required(),
      breed: Joi.string().max(50).optional(),
      age: Joi.number().integer().min(0).max(50).optional(),
      gender: Joi.string().valid('MALE', 'FEMALE', 'UNKNOWN').optional(),
      isNeutered: Joi.boolean().optional()
    }).optional()
  }),

  login: Joi.object({
    mobile: commonSchemas.phone.required().messages({
      'string.empty': 'Mobile number is required',
      'any.required': 'Mobile number is required',
      'string.pattern.base': 'Please provide a valid mobile number'
    }),
    password: Joi.string().required().messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required'
    })
  }),

  updateProfile: Joi.object({
    firstName: commonSchemas.optionalName.optional(),
    lastName: commonSchemas.optionalName.optional(),
    phone: commonSchemas.phone.optional()
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required().messages({
      'string.empty': 'Current password is required',
      'any.required': 'Current password is required'
    }),
    newPassword: commonSchemas.password
  }),

  forgotPassword: Joi.object({
    email: commonSchemas.email
  }),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    password: commonSchemas.password
  })
};

// Pet validation schemas
export const petSchemas = {
  create: Joi.object({
    name: commonSchemas.name,
    species: Joi.string().valid('dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'reptile', 'other').required(),
    breed: Joi.string().max(50).optional(),
    age: Joi.number().integer().min(0).max(50).optional(),
    gender: Joi.string().valid('MALE', 'FEMALE', 'UNKNOWN').optional(),
    isNeutered: Joi.boolean().optional()
  }),

  update: Joi.object({
    name: commonSchemas.optionalName.optional(),
    species: Joi.string().valid('dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'reptile', 'other').optional(),
    breed: Joi.string().max(50).optional(),
    age: Joi.number().integer().min(0).max(50).optional(),
    gender: Joi.string().valid('MALE', 'FEMALE', 'UNKNOWN').optional(),
    isNeutered: Joi.boolean().optional()
  })
};

// Consultation validation schemas
export const consultationSchemas = {
  create: Joi.object({
    petId: commonSchemas.id,
    title: Joi.string().min(5).max(100).required(),
    description: Joi.string().min(10).max(1000).required(),
    symptoms: Joi.string().max(500).optional(),
    urgencyLevel: Joi.string().valid('LOW', 'NORMAL', 'HIGH', 'EMERGENCY').default('NORMAL'),
    scheduledAt: Joi.date().iso().greater('now').optional()
  }),

  update: Joi.object({
    title: Joi.string().min(5).max(100).optional(),
    description: Joi.string().min(10).max(1000).optional(),
    symptoms: Joi.string().max(500).optional(),
    urgencyLevel: Joi.string().valid('LOW', 'NORMAL', 'HIGH', 'EMERGENCY').optional(),
    scheduledAt: Joi.date().iso().greater('now').optional(),
    status: Joi.string().valid('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED').optional()
  }),

  adminUpdate: Joi.object({
    status: Joi.string().valid('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED').optional(),
    veterinarianNotes: Joi.string().max(1000).optional(),
    diagnosis: Joi.string().max(500).optional(),
    treatment: Joi.string().max(1000).optional(),
    followUpDate: Joi.date().iso().greater('now').optional(),
    totalAmount: Joi.number().positive().optional()
  })
};

// Payment validation schemas
export const paymentSchemas = {
  create: Joi.object({
    consultationId: commonSchemas.id.optional(),
    amount: Joi.number().positive().required(),
    paymentMethod: Joi.string().valid('BANK_TRANSFER', 'CREDIT_CARD', 'CASH', 'ONLINE_GATEWAY').required(),
    description: Joi.string().max(200).optional()
  }),

  update: Joi.object({
    status: Joi.string().valid('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED').required(),
    transactionId: Joi.string().max(100).optional(),
    gatewayResponse: Joi.object().optional()
  })
};

// File validation schemas
export const fileSchemas = {
  upload: Joi.object({
    consultationId: commonSchemas.id.optional(),
    medicalRecordId: commonSchemas.id.optional(),
    description: Joi.string().max(200).optional(),
    fileType: Joi.string().valid('IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'MEDICAL_REPORT').required()
  })
};

// Query validation schemas
export const querySchemas = {
  pagination: Joi.object({
    page: commonSchemas.page,
    limit: commonSchemas.limit,
    search: commonSchemas.search,
    sortBy: commonSchemas.sortBy,
    sortOrder: commonSchemas.sortOrder
  }),

  consultationFilters: Joi.object({
    page: commonSchemas.page,
    limit: commonSchemas.limit,
    search: commonSchemas.search,
    status: Joi.string().valid('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RESCHEDULED').optional(),
    urgencyLevel: Joi.string().valid('LOW', 'NORMAL', 'HIGH', 'EMERGENCY').optional(),
    petId: commonSchemas.id.optional(),
    sortBy: Joi.string().valid('createdAt', 'updatedAt', 'scheduledAt', 'urgencyLevel').default('createdAt'),
    sortOrder: commonSchemas.sortOrder
  })
};

// Params validation schemas
export const paramSchemas = {
  id: Joi.object({
    id: commonSchemas.id
  })
};