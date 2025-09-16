import { translateError, translateValidationErrors } from '../utils/errorTranslations';
import { logger } from '../utils/logger';

const API_BASE_URL = "http://localhost:3003/api";

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const startTime = Date.now();
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      // Handle authentication errors specifically
      if (response.status === 401 || response.status === 403) {
        throw new Error("خطا در احراز هویت. لطفاً دوباره وارد شوید.");
      }
      
      // ترجمه خطاهای سرور به فارسی
      let errorMessage = data.error?.message || data.message || "خطا در ارتباط با سرور";
      
      // بررسی اینکه آیا خطا از نوع اعتبارسنجی است
      if (errorMessage.includes('Validation error:')) {
        errorMessage = translateValidationErrors(errorMessage);
      } else {
        errorMessage = translateError(errorMessage);
      }
      
      throw new Error(errorMessage);
    }

    logger.api(endpoint, Date.now() - startTime, response.status);
    return data;
  } catch (error) {
    logger.error('API Request Error', { error, endpoint });

    // بررسی نوع خطا و ارائه پیام مناسب
    if (
      error.name === "TypeError" &&
      error.message.includes("Failed to fetch")
    ) {
      throw new Error(
        "خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید."
      );
    }

    if (error.name === "SyntaxError") {
      throw new Error("خطا در پردازش پاسخ سرور");
    }

    throw error;
  }
};

// Auth API
export const authAPI = {
  // Register new user
  register: async (registrationData) => {
    return apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(registrationData),
    });
  },

  // Login user
  login: async (credentials) => {
    const response = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    // Store token in localStorage
    if (response.token) {
      localStorage.setItem("authToken", response.token);
      // removed legacy flag: localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("currentUser", JSON.stringify(response.user));
    }

    return response;
  },

  loginAdmin: async (credentials) => {
    const response = await apiRequest("/admin/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (response.token) {
      localStorage.setItem("authToken", response.token);
      // removed legacy flag: localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("currentUser", JSON.stringify(response.admin));
    }

    return response;
  },

  // Verify token
  verify: async () => {
    return apiRequest("/auth/verify");
  },

  // Logout
  logout: () => {
    localStorage.removeItem("authToken");
    // removed legacy flag: localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
  },
};

// Users API
export const usersAPI = {
  // Get user profile
  getProfile: async () => {
    return apiRequest("/users/profile");
  },

  // Get comprehensive user data (including medical documents)
  getComprehensiveData: async () => {
    return apiRequest("/auth/me");
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return apiRequest("/users/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  },

  // Add new pet
  addPet: async (petData) => {
    return apiRequest("/users/pets", {
      method: "POST",
      body: JSON.stringify(petData),
    });
  },

  // Update pet
  updatePet: async (petId, petData) => {
    return apiRequest(`/users/pets/${petId}`, {
      method: "PUT",
      body: JSON.stringify(petData),
    });
  },

  // Delete pet
  deletePet: async (petId) => {
    return apiRequest(`/users/pets/${petId}`, {
      method: "DELETE",
    });
  },

  // Get user payments
  getPayments: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/payments${queryString ? `?${queryString}` : ''}`);
  },

  // Create payment for regular users
  createPayment: async (paymentData) => {
    return apiRequest("/payments", {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
  },
};



// Media API
export const mediaAPI = {
  // Get media files with filters
  getMediaFiles: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/media${queryString ? `?${queryString}` : ''}`);
  },

  // Get media statistics
  getMediaStats: async () => {
    return apiRequest('/media/stats');
  },

  // Get media URL for serving
  getMediaUrl: (mediaId) => {
    const token = getAuthToken();
    return `${API_BASE_URL}/media/serve/${mediaId}?token=${token}`;
  },

  // Download media file
  downloadMedia: async (mediaId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/media/serve/${mediaId}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    return response;
  },
};

// Consultations API
export const consultationsAPI = {
  // Create new consultation
  create: async (consultationData, files = []) => {
    const formData = new FormData();

    // Add consultation data
    Object.keys(consultationData).forEach((key) => {
      formData.append(key, consultationData[key]);
    });

    // Add files
    files.forEach((file) => {
      formData.append("files", file);
    });

    return apiRequest("/consultations", {
      method: "POST",
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  },

  // Get user consultations
  getAll: async (page = 1, limit = 10) => {
    return apiRequest(`/consultations?page=${page}&limit=${limit}`);
  },

  // Get specific consultation
  getById: async (consultationId) => {
    return apiRequest(`/consultations/${consultationId}`);
  },

  // Update consultation status
  updateStatus: async (consultationId, statusData) => {
    return apiRequest(`/consultations/${consultationId}/status`, {
      method: "PUT",
      body: JSON.stringify(statusData),
    });
  },
};



// Health check
export const healthAPI = {
  check: async () => {
    return apiRequest("/health");
  },
};

// Appointments API
export const appointmentsAPI = {
  // Get available time slots for a specific date
  getAvailableSlots: async (date) => {
    return apiRequest(`/appointments/available-slots?date=${date}`);
  },

  // Book a time slot
  bookSlot: async (bookingData) => {
    return apiRequest("/appointments/book-slot", {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
  },

  // Cancel a booked slot
  cancelSlot: async (date, timeSlot) => {
    return apiRequest(`/appointments/cancel-slot/${date}/${timeSlot}`, {
      method: "DELETE",
    });
  },

  // Get all appointments (admin)
  getAllAppointments: async () => {
    return apiRequest("/appointments/all");
  },
};

// Payment API
export const paymentAPI = {
  // Create payment
  create: async (paymentData) => {
    return apiRequest("/payments", {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
  },

  // Get payment by ID
  getById: async (paymentId) => {
    return apiRequest(`/payments/${paymentId}`);
  },

  // Update payment status
  updateStatus: async (paymentId, statusData) => {
    return apiRequest(`/payments/${paymentId}/status`, {
      method: "PUT",
      body: JSON.stringify(statusData),
    });
  },
};

export default {
  authAPI,
  usersAPI,
  consultationsAPI,
  healthAPI,
  appointmentsAPI,
  paymentAPI,
};

// Admin API
export const adminAPI = {
  // Get dashboard stats
  getDashboardStats: async () => {
    return apiRequest("/admin/dashboard");
  },

  // Get all users
  getAllUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/users?${queryString}`);
  },

  // Get all pets
  getAllPets: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/pets?${queryString}`);
  },

  // Get all payments
  getAllPayments: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/payments?${queryString}`);
  },

  // Get all consultations
  getAllConsultations: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/admin/consultations?${queryString}`);
  },
};

// Consultation API for detailed submissions
export const consultationAPI = {
  // Get user submissions with media files
  getUserSubmissions: async (userId) => {
    return apiRequest(`/consultations/user/${userId}/submissions`);
  },

  // Get detailed consultation information
  getConsultationDetails: async (consultationId) => {
    return apiRequest(`/consultations/${consultationId}/details`);
  },

  // Download user record as ZIP
  downloadUserRecord: async (userId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/consultations/user/${userId}/download`, {
      method: 'GET',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error('خطا در دانلود فایل');
    }

    return response;
  },

  // Get media file URL
  getMediaUrl: (filename) => {
    return `${API_BASE_URL}/consultations/media/${filename}`;
  },
};
