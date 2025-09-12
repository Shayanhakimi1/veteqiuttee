import React, { createContext, useContext, useState, useEffect } from 'react';

// ایجاد Context
const AppContext = createContext();

// Hook برای استفاده از Context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Provider Component
export const AppProvider = ({ children }) => {
  // State های اصلی
  const [userData, setUserData] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);
  const [consultationData, setConsultationData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // بارگذاری داده‌ها از localStorage هنگام شروع
  useEffect(() => {
    try {
      const savedUserData = localStorage.getItem('userData');
      const savedPetData = localStorage.getItem('selectedPetType');
      const savedConsultationData = localStorage.getItem('consultationData');
      const rememberLogin = localStorage.getItem('rememberLogin');

      if (savedUserData) {
        const parsedUserData = JSON.parse(savedUserData);
        setUserData(parsedUserData);
        
        // اگر rememberLogin فعال باشد، کاربر را لاگین نگه دار
        if (rememberLogin === 'true') {
          setIsLoggedIn(true);
        }
      }
      if (savedPetData) {
        setSelectedPet(JSON.parse(savedPetData));
      }
      if (savedConsultationData) {
        setConsultationData(JSON.parse(savedConsultationData));
      }

      const savedPaymentData = localStorage.getItem('paymentData');
      if (savedPaymentData) {
        setPaymentData(JSON.parse(savedPaymentData));
      }
    } catch (error) {
      console.error('خطا در بارگذاری داده‌ها از localStorage:', error);
    }
  }, []);

  // ذخیره اطلاعات کاربر
  const saveUserData = (data) => {
    try {
      setUserData(data);
      localStorage.setItem('userData', JSON.stringify(data));
    } catch (error) {
      console.error('خطا در ذخیره اطلاعات کاربر:', error);
    }
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
  const saveConsultationData = (data) => {
    try {
      setConsultationData(data);
      localStorage.setItem('consultationData', JSON.stringify(data));
    } catch (error) {
      console.error('خطا در ذخیره اطلاعات مشاوره:', error);
    }
  };

  // ذخیره اطلاعات پرداخت
  const savePaymentData = (data) => {
    try {
      setPaymentData(data);
      localStorage.setItem('paymentData', JSON.stringify(data));
    } catch (error) {
      console.error('خطا در ذخیره اطلاعات پرداخت:', error);
    }
  };

  // پاک کردن تمام داده‌ها
  const clearAllData = () => {
    try {
      setUserData(null);
      setSelectedPet(null);
      setConsultationData(null);
      localStorage.removeItem('userData');
      localStorage.removeItem('selectedPetType');
      localStorage.removeItem('consultationData');
    } catch (error) {
      console.error('خطا در پاک کردن داده‌ها:', error);
    }
  };

  // تولید کد پیگیری
  const generateTrackingCode = () => {
    const prefix = 'PC';
    const randomNum = Math.floor(Math.random() * 90000) + 10000;
    return `${prefix}-${randomNum}`;
  };

  // بررسی وضعیت لاگین
  const checkIsLoggedIn = () => {
    return userData && userData.mobile && userData.password;
  };

  // مقادیر Context
  const value = {
    // State ها
    userData,
    selectedPet,
    consultationData,
    paymentData,
    isLoading,
    isLoggedIn,
    
    // Actions
    saveUserData,
    savePetSelection,
    saveConsultationData,
    savePaymentData,
    clearAllData,
    generateTrackingCode,
    checkIsLoggedIn,
    setIsLoading,
    setIsLoggedIn,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;