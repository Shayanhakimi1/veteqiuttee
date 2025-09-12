import { Request, Response } from 'express';
import { createUser } from '../services/user.service';

export const registerUser = async (req: Request, res: Response) => {
  console.log("Register user request received:", req.body);
  try {
    console.log("Attempting to create user...");
    const { user, pet } = await createUser(req.body);
    console.log("User created successfully:", { userId: user.id, petId: pet.id });
    res.status(201).json({ message: "User registered successfully", user, pet });
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