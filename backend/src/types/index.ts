// User related types
export interface CreateUserRequest {
  fullName: string;
  mobile: string;
  password: string;
  petName: string;
  petBreed: string;
  petAge: string | number;
  petGender: 'male' | 'female';
  petType: string;
}

export interface UserResponse {
  id: number;
  fullName: string;
  mobile: string;
  createdAt: Date;
}

export interface PetResponse {
  id: number;
  name: string;
  breed: string;
  age: number;
  gender: 'male' | 'female';
  type: string;
  userId: number;
}

// Payment related types
export interface CreatePaymentRequest {
  amount: number;
  description?: string;
  userId: number;
}

export interface PaymentResponse {
  id: number;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

// Consultation related types
export interface ConsultationRequest {
  symptoms: string;
  urgency: 'low' | 'medium' | 'high';
  petId: number;
  userId: number;
}

export interface ConsultationResponse {
  id: number;
  symptoms: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  petId: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

// Auth related types
export interface LoginRequest {
  mobile: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
}

// Media related types
export interface MediaFile {
  id: number;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  category: 'image' | 'video' | 'audio' | 'document';
  consultationId?: number;
  createdAt: Date;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Extended Request interface for authenticated routes
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    mobile: string;
    isAdmin?: boolean;
  };
}