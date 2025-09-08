import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findFirst({
      where: {
        email: '09302467932'
      }
    });

    if (existingAdmin) {
      console.log('Admin already exists!');
      console.log('Mobile: 09302467932');
      console.log('Password: 12345678');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('12345678', 12);

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        email: '09302467932',
        password: hashedPassword,
        firstName: 'مدیر',
        lastName: 'سیستم',
        role: 'ADMIN',
        isActive: true
      }
    });

    console.log('Admin created successfully!');
    console.log('Admin ID:', admin.id);
    console.log('Mobile: 09302467932');
    console.log('Password: 12345678');
    
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();