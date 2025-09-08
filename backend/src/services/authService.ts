import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { 
  AuthRequest, 
  AuthResponse, 
  CreateUserRequest, 
  JWTPayload, 
  UserRole,
  UserStatus,
  AuthenticationError,
  ConflictError,
  NotFoundError
} from '../types';
import { jwtConfig, securityConfig } from '../config';
import { smsService } from './smsService';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

class AuthService {
  async register(userData: CreateUserRequest): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { mobile: userData.mobile }
      });

      if (existingUser) {
        throw new ConflictError('کاربری با این شماره موبایل قبلاً ثبت‌نام کرده است');
      }

      // Hash password if provided
      let hashedPassword: string | undefined;
      if (userData.password) {
        hashedPassword = await bcrypt.hash(userData.password, securityConfig.bcryptSaltRounds);
      }

      // Create user
      const user = await prisma.user.create({
        data: {
          mobile: userData.mobile,
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: UserRole.USER,
          status: UserStatus.ACTIVE
        }
      });

      // Generate tokens
      const { accessToken, refreshToken } = await this.generateTokens({
        userId: user.id,
        mobile: user.mobile,
        role: user.role as UserRole
      });

      // Save refresh token
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      });

      logger.info(`User registered successfully: ${user.mobile}`);

      return {
        user: this.sanitizeUser(user),
        accessToken,
        refreshToken
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  async login(credentials: AuthRequest): Promise<AuthResponse> {
    try {
      const { mobile, password } = credentials;

      // Find user
      const user = await prisma.user.findUnique({
        where: { mobile }
      });

      if (!user) {
        throw new AuthenticationError('شماره موبایل یا رمز عبور اشتباه است');
      }

      if (user.status !== UserStatus.ACTIVE) {
        throw new AuthenticationError('حساب کاربری شما غیرفعال است');
      }

      // Verify password
      if (!password || !user.password) {
        throw new AuthenticationError('رمز عبور الزامی است');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new AuthenticationError('شماره موبایل یا رمز عبور اشتباه است');
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      // Generate tokens
      const { accessToken, refreshToken } = await this.generateTokens({
        userId: user.id,
        mobile: user.mobile,
        role: user.role as UserRole
      });

      // Save refresh token
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      });

      logger.info(`User logged in successfully: ${user.mobile}`);

      return {
        user: this.sanitizeUser(user),
        accessToken,
        refreshToken
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Verify refresh token
      const payload = jwt.verify(token, jwtConfig.refreshSecret) as JWTPayload;

      // Check if refresh token exists in database
      const storedToken = await prisma.refreshToken.findFirst({
        where: {
          token,
          userId: payload.userId,
          expiresAt: { gt: new Date() }
        },
        include: { user: true }
      });

      if (!storedToken) {
        throw new AuthenticationError('توکن نامعتبر است');
      }

      if (storedToken.user.status !== UserStatus.ACTIVE) {
        throw new AuthenticationError('حساب کاربری شما غیرفعال است');
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens({
        userId: storedToken.user.id,
        mobile: storedToken.user.mobile,
        role: storedToken.user.role as UserRole
      });

      // Delete old refresh token and save new one
      await prisma.refreshToken.delete({
        where: { id: storedToken.id }
      });

      await prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: storedToken.user.id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      });

      return {
        accessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      logger.error('Refresh token error:', error);
      throw new AuthenticationError('توکن نامعتبر است');
    }
  }

  async logout(token: string): Promise<void> {
    try {
      // Delete refresh token from database
      await prisma.refreshToken.deleteMany({
        where: { token }
      });

      logger.info('User logged out successfully');
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  async sendVerificationCode(mobile: string): Promise<void> {
    try {
      // Generate 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Save verification code
      await prisma.user.upsert({
        where: { mobile },
        update: {
          verificationCode,
          verificationCodeExpiresAt: expiresAt
        },
        create: {
          mobile,
          name: '',
          role: UserRole.USER,
          status: UserStatus.INACTIVE,
          verificationCode,
          verificationCodeExpiresAt: expiresAt
        }
      });

      // Send SMS
      await smsService.sendVerificationCode(mobile, verificationCode);

      logger.info(`Verification code sent to: ${mobile}`);
    } catch (error) {
      logger.error('Send verification code error:', error);
      throw error;
    }
  }

  async verifyCode(mobile: string, code: string): Promise<AuthResponse> {
    try {
      const user = await prisma.user.findUnique({
        where: { mobile }
      });

      if (!user) {
        throw new NotFoundError('کاربری با این شماره موبایل یافت نشد');
      }

      if (!user.verificationCode || !user.verificationCodeExpiresAt) {
        throw new AuthenticationError('کد تأیید ارسال نشده است');
      }

      if (user.verificationCodeExpiresAt < new Date()) {
        throw new AuthenticationError('کد تأیید منقضی شده است');
      }

      if (user.verificationCode !== code) {
        throw new AuthenticationError('کد تأیید اشتباه است');
      }

      // Activate user and clear verification code
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          status: UserStatus.ACTIVE,
          verificationCode: null,
          verificationCodeExpiresAt: null,
          lastLoginAt: new Date()
        }
      });

      // Generate tokens
      const { accessToken, refreshToken } = await this.generateTokens({
        userId: updatedUser.id,
        mobile: updatedUser.mobile,
        role: updatedUser.role as UserRole
      });

      // Save refresh token
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: updatedUser.id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      });

      logger.info(`User verified successfully: ${updatedUser.mobile}`);

      return {
        user: this.sanitizeUser(updatedUser),
        accessToken,
        refreshToken
      };
    } catch (error) {
      logger.error('Verify code error:', error);
      throw error;
    }
  }

  private async generateTokens(payload: JWTPayload): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = jwt.sign(payload, jwtConfig.accessSecret, {
      expiresIn: jwtConfig.accessTTL
    });

    const refreshToken = jwt.sign(payload, jwtConfig.refreshSecret, {
      expiresIn: jwtConfig.refreshTTL
    });

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: any) {
    const { password, verificationCode, verificationCodeExpiresAt, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  async validateToken(token: string): Promise<JWTPayload> {
    try {
      const payload = jwt.verify(token, jwtConfig.accessSecret) as JWTPayload;
      
      // Check if user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: payload.userId }
      });

      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new AuthenticationError('کاربر یافت نشد یا غیرفعال است');
      }

      return payload;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('توکن نامعتبر است');
      }
      throw error;
    }
  }
}

export const authService = new AuthService();