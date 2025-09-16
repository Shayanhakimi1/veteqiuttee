// User related types
export interface User {
  id: number;
  fullName: string;
  mobile: string;
  createdAt?: string;
}

export interface Pet {
  id: number;
  name: string;
  breed: string;
  age: number;
  gender: 'male' | 'female';
  type: string;
  userId: number;
}

// Registration form data
export interface RegistrationData {
  fullName: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  petName: string;
  petBreed: string;
  petAge: string;
  petGender: 'male' | 'female';
  petType: string;
}

// Login form data
export interface LoginData {
  mobile: string;
  password: string;
}

// Consultation data
export interface ConsultationData {
  symptoms: string;
  urgency: 'low' | 'medium' | 'high';
  petId?: number;
  userId?: number;
  files?: File[];
  voiceRecording?: Blob;
}

// Payment data
export interface PaymentData {
  amount: number;
  description?: string;
  userId?: number;
  paymentMethod?: string;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Auth context types
export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (credentials: LoginData) => Promise<void>;
  adminLogin: (credentials: LoginData) => Promise<void>;
  register: (data: RegistrationData) => Promise<void>;
  logout: () => void;
}

// App context types
export interface AppContextType {
  userData: User | null;
  selectedPet: Pet | null;
  consultationData: ConsultationData | null;
  paymentData: PaymentData | null;
  savePetSelection: (pet: Pet) => void;
  saveConsultationData: (data: ConsultationData) => void;
  savePaymentData: (data: PaymentData) => void;
  clearConsultationData: () => void;
  clearAllData: () => void;
  setUserData: (user: User) => void;
  loadUserProfile: () => Promise<void>;
  clearRegistrationData: () => void;
}

// Component prop types
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  className?: string;
}

export interface InputFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

export interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

export interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  maxSize?: number;
}

export interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  maxDuration?: number;
}

// Notification types
export interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
}

// Modal types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}