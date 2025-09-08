import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';

// صفحه تایید
const Confirmation = () => {
  const navigate = useNavigate();
  const { userData, selectedPet, paymentData } = useApp();
  const { isAuthenticated } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);

  // بررسی احراز هویت
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  // انیمیشن تیک سبز
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // نمایش Toast پیامک
  useEffect(() => {
    const toastTimer = setTimeout(() => {
      setShowToast(true);
      
      // مخفی کردن Toast بعد از 5 ثانیه
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    }, 2000);

    return () => clearTimeout(toastTimer);
  }, []);

  // گرفتن تاریخ و ساعت مشاوره
  const getConsultationDateTime = () => {
    if (!paymentData?.selectedDate || !paymentData?.selectedTime) {
      return { date: 'نامشخص', time: 'نامشخص' };
    }

    // تبدیل تاریخ
    const date = new Date(paymentData.selectedDate);
    const persianDate = date.toLocaleDateString('fa-IR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return {
      date: persianDate,
      time: paymentData.selectedTime
    };
  };

  const { date, time } = getConsultationDateTime();
  const trackingCode = paymentData?.trackingCode || 'PC-XXXXX';

  // بازگشت به داشبورد
  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // شروع مشاوره جدید
  const handleNewConsultation = () => {
    // پاک کردن داده‌های مشاوره قبلی
    localStorage.removeItem('consultationData');
    localStorage.removeItem('paymentData');
    localStorage.removeItem('selectedPetType');
    navigate('/pet-selection');
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <span className="text-xl">📱</span>
            <span className="font-medium">پیامک تایید برای شما ارسال شد</span>
          </div>
        </div>
      )}

      {/* محتوای اصلی */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* آیکون تیک سبز انیمیشن */}
        <div className="text-center mb-8">
          <div className={`w-24 h-24 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center transition-all duration-1000 transform ${
            isAnimated ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
          }`}>
            <svg 
              className="w-12 h-12 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={3} 
                d="M5 13l4 4L19 7"
                className={`transition-all duration-1000 delay-500 ${
                  isAnimated ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            درخواست با موفقیت ثبت شد! 🎉
          </h1>
          
          <p className="text-gray-600 text-lg">
            مشاوره شما با موفقیت رزرو شد
          </p>
        </div>

        {/* کارت اطلاعات مشاوره */}
        <div className="card bg-green-50 border-green-200 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-green-800 mb-2">
              اطلاعات مشاوره شما
            </h2>
            <div className="w-16 h-1 bg-green-500 mx-auto rounded"></div>
          </div>
          
          <div className="space-y-4">
            {/* کد پیگیری */}
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <span className="text-green-700 font-medium">کد پیگیری:</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-green-800 font-mono">
                    {trackingCode}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(trackingCode)}
                    className="text-green-600 hover:text-green-800 transition-colors"
                    title="کپی کد پیگیری"
                  >
                    📋
                  </button>
                </div>
              </div>
            </div>
            
            {/* تاریخ و ساعت */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📅</span>
                  <div>
                    <p className="text-green-700 text_sm font-medium">تاریخ مشاوره</p>
                    <p className="text-gray-800 font-bold">{date}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🕐</span>
                  <div>
                    <p className="text-green-700 text_sm font-medium">ساعت مشاوره</p>
                    <p className="text-gray-800 font-bold text-xl">{time}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* شماره تماس */}
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items_center gap-3">
                <span className="text-2xl">📞</span>
                <div className="flex-1">
                  <p className="text-green-700 text-sm font-medium">شماره تماس</p>
                  <p className="text-gray-800 font-bold text-lg ltr text-left">
                    {userData?.mobile}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* اطلاعات حیوان خانگی */}
        <div className="card mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">{selectedPet?.emoji}</span>
            حیوان خانگی شما
          </h3>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-sm">نام:</p>
              <p className="font-medium text-gray-800">{userData?.petName}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">نژاد:</p>
              <p className="font-medium text-gray-800">{userData?.petBreed}</p>
            </div>
          </div>
        </div>

        {/* هشدار مهم */}
        <div className="mb-8">
          <Alert 
            type="info" 
            title="نکته مهم"
            message="مشاور در زمان تعیین شده با شماره موبایل شما تماس خواهد گرفت. لطفاً در آن زمان در دسترس باشید."
          />
        </div>

        {/* راهنمایی‌های بعدی */}
        <div className="card bg-blue-50 border-blue-200 mb-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">
            💡 مراحل بعدی:
          </h3>
          
          <ul className="space-y-3 text-blue-700">
            <li className="flex items-start gap-3">
              <span className="text-blue-500 mt-1">1️⃣</span>
              <span>پیامک تایید برای شما ارسال شده است</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500 mt-1">2️⃣</span>
              <span>مشاور در زمان تعیین شده با شما تماس خواهد گرفت</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500 mt-1">3️⃣</span>
              <span>در صورت نیاز، می‌توانید با کد پیگیری پیگیری کنید</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500 mt-1">4️⃣</span>
              <span>پس از مشاوره، نظر خود را با ما در میان بگذارید</span>
            </li>
          </ul>
        </div>

        {/* دکمه‌های عملیات */}
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Button
              onClick={handleBackToDashboard}
              variant="outline"
              size="lg"
              className="w-full"
            >
              بازگشت به داشبورد
            </Button>
            <Button
              onClick={handleNewConsultation}
              size="lg"
              className="w-full"
            >
              شروع مشاوره جدید
            </Button>
          </div>

          <div className="text-center text-gray-600 text-sm">
            <p>در صورت نیاز به تغییر زمان مشاوره، لطفاً با پشتیبانی تماس بگیرید.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;