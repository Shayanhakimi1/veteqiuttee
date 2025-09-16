import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { authAPI } from '../services/api';
import { translateError } from '../utils/errorTranslations';
import { logger } from '../utils/logger';

export const useAuth = () => {
  const { setUserData, loadUserProfile, clearRegistrationData } = useApp();

  const login = async (mobile, password, rememberMe = false) => {
    try {
      const response = await authAPI.login({ mobile, password });
      await loadUserProfile();
      if (rememberMe) {
        localStorage.setItem('rememberLogin', 'true');
      }
      return response;
    } catch (error) {
      logger.error('User login failed', { error });
      const translatedError = new Error(translateError(error.message) || 'شماره موبایل یا رمز عبور اشتباه است');
      throw translatedError;
    }
  };

  const adminLogin = async (mobile, password, rememberMe = false) => {
    try {
      const response = await authAPI.loginAdmin({ mobile, password });
      if (rememberMe) {
        localStorage.setItem('rememberLogin', 'true');
      }
      return { user: response.admin, token: response.token, isAdmin: true };
    } catch (error) {
      logger.error('Admin login failed', { error });
      const translatedError = new Error(translateError(error.message) || 'شماره موبایل یا رمز عبور اشتباه است');
      throw translatedError;
    }
  };

  const register = async (userData) => {
    try {
      const registrationData = {
        fullName: userData.fullName,
        petName: userData.petName,
        petBreed: userData.petBreed,
        petAge: userData.petAge,
        petGender: userData.petGender,
        isNeutered: userData.isNeutered,
        mobile: userData.mobile,
        password: userData.password,
        petType: userData.petType, // اضافه کردن نوع حیوان خانگی
      };
      
      const response = await authAPI.register(registrationData);
      
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        // Merge user data with pet information for frontend use
        const userWithPetData = {
          ...response.user,
          ...userData // This includes pet information
        };
        setUserData(userWithPetData);
        // Clear temporary data
        localStorage.removeItem('userData');
        localStorage.removeItem('selectedPetType');
        return response;
      }
      
      throw new Error('خطا در ثبت‌نام');
    } catch (error) {
      logger.error('User registration failed', { error });
      const translatedError = new Error(translateError(error.message) || 'خطا در ثبت‌نام کاربر');
      throw translatedError;
    }
  };
  
  const logout = () => {
    setUserData(null);
    authAPI.logout();
    clearRegistrationData();
    // پاکسازی اطلاعات مرتبط
    localStorage.removeItem('consultationData');
    localStorage.removeItem('paymentData');
  };

  const isAuthenticated = !!localStorage.getItem('authToken');

  return { 
    isAuthenticated,
    login,
    adminLogin,
    register,
    logout 
  };
};

export const useAdminAuth = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('currentUser'));
    setIsAdmin(token && user?.isAdmin);
  }, []);

  return { isAdmin };
};