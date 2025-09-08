import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { consultationsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { translateError } from '../utils/errorTranslations';

const PaymentVerify = () => {
  const [message, setMessage] = useState('در حال تأیید پرداخت...');
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  // ... existing code ...
  // Helper: safely load consultationData from localStorage (fallback instead of relying on context)
  const getStoredConsultationData = () => {
    try {
      const raw = localStorage.getItem('consultationData');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('خطا در خواندن consultationData از localStorage:', e);
      return null;
    }
  };

  useEffect(() => {
    // بررسی احراز هویت
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const verifyPayment = async () => {
      const params = new URLSearchParams(location.search);
      const status = params.get('Status');
      const authority = params.get('Authority');

      if (status !== 'OK') {
        setError('پرداخت توسط کاربر لغو شد یا در انجام آن خطایی رخ داده است.');
        setTimeout(() => navigate('/payment'), 3000);
        return;
      }

      try {
        // ارسال درخواست به بک‌اند برای تأیید نهایی
        const response = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            authority,
            amount: 280000, // مبلغ باید با مبلغ اولیه یکسان باشد
           }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setMessage('پرداخت با موفقیت تأیید شد. در حال ثبت نهایی اطلاعات...');
          
          // پس از تایید پرداخت، اطلاعات مشاوره را در بک‌اند ذخیره می‌کنیم
          await saveConsultation();

          // انتقال به صفحه موفقیت
          navigate('/payment-success');
        } else {
          throw new Error(result.message || 'خطا در تأیید پرداخت');
        }
      } catch (err) {
        const translatedError = translateError(err.message);
        setError(`خطا: ${translatedError}`);
        setTimeout(() => navigate('/payment'), 5000);
      }
    };

    const saveConsultation = async () => {
      try {
        const data = getStoredConsultationData();
        if (!data) {
          throw new Error('اطلاعات لازم برای ثبت مشاوره کامل نیست.');
        }

        // ارسال همان داده‌های ذخیره‌شده (سرور userId را از توکن استخراج می‌کند)
        await consultationsAPI.create(data);
        
        // پاک کردن داده‌های موقت پس از ثبت موفق
        localStorage.removeItem('consultationData');
        localStorage.removeItem('appointmentTime');

      } catch (err) {
        // اگر در این مرحله خطا رخ دهد، باید به کاربر اطلاع داده شود
        // که پرداخت موفق بوده اما ثبت مشاوره با مشکل مواجه شده است.
        const translatedError = translateError(err.message);
        setError(`پرداخت شما موفق بود، اما در ثبت نهایی مشاوره خطایی رخ داد: ${translatedError}. لطفاً با پشتیبانی تماس بگیرید.`);
        // در این حالت کاربر را به داشبورد منتقل می‌کنیم چون پرداخت انجام شده
        setTimeout(() => navigate('/dashboard'), 8000);
      }
    };


    verifyPayment();
  }, [location, navigate, isAuthenticated]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8">
        <LoadingSpinner />
        <h1 className="text-2xl font-semibold text-gray-800 mt-6">{message}</h1>
        {error && (
          <div className="mt-4 text-red-600 bg-red-100 p-4 rounded-lg">
            <p>{error}</p>
            <p>شما تا چند لحظه دیگر به صفحه پرداخت منتقل خواهید شد.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentVerify;