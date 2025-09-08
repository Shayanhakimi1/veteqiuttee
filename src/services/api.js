const API_BASE_URL = 'http://localhost:3002/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  // Auth endpoints
  async register(userData) {
    return this.post('/auth/register', userData);
  }

  async login(credentials) {
    return this.post('/auth/login', credentials);
  }

  async logout() {
    return this.post('/auth/logout');
  }

  async refreshToken(refreshToken) {
    return this.post('/auth/refresh', { refreshToken });
  }

  async getCurrentUser() {
    return this.get('/auth/me');
  }

  // Pet endpoints
  async createPet(petData) {
    return this.post('/pets', petData);
  }

  async getUserPets() {
    return this.get('/pets/user');
  }

  async getPet(petId) {
    return this.get(`/pets/${petId}`);
  }

  async updatePet(petId, petData) {
    return this.put(`/pets/${petId}`, petData);
  }

  async deletePet(petId) {
    return this.delete(`/pets/${petId}`);
  }

  // Consultation endpoints
  async createConsultation(consultationData) {
    return this.post('/consultations', consultationData);
  }

  async getUserConsultations() {
    return this.get('/consultations/user');
  }

  async getConsultation(consultationId) {
    return this.get(`/consultations/${consultationId}`);
  }

  async updateConsultation(consultationId, consultationData) {
    return this.put(`/consultations/${consultationId}`, consultationData);
  }
}

export const apiService = new ApiService();
export default apiService;