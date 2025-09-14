import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { createUser } from '../services/user.service';

const prisma = new PrismaClient();

export const registerUser = async (req: Request, res: Response) => {
  console.log("Register user request received:", req.body);
  try {
    console.log("Attempting to create user...");
    const { user, pet } = await createUser(req.body);
    console.log("User created successfully:", { userId: user.id, petId: pet.id });
    
    // تولید JWT token
    const token = jwt.sign(
      { userId: user.id, mobile: user.mobile },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({ 
      message: "User registered successfully", 
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        mobile: user.mobile
      }, 
      pet 
    });
  } catch (error: any) {
    console.error("Error during user registration:", error);
    console.error("Error code:", error.code);
    console.error("Error meta:", error.meta);
    
    // بررسی نوع خطا برای ارائه پیام مناسب
    if (error.code === 'P2002') {
      console.log("Duplicate constraint error detected");
      if (error.meta?.target?.includes('mobile') || error.meta?.target?.includes('User')) {
        return res.status(409).json({ 
          message: "کاربری با این شماره موبایل قبلاً ثبت‌نام کرده است. لطفاً وارد شوید یا از شماره دیگری استفاده کنید." 
        });
      }
    }
    
    res.status(500).json({ message: "User registration failed", error: error.message });
  }
};

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { mobile, password } = req.body;
    
    // Find admin user
    const admin = await prisma.user.findFirst({
      where: {
        mobile: mobile,
        role: 'ADMIN'
      }
    });
    
    if (!admin) {
      return res.status(401).json({ 
        message: 'اطلاعات ورود صحیح نمی‌باشد یا شما دسترسی مدیریت ندارید.' 
      });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        message: 'اطلاعات ورود صحیح نمی‌باشد.' 
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin.id, 
        mobile: admin.mobile, 
        role: admin.role,
        fullName: admin.fullName
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'ورود موفقیت‌آمیز بود',
      token,
      admin: {
        id: admin.id,
        fullName: admin.fullName,
        mobile: admin.mobile,
        role: admin.role,
        isAdmin: true
      }
    });
  } catch (error: any) {
     console.error('Admin login error:', error);
     res.status(500).json({ message: 'خطا در ورود مدیر', error: error.message });
   }
 };