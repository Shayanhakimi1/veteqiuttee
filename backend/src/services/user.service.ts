import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger';
import { CreateUserRequest, UserResponse, PetResponse } from '../types';

const prisma = new PrismaClient();

export const createUser = async (userData: CreateUserRequest): Promise<{ user: UserResponse; pet: PetResponse }> => {
  try {
    const { fullName, mobile, password, petName, petBreed, petAge, petGender, petType } = userData;

    // Validate petAge is a valid number
    const parsedPetAge = parseInt(String(petAge), 10);
    if (isNaN(parsedPetAge) || parsedPetAge < 0) {
      throw new Error('Invalid pet age provided');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (prisma) => {
    const user = await prisma.user.create({
      data: {
        fullName,
        mobile,
        password: hashedPassword,
      },
    });

    const pet = await prisma.pet.create({
      data: {
        name: petName,
        breed: petBreed,
        age: parsedPetAge,
        gender: petGender,
        ownerId: user.id,
        petType: petType, // Use the provided petType
      },
    });

    return { user, pet };
  });

    return { 
      user: {
        id: result.user.id,
        fullName: result.user.fullName,
        mobile: result.user.mobile,
        createdAt: result.user.createdAt
      }, 
      pet: {
        id: result.pet.id,
        name: result.pet.name,
        breed: result.pet.breed,
        age: result.pet.age,
        gender: result.pet.gender as 'male' | 'female',
        type: result.pet.petType,
        userId: result.pet.ownerId
      }
    };
  } catch (error) {
    logger.error('Failed to create user', { error, userData: { ...userData, password: '[REDACTED]' } });
    throw error;
  }
};