import React, { useEffect, useState } from 'react';
// Removed unused useNavigate import
// import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Phone } from 'lucide-react';
import { logger } from '../utils/logger';

const PaymentSuccess = () => {
  // const navigate = useNavigate(); // removed unused variable
  const [countdown, setCountdown] = useState(3);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // شروع شمارش معکوس
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setIsRedirecting(true);
          // انتقال به سایت فتاحیان
          setTimeout(() => {
            try {
              window.location.href = 'https://fattahianpethospital.com/';
            } catch {
              // در صورت مسدود شدن، صفحه جدید باز کن
              window.open('https://fattahianpethospital.com/', '_blank');
            }
          }, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // دریافت اطلاعات مشاوره از localStorage
  const getConsultationData = () => {
    try {
      const data = localStorage.getItem('consultationData');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Failed to parse consultation data', { error });
      return null;
    }
  };

  const consultationData = getConsultationData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-primary-50 to-secondary-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* کارت اصلی */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center relative overflow-hidden">
          {/* پس‌زمینه دکوراتیو */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-primary-400 to-secondary-400"></div>
          
          {/* آیکون تأیید */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              🎉 پرداخت با موفقیت انجام شد!
            </h1>
            <p className="text-gray-600 mb-3">
              درخواست مشاوره شما ثبت گردید
            </p>
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <p className="text-primary-800 text-sm">
                📍 شما به زودی به سایت اصلی بیمارستان حیوانات خانگی دکتر فتاحیان منتقل خواهید شد.
              </p>
            </div>
          </div>

          {/* پیام تشکر */}
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              با تشکر از انتخاب شما
            </h2>
            <div className="flex items-center justify-center gap-2 text-cyan-700 mb-3">
              <Phone className="w-5 h-5" />
              <span className="font-medium">
                همکاران ما در تاریخ و ساعت انتخاب شده با شما تماس خواهند گرفت
              </span>
            </div>
            
            {/* نمایش زمان انتخاب شده */}
            {consultationData?.appointmentDate && consultationData?.appointmentTime && (
              <div className="bg-white rounded-lg p-4 mt-4">
                <div className="flex items-center justify-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-gray-700">
                    <Clock className="w-4 h-4" />
                    <span>تاریخ:</span>
                    <span className="font-medium">
                      {new Date(consultationData.appointmentDate).toLocaleDateString('fa-IR')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-700">
                    <span>ساعت:</span>
                    <span className="font-medium">{consultationData.appointmentTime}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* اطلاعات مجموعه */}
          <div className="text-center mb-6">
            <p className="text-gray-700 font-medium">
              مجموعه درمانی از راه دور حیوانات خانگی
            </p>
            <p className="text-cyan-600 font-bold text-lg">
              حمیدرضا فتاحیان
            </p>
          </div>

          {/* اسپینر و شمارش معکوس */}
          <div className="border-t border-gray-200 pt-6">
            {isRedirecting ? (
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>
                <span className="text-gray-600">در حال انتقال...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>
                <span className="text-gray-600">
                  انتقال به سایت اصلی در {countdown} ثانیه...
                </span>
              </div>
            )}
            
            {/* دکمه انتقال دستی */}
            <div className="mt-4">
              <button
                onClick={() => {
                  try {
                    window.location.href = 'https://fattahianpethospital.com/';
                  } catch {
                    window.open('https://fattahianpethospital.com/', '_blank');
                  }
                }}
                className="text-cyan-600 hover:text-cyan-700 text-sm underline transition-colors"
              >
                انتقال فوری به سایت
              </button>
            </div>
          </div>
        </div>

        {/* اطلاعات تماس اضافی */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            در صورت بروز مشکل، با شماره پشتیبانی تماس بگیرید
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;