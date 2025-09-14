const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: 'ADMIN'
      }
    });

    if (existingAdmin) {
      console.log('Admin user already exists:');
      console.log('Mobile:', existingAdmin.mobile);
      console.log('Name:', existingAdmin.fullName);
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.create({
      data: {
        fullName: 'مدیر سیستم',
        mobile: '09123456789',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    console.log('Admin user created successfully!');
    console.log('Mobile: 09123456789');
    console.log('Password: admin123');
    console.log('Name:', admin.fullName);
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();