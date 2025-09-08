const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createDefaultAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findFirst({
      where: {
        email: '09302467932'
      }
    });

    if (existingAdmin) {
      console.log('Admin already exists!');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('12345678', 12);

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        email: '09302467932', // Using email field to store mobile
        password: hashedPassword,
        firstName: 'مدیر',
        lastName: 'سیستم',
        role: 'ADMIN',
        isActive: true
      }
    });

    console.log('Default admin created successfully:');
    console.log('Mobile:', '09302467932');
    console.log('Password:', '12345678');
    console.log('Admin ID:', admin.id);
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDefaultAdmin();