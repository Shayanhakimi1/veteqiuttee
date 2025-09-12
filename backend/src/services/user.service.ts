import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const createUser = async (userData: any) => {
  const { fullName, mobile, password, petName, petBreed, petAge, petGender, petType } = userData;

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
        age: petAge,
        gender: petGender,
        ownerId: user.id,
        petType: petType, // Use the provided petType
      },
    });

    return { user, pet };
  });

  return result;
};