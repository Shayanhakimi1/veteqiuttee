import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, usersAPI, consultationsAPI } from '../services/api';

// ایجاد Context
const AppContext = createContext();

// Custom hook برای استفاده از Context
const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Provider Component
const AppProvider = ({ children }) => {
  // State های اصلی
  const [userData, setUserData] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);
  const [consultationData, setConsultationData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // بارگذاری داده‌ها و بررسی احراز هویت هنگام شروع
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const savedPetData = localStorage.getItem('selectedPetType');
        const savedConsultationData = localStorage.getItem('consultationData');
        const savedPaymentData = localStorage.getItem('paymentData');
        const rememberLogin = localStorage.getItem('rememberLogin');
        if (token && rememberLogin === 'true') {
          try {
            const response = await authAPI.verify();
            if (response.valid) {
              setUserData(response.user);
              // Load user profile
              await loadUserProfile();
            } else {
              // Token invalid, clear auth data
              authAPI.logout();
            }
          } catch (error) {
            console.error('خطا در تایید توکن:', error);
            authAPI.logout();
          }
        }

        // Load temporary data from localStorage
        if (savedPetData) {
          setSelectedPet(JSON.parse(savedPetData));
        }
        if (savedConsultationData) {
          setConsultationData(JSON.parse(savedConsultationData));
        }
        
        if (savedPaymentData) {
          setPaymentData(JSON.parse(savedPaymentData));
        }
        // Admin status check removed
      } catch (error) {
        console.error('خطا در راه‌اندازی اپلیکیشن:', error);
      }
    };

    initializeApp();
  }, []);

  // Load user profile from API
  const loadUserProfile = async () => {
    try {
      const profile = await usersAPI.getProfile();
      setUserData(profile.user);
      return profile;
    } catch (error) {
      console.error('خطا در بارگذاری پروفایل کاربر:', error);
      throw error;
    }
  };

  // Admin data loading removed

  // ذخیره اطلاعات کاربر (برای ثبت‌نام)
  const saveUserData = async (data) => {
    try {
      setUserData(data);
      // Temporary save to localStorage for registration process
      localStorage.setItem('userData', JSON.stringify(data));
    } catch (error) {
      console.error('خطا در ذخیره اطلاعات کاربر:', error);
    }
  };

  // تولید شناسه منحصر به فرد
  const generateUniqueId = () => {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  // ذخیره انتخاب پت
  const savePetSelection = (petData) => {
    try {
      setSelectedPet(petData);
      localStorage.setItem('selectedPetType', JSON.stringify(petData));
    } catch (error) {
      console.error('خطا در ذخیره انتخاب پت:', error);
    }
  };

  // ذخیره اطلاعات مشاوره
  const saveConsultationData = async (data, files = []) => {
    try {
      console.log('saveConsultationData called with:', { data, files });
      
      // اولیه: ذخیره پیش‌نویس محلی فوراً
      setConsultationData(data);
      localStorage.setItem('consultationData', JSON.stringify(data));
      
      // تلاش برای ذخیره در API
      try {
        console.log('Attempting to save to API...');
        const response = await consultationsAPI.create(data, files);
        console.log('API response:', response);

        // اگر موفق بود، شناسه بازگشتی را ذخیره کنیم تا در پرداخت استفاده شود
        const apiConsultation = response?.data?.consultation;
        if (apiConsultation?.id) {
          const merged = { ...data, id: apiConsultation.id };
          setConsultationData(merged);
          localStorage.setItem('consultationData', JSON.stringify(merged));
        }

        return response;
      } catch (apiError) {
        console.warn('Failed to save to API, continuing with localStorage only:', apiError);
        // ادامه با localStorage (شناسه در این حالت وجود نخواهد داشت)
      }
      
      return data;
    } catch (error) {
      console.error('خطا در ذخیره اطلاعات مشاوره:', error);
      throw error;
    }
  };

  // ذخیره اطلاعات پرداخت
  const savePaymentData = (data) => {
    try {
      setPaymentData(data);
      localStorage.setItem('paymentData', JSON.stringify(data));
      return data;
    } catch (error) {
      console.error('خطا در ذخیره اطلاعات پرداخت:', error);
      throw error;
    }
  };

  // پاک کردن اطلاعات ثبت نام برای امکان ثبت نام مجدد
  const clearRegistrationData = () => {
    try {
      localStorage.removeItem('registrationData');
      localStorage.removeItem('registrationCompleted');
      localStorage.removeItem('authToken');
      // removed legacy: localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('currentUser');
      setUserData(null);
    } catch (error) {
      console.error('خطا در پاک کردن اطلاعات ثبت نام:', error);
    }
  };

  // پاک کردن اطلاعات مشاوره بعد از پرداخت موفق
  const clearConsultationData = () => {
    try {
      localStorage.removeItem('consultationData');
      localStorage.removeItem('selectedPetType');
      localStorage.removeItem('paymentFormData');
      setConsultationData(null);
      setSelectedPet(null);
    } catch (error) {
      console.error('خطا در پاک کردن اطلاعات مشاوره:', error);
    }
  };

  // پاک کردن تمام اطلاعات برای خروج از حساب
  const clearAllData = () => {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('selectedPetType');
      localStorage.removeItem('consultationData');
      localStorage.removeItem('paymentData');
      localStorage.removeItem('registrationData');
      localStorage.removeItem('registrationCompleted');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('selectedConsultationType');
      setUserData(null);
      setSelectedPet(null);
      setConsultationData(null);
      setPaymentData(null);
    } catch (error) {
      console.error('خطا در پاک کردن اطلاعات:', error);
    }
  };

  // تولید کد پیگیری
  const generateTrackingCode = () => {
    const prefix = 'PC';
    const randomNum = Math.floor(Math.random() * 90000) + 10000;
    return `${prefix}-${randomNum}`;
  };

  // بررسی وضعیت لاگین حذف شد؛ از useAuth استفاده کنید

  // مقادیر Context
  const value = {
    // State ها
    userData,
    selectedPet,
    consultationData,
    paymentData,
    isLoading,
    
    // Actions
    saveUserData,
    savePetSelection,
    saveConsultationData,
    savePaymentData,
    clearRegistrationData,
    clearConsultationData,
    clearAllData,
    generateTrackingCode,
    // checkIsLoggedIn removed
    setIsLoading,
    setUserData, //
    
    // Auth Actions
    loadUserProfile,
    
    // Utility Actions
    generateUniqueId,
    
    // API Services (for direct access if needed)
    authAPI,
    usersAPI,
    consultationsAPI,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Export the provider as default for better Fast Refresh compatibility
/* eslint-disable react-refresh/only-export-components */
export { AppProvider, AppContext, useApp };
export default AppContext;