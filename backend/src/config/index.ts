import dotenv from 'dotenv';
import { EnvConfig } from '../types';

// Load environment variables
dotenv.config();

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET'
];

// Validate required environment variables
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const config: EnvConfig = {
  DATABASE_URL: process.env.DATABASE_URL!,
  PORT: parseInt(process.env.PORT || '3002', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  ACCESS_TTL: process.env.ACCESS_TTL || '15m',
  REFRESH_TTL: process.env.REFRESH_TTL || '30d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  S3_ENDPOINT: process.env.S3_ENDPOINT,
  S3_BUCKET: process.env.S3_BUCKET,
  S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
  S3_SECRET_KEY: process.env.S3_SECRET_KEY,
  LOCAL_STORAGE: process.env.LOCAL_STORAGE === 'true',
  UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
  MOCK_GATEWAY: process.env.MOCK_GATEWAY === 'true',
  ZARINPAL_MERCHANT_ID: process.env.ZARINPAL_MERCHANT_ID,
  TZ: process.env.TZ || 'Asia/Tehran',
  ODD_WEEK_DAYS: process.env.ODD_WEEK_DAYS || 'sat,mon,wed',
  SLOT_START_HOUR: parseInt(process.env.SLOT_START_HOUR || '17', 10),
  SLOT_END_HOUR: parseInt(process.env.SLOT_END_HOUR || '21', 10),
  SLOT_INTERVAL: parseInt(process.env.SLOT_INTERVAL || '30', 10),
  SLOT_HOLD_MINS: parseInt(process.env.SLOT_HOLD_MINS || '15', 10),
  SPECIALIST_PRICE_TOMAN: parseInt(process.env.SPECIALIST_PRICE_TOMAN || '280000', 10),
  SMS_PROVIDER: process.env.SMS_PROVIDER || 'mock',
  SMS_API_KEY: process.env.SMS_API_KEY,
  SMS_SENDER: process.env.SMS_SENDER,
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FILE: process.env.LOG_FILE || 'logs/app.log',
  DEFAULT_ADMIN_MOBILE: process.env.DEFAULT_ADMIN_MOBILE || '09123456789',
  DEFAULT_ADMIN_PASSWORD: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123456',
  DEFAULT_ADMIN_NAME: process.env.DEFAULT_ADMIN_NAME || 'مدیر سیستم',
  cors: {
    allowedOrigins: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173']
  },
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 10
  }
};

export { config };
export default config;

// Database configuration
export const dbConfig = {
  url: config.DATABASE_URL,
  log: config.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
};

// JWT configuration
export const jwtConfig = {
  accessSecret: config.JWT_ACCESS_SECRET,
  refreshSecret: config.JWT_REFRESH_SECRET,
  accessTTL: config.ACCESS_TTL,
  refreshTTL: config.REFRESH_TTL
};

// File upload configuration
export const uploadConfig = {
  localStorage: config.LOCAL_STORAGE,
  uploadPath: config.UPLOAD_PATH,
  s3: {
    endpoint: config.S3_ENDPOINT,
    bucket: config.S3_BUCKET,
    accessKey: config.S3_ACCESS_KEY,
    secretKey: config.S3_SECRET_KEY
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10
  },
  allowedTypes: {
    images: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    videos: ['video/mp4', 'video/webm', 'video/ogg'],
    audio: ['audio/mp3', 'audio/wav', 'audio/ogg'],
    documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  }
};

// Payment configuration
export const paymentConfig = {
  mockGateway: config.MOCK_GATEWAY,
  zarinpal: {
    merchantId: config.ZARINPAL_MERCHANT_ID,
    sandbox: config.NODE_ENV !== 'production'
  },
  specialistPrice: config.SPECIALIST_PRICE_TOMAN
};

// Scheduling configuration
export const schedulingConfig = {
  timezone: config.TZ,
  oddWeekDays: config.ODD_WEEK_DAYS.split(','),
  slotStartHour: config.SLOT_START_HOUR,
  slotEndHour: config.SLOT_END_HOUR,
  slotInterval: config.SLOT_INTERVAL,
  slotHoldMins: config.SLOT_HOLD_MINS
};

// SMS configuration
export const smsConfig = {
  provider: config.SMS_PROVIDER,
  apiKey: config.SMS_API_KEY,
  sender: config.SMS_SENDER
};

// Security configuration
export const securityConfig = {
  bcryptSaltRounds: config.BCRYPT_SALT_ROUNDS,
  rateLimitWindowMs: config.RATE_LIMIT_WINDOW_MS,
  rateLimitMaxRequests: config.RATE_LIMIT_MAX_REQUESTS
};

// Logging configuration
export const logConfig = {
  level: config.LOG_LEVEL,
  file: config.LOG_FILE
};

// Admin configuration
export const adminConfig = {
  mobile: config.DEFAULT_ADMIN_MOBILE,
  password: config.DEFAULT_ADMIN_PASSWORD,
  name: config.DEFAULT_ADMIN_NAME
};