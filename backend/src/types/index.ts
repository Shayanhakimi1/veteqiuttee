import { User, Pet, Consultation, Payment, Doctor, Appointment, Media, Notification, AuditLog } from '@prisma/client';

// Enums
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export enum PetType {
  DOG = 'DOG',
  CAT = 'CAT',
  BIRD = 'BIRD',
  FISH = 'FISH',
  RABBIT = 'RABBIT',
  HAMSTER = 'HAMSTER',
  OTHER = 'OTHER'
}

export enum PetGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  UNKNOWN = 'UNKNOWN'
}

export enum ConsultationStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum ConsultationType {
  GENERAL = 'GENERAL',
  EMERGENCY = 'EMERGENCY',
  FOLLOW_UP = 'FOLLOW_UP',
  VACCINATION = 'VACCINATION',
  SURGERY = 'SURGERY'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentMethod {
  ZARINPAL = 'ZARINPAL',
  MOCK = 'MOCK'
}

export enum Currency {
  TOMAN = 'TOMAN',
  RIAL = 'RIAL'
}

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOCUMENT = 'DOCUMENT'
}

export enum NotificationType {
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  CONSULTATION_UPDATE = 'CONSULTATION_UPDATE',
  PAYMENT_CONFIRMATION = 'PAYMENT_CONFIRMATION',
  SYSTEM_ALERT = 'SYSTEM_ALERT'
}

export enum SMSStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED'
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT'
}

// Extended types with relations
export type UserWithRelations = User & {
  pets?: Pet[];
  consultations?: Consultation[];
  payments?: Payment[];
  appointments?: Appointment[];
  notifications?: Notification[];
  auditLogs?: AuditLog[];
};

export type PetWithRelations = Pet & {
  owner: User;
  consultations?: Consultation[];
  appointments?: Appointment[];
};

export type ConsultationWithRelations = Consultation & {
  user: User;
  pet: Pet;
  payment?: Payment;
  voiceMedia?: Media;
  media?: Media[];
  appointments?: Appointment[];
};

export type PaymentWithRelations = Payment & {
  user: User;
  consultation?: Consultation;
};

export type AppointmentWithRelations = Appointment & {
  user: User;
  pet: Pet;
  doctor: Doctor;
  consultation?: Consultation;
};

// Request/Response types
export interface AuthRequest {
  mobile: string;
  password?: string;
  verificationCode?: string;
}

export interface RegisterRequest {
  mobile: string;
  firstName: string;
  lastName: string;
  email?: string;
  password: string;
}

export interface LoginRequest {
  mobile: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface VerifyCodeRequest {
  mobile: string;
  code: string;
}

export interface ResendCodeRequest {
  mobile: string;
}

export interface GetConsultationsQuery {
  page?: number;
  limit?: number;
  status?: ConsultationStatus;
  petId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
}

export interface CreateUserRequest {
  mobile: string;
  name: string;
  email?: string;
  password?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
}

export interface CreatePetRequest {
  name: string;
  type: PetType;
  breed?: string;
  gender: PetGender;
  birthDate?: Date;
  weight?: number;
  description?: string;
}

export interface UpdatePetRequest {
  name?: string;
  type?: PetType;
  breed?: string;
  gender?: PetGender;
  birthDate?: Date;
  weight?: number;
  description?: string;
}

export interface CreateConsultationRequest {
  petId: string;
  symptoms: string;
  description?: string;
  urgencyLevel: number;
  preferredDate?: Date;
  voiceNote?: Express.Multer.File;
  images?: Express.Multer.File[];
}

export interface UpdateConsultationRequest {
  symptoms?: string;
  description?: string;
  urgencyLevel?: number;
  status?: ConsultationStatus;
  doctorNotes?: string;
  prescription?: string;
  followUpDate?: Date;
}

export interface CreatePaymentRequest {
  consultationId?: string;
  amount: number;
  currency: Currency;
  method: PaymentMethod;
  description?: string;
}

export interface PaymentVerificationRequest {
  authority: string;
  status: string;
}

export interface CreateAppointmentRequest {
  petId: string;
  doctorId: string;
  consultationId?: string;
  scheduledAt: Date;
  duration: number;
  notes?: string;
}

export interface UpdateAppointmentRequest {
  scheduledAt?: Date;
  duration?: number;
  status?: AppointmentStatus;
  notes?: string;
  doctorNotes?: string;
}

export interface AvailableSlot {
  date: string;
  time: string;
  available: boolean;
  doctorId: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalPets: number;
  totalConsultations: number;
  totalPayments: number;
  recentConsultations: ConsultationWithRelations[];
  recentPayments: PaymentWithRelations[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FileUploadResponse {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  mobile: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Environment variables
export interface EnvConfig {
  DATABASE_URL: string;
  PORT: number;
  NODE_ENV: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  ACCESS_TTL: string;
  REFRESH_TTL: string;
  CORS_ORIGIN: string;
  S3_ENDPOINT?: string;
  S3_BUCKET?: string;
  S3_ACCESS_KEY?: string;
  S3_SECRET_KEY?: string;
  LOCAL_STORAGE: boolean;
  UPLOAD_PATH: string;
  MOCK_GATEWAY: boolean;
  ZARINPAL_MERCHANT_ID?: string;
  TZ: string;
  ODD_WEEK_DAYS: string;
  SLOT_START_HOUR: number;
  SLOT_END_HOUR: number;
  SLOT_INTERVAL: number;
  SLOT_HOLD_MINS: number;
  SPECIALIST_PRICE_TOMAN: number;
  SMS_PROVIDER: string;
  SMS_API_KEY?: string;
  SMS_SENDER?: string;
  BCRYPT_SALT_ROUNDS: number;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  LOG_LEVEL: string;
  LOG_FILE: string;
  DEFAULT_ADMIN_MOBILE: string;
  DEFAULT_ADMIN_PASSWORD: string;
  DEFAULT_ADMIN_NAME: string;
}

// Error types
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public errors: Record<string, string[]>;

  constructor(errors: Record<string, string[]>) {
    super('Validation failed', 400);
    this.errors = errors;
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409);
  }
}

export class PaymentError extends AppError {
  constructor(message: string = 'Payment processing failed') {
    super(message, 402);
  }
}

// Express Request extensions
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      files?: {
        [fieldname: string]: Express.Multer.File[];
      } | Express.Multer.File[];
    }
  }
}