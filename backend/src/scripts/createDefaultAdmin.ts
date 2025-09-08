import bcrypt from 'bcryptjs';
import { prisma } from '../utils/database.js';

async function createDefaultAdmin() {
  try {
    // Delete existing admin if exists
    await prisma.admin.deleteMany({
      where: {
        email: {
          in: ['09123456789', '09302467932']
        }
      }
    });

    console.log('Existing admins deleted');

    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('12345678', saltRounds);

    // Create default admin
    const admin = await prisma.admin.create({
      data: {
        email: '09302467932', // Using email field to store mobile
        firstName: 'مدیر',
        lastName: 'سیستم',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true
      }
    });

    console.log('Default admin created successfully:', {
      id: admin.id,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: admin.role
    });

  } catch (error) {
    console.error('Error creating default admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDefaultAdmin();