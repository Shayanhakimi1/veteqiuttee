import { useState, useEffect } from 'react';
import { useApp } from './useApp';
import { authAPI } from '../services/api';
import { translateError } from '../utils/errorTranslations';

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
      console.error('خطا در ورود:', error);
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
      console.error('خطا در ورود ادمین:', error);
      const translatedError = new Error(translateError(error.message) || 'شماره موبایل یا رمز عبور اشتباه است');
      throw translatedError;
    }
  };

  const register = async (userData, petData) => {
    try {
      const registrationData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        mobile: userData.mobile,
        password: userData.password,
        petData: petData
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
      console.error('خطا در ثبت‌نام کاربر:', error);
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