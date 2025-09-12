import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import Button from '../components/common/Button';
import { logger } from '../utils/logger';
import { CheckCircle, Clock, Calendar } from 'lucide-react';

const FinalConfirmation = () => {
  const navigate = useNavigate();
  const isAuthenticated = true; // Assuming user is authenticated at this point
  const [countdown, setCountdown] = useState(5);
  const [consultationData, setConsultationData] = useState(null);

  useEffect(() => {
    // بررسی احراز هویت
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // بارگذاری اطلاعات مشاوره از localStorage
    const savedData = localStorage.getItem('consultationData');
    if (savedData) {
      try {
        setConsultationData(JSON.parse(savedData));
      } catch (error) {
        logger.error('Failed to load consultation information', { error });
      }
    }

    // شروع شمارش معکوس
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // انتقال به سایت فتاحیان
          window.location.href = 'https://fattahianpethospital.com/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAuthenticated, navigate]);

  // فرمت کردن تاریخ
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* نوتیفیکیشن اصلی */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          {/* آیکون تأیید */}
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>

          {/* عنوان */}
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            درخواست شما با موفقیت ثبت شد!
          </h1>

          {/* پیام اصلی */}
          <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-6 mb-6">
            <p className="text-gray-700 leading-relaxed">
              با تشکر از انتخاب شما. همکاران ما در تاریخ و ساعت انتخاب شده با شما تماس خواهند گرفت.
              <br />
              <span className="font-semibold text-cyan-700">
                مجموعه درمانی از راه دور حیوانات خانگی حمیدرضا فتاحیان
              </span>
            </p>
          </div>

          {/* اطلاعات مشاوره */}
          {consultationData && (
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {/* اطلاعات شما */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  اطلاعات شما
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium">نام:</span> {consultationData?.user?.fullName || '—'}</p>
                  <p><span className="font-medium">موبایل:</span> {consultationData?.user?.mobile || '—'}</p>
                  <p><span className="font-medium">حیوان:</span> {consultationData?.pet?.name || '—'}</p>
                </div>
              </div>

              {/* زمان مشاوره */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  زمان مشاوره
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {formatDate(consultationData.appointmentDate)}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    ساعت {consultationData.appointmentTime}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-3 h-3" />
                    تماس تلفنی
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* اسپینر لودینگ و شمارش معکوس */}
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
            <p className="text-gray-600">
              در حال انتقال به سایت بیمارستان حیوانات خانگی فتاحیان...
            </p>
            <div className="bg-cyan-100 text-cyan-800 px-4 py-2 rounded-full font-medium">
              {countdown} ثانیه
            </div>
          </div>

          {/* دکمه انتقال فوری */}
          <div className="mt-6">
            <button
              onClick={() => window.location.href = 'https://fattahianpethospital.com/'}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
            >
              انتقال فوری به سایت
            </button>
          </div>
        </div>

        {/* اطلاعات تماس */}
        <div className="mt-6 text-center text-white">
          <p className="text-sm opacity-90">
            در صورت نیاز به راهنمایی بیشتر، با ما تماس بگیرید
          </p>
          <p className="text-lg font-semibold mt-1">
            📞 تلفن تماس: 021-44291494
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinalConfirmation;