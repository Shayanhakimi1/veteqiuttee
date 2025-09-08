import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import Button from '../components/common/Button';
import InputField from '../components/common/InputField';
import ProgressBar from '../components/common/ProgressBar';
import Notification from '../components/common/Notification';
import FileUploader from '../components/common/FileUploader';
import fatahiyanLogo from '../assets/fattahian3.png';

// صفحه پرداخت
const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, consultationData, savePaymentData } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [errors, setErrors] = useState({});
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [formData, setFormData] = useState({
    paymentReceipt: [],
    selectedDate: '',
    selectedTime: '',
    confirmPhone: false
  });

  // شماره کارت برای پرداخت
  const cardNumber = '6037-9976-1234-5678';
  
  // دریافت نوع مشاوره و قیمت از localStorage
  const consultationType = localStorage.getItem('selectedConsultationType');
  const amount = 280000; // قیمت ثابت برای همه انواع مشاوره

  // تولید تاریخ‌های روزهای فرد (یکشنبه، سه‌شنبه، پنج‌شنبه)
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 21; i++) { // بررسی 21 روز آینده برای پیدا کردن روزهای مورد نظر
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // بررسی اینکه روز یکشنبه (0)، سه‌شنبه (2) یا پنج‌شنبه (4) باشد
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 2 || dayOfWeek === 4) { // یکشنبه، سه‌شنبه، پنج‌شنبه
        // تبدیل به تاریخ شمسی (ساده‌سازی شده)
        const persianDate = date.toLocaleDateString('fa-IR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        dates.push({
          id: date.toISOString().split('T')[0],
          display: persianDate,
          date: date
        });
        
        // محدود کردن به 9 روز (3 هفته × 3 روز)
        if (dates.length >= 9) break;
      }
    }
    
    return dates;
  };

  // تولید ساعت‌های قابل انتخاب (5 عصر تا 9 شب)
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 17; // 5 عصر
    const endHour = 21; // 9 شب
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        // اگر ساعت 21 باشد، فقط 21:00 را اضافه کن
        if (hour === 21 && minute > 0) break;
        
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          id: timeString,
          display: timeString,
          available: Math.random() > 0.2 // شبیه‌سازی در دسترس بودن
        });
      }
    }
    
    return slots;
  };

  const availableDates = generateDates();
  const availableTimeSlots = generateTimeSlots();

  // ذخیره خودکار داده‌ها
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (Object.keys(formData).some(key => formData[key] !== '')) {
        localStorage.setItem('paymentFormData', JSON.stringify(formData));
      }
    }, 5000);

    return () => clearInterval(autoSaveInterval);
  }, [formData]);

  // کپی کردن شماره کارت
  const copyCardNumber = async () => {
    try {
      await navigator.clipboard.writeText(cardNumber);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    } catch (err) {
      console.error('خطا در کپی کردن:', err);
    }
  };

  // آپلود رسید پرداخت
  const handleReceiptUpload = (file) => {
    if (file) {
      setFormData(prev => ({
        ...prev,
        paymentReceipt: [file]
      }));
      
      // پاک کردن خطای مربوطه
      if (errors.paymentReceipt) {
        setErrors(prev => ({ ...prev, paymentReceipt: '' }));
      }
    }
  };

  // انتخاب تاریخ
  const handleDateSelect = (dateId) => {
    setFormData(prev => ({
      ...prev,
      selectedDate: dateId
    }));
    
    // پاک کردن خطای مربوطه
    if (errors.selectedDate) {
      setErrors(prev => ({ ...prev, selectedDate: '' }));
    }
  };

  // انتخاب ساعت
  const handleTimeSelect = (timeId) => {
    setFormData(prev => ({
      ...prev,
      selectedTime: timeId
    }));
    
    // پاک کردن خطای مربوطه
    if (errors.selectedTime) {
      setErrors(prev => ({ ...prev, selectedTime: '' }));
    }
  };

  // تأیید شماره تلفن
  const handlePhoneConfirm = (e) => {
    setFormData(prev => ({
      ...prev,
      confirmPhone: e.target.checked
    }));
    
    // پاک کردن خطای مربوطه
    if (errors.confirmPhone) {
      setErrors(prev => ({ ...prev, confirmPhone: '' }));
    }
  };

  // اعتبارسنجی فرم
  const validateForm = () => {
    const newErrors = {};

    if (!formData.paymentReceipt || formData.paymentReceipt.length === 0) {
      newErrors.paymentReceipt = 'لطفاً رسید پرداخت را آپلود کنید';
    }

    if (!formData.selectedDate) {
      newErrors.selectedDate = 'لطفاً تاریخ مشاوره را انتخاب کنید';
    }

    if (!formData.selectedTime) {
      newErrors.selectedTime = 'لطفاً ساعت مشاوره را انتخاب کنید';
    }

    if (!formData.confirmPhone) {
      newErrors.confirmPhone = 'لطفاً تأیید کنید که شماره تلفن صحیح است';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ارسال فرم
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    // شبیه‌سازی پردازش پرداخت
    setTimeout(() => {
      const paymentData = {
        ...formData,
        consultationData: location.state,
        paymentDate: new Date().toISOString(),
        amount: amount,
        status: 'completed'
      };
      
      localStorage.setItem('paymentData', JSON.stringify(paymentData));
      localStorage.removeItem('consultationData');
      
      setIsLoading(false);
      
      // نمایش نوتیفیکیشن موفقیت
      setShowNotification(true);
      
      // هدایت به صفحه اصلی پس از 3 ثانیه
      setTimeout(() => {
        navigate('/');
      }, 3000);
    }, 2000);
  };

  // بررسی معتبر بودن فرم
  const isFormValid = () => {
    return formData.paymentReceipt && 
           Array.isArray(formData.paymentReceipt) && 
           formData.paymentReceipt.length > 0 &&
           formData.selectedDate &&
           formData.selectedTime &&
           formData.confirmPhone;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* هدر */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <a href="https://fattahianpethospital.com/" target="_blank" rel="noopener noreferrer">
                <img 
                  src={fatahiyanLogo} 
                  alt="لوگو بیمارستان حیوانات خانگی دکتر فتاحیان" 
                  className="w-24 h-24 sm:w-36 sm:h-36 md:w-44 md:h-44 object-contain cursor-pointer hover:opacity-80 transition-opacity"
                />
              </a>
              <div>
                <h1 className="text-xs sm:text-sm md:text-base font-bold text-gray-800">مجموعه درمانی حیوانات خانگی</h1>
                <p className="text-xs text-gray-600">حمیدرضا فتاحیان</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              size="sm"
              className="text-xs sm:text-sm"
            >
              بازگشت به داشبورد
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* نوار پیشرفت */}
        <div className="mb-8">
          <ProgressBar currentStep={3} totalSteps={4} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* هزینه پرداخت */}
          <div className="bg-white rounded-xl p-3 sm:p-6 shadow-lg">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
              💳 هزینه پرداخت
            </h3>
            
            {/* کارت پرداخت */}
            <div className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white p-3 sm:p-6 rounded-xl mb-4 sm:mb-6">
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <div>
                  <p className="text-xs sm:text-sm opacity-90">مبلغ قابل پرداخت</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold">{amount.toLocaleString()}</p>
                  <p className="text-sm sm:text-lg">تومان</p>
                </div>
                <div className="text-right">
                   <p className="text-xs font-bold">مجموعه درمانی حیوانات خانگی</p>
                   <p className="text-xs font-bold">حمیدرضا فتاحیان</p>
                 </div>
              </div>
              
              <div className="mt-4 sm:mt-6">
                <p className="text-xs sm:text-sm opacity-90 mb-2">شماره کارت:</p>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-mono text-sm sm:text-lg font-bold">{cardNumber}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copyCardNumber}
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30 text-xs sm:text-sm"
                  >
                    کپی
                  </Button>
                </div>
                {showCopyAlert && (
                  <p className="text-white text-sm mt-2">✅ شماره کارت کپی شد</p>
                )}
              </div>
            </div>

            {/* هشدار پرداخت */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-yellow-600">⚠️</span>
                <p className="text-sm text-gray-700">
                  پس از انجام پرداخت، حتماً فیش پرداخت را در بخش زیر آپلود کنید
                </p>
              </div>
            </div>

            {/* آپلود فیش پرداخت */}
            <div>
              <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                 📄 آپلود فیش پرداخت <span className="text-red-500">*</span>
               </h4>
              <FileUploader
                onFileSelect={handleReceiptUpload}
                accept="image/*,.pdf"
                maxSize={5}
                label="فایل‌های خود را اینجا بکشید یا کلیک کنید"
              />
              <p className="text-sm text-gray-500 mt-2">حداکثر اندازه فایل: 5MB</p>
              {errors.paymentReceipt && (
                <p className="text-red-500 text-sm mt-1">{errors.paymentReceipt}</p>
              )}
            </div>
          </div>

          {/* انتخاب زمان مشاوره */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              📅 انتخاب زمان مشاوره
            </h3>
            
            {/* انتخاب تاریخ */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                تاریخ مشاوره <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableDates.map((date) => (
                  <button
                    key={date.id}
                    type="button"
                    onClick={() => handleDateSelect(date.id)}
                    className={`p-3 rounded-lg border text-sm transition-all ${
                      formData.selectedDate === date.id
                        ? 'bg-cyan-500 text-white border-cyan-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-cyan-300'
                    }`}
                  >
                    {date.display}
                  </button>
                ))}
              </div>
              {errors.selectedDate && (
                <p className="text-red-500 text-sm mt-2">{errors.selectedDate}</p>
              )}
            </div>

            {/* انتخاب ساعت */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                ساعت مشاوره <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {availableTimeSlots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => slot.available && handleTimeSelect(slot.id)}
                    disabled={!slot.available}
                    className={`p-2 rounded border text-sm transition-all ${
                      !slot.available
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : formData.selectedTime === slot.id
                        ? 'bg-cyan-500 text-white border-cyan-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-cyan-300'
                    }`}
                  >
                    {slot.display}
                  </button>
                ))}
              </div>
              {errors.selectedTime && (
                <p className="text-red-500 text-sm mt-2">{errors.selectedTime}</p>
              )}
            </div>

            {/* تأیید شماره تلفن */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="confirmPhone"
                  checked={formData.confirmPhone}
                  onChange={handlePhoneConfirm}
                  className="mt-1"
                />
                <label htmlFor="confirmPhone" className="text-sm text-gray-700">
                  تأیید می‌کنم که شماره تلفن <strong>{userData?.phone || 'ثبت شده'}</strong> صحیح است و در زمان تعیین شده پاسخگو خواهم بود. <span className="text-red-500">*</span>
                </label>
              </div>
              {errors.confirmPhone && (
                <p className="text-red-500 text-sm mt-2">{errors.confirmPhone}</p>
              )}
            </div>
          </div>

          {/* دکمه‌های عملیات */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/consultation')}
              disabled={isLoading}
            >
              بازگشت
            </Button>
            
            <Button
              type="submit"
              disabled={!isFormValid() || isLoading}
              className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  در حال پردازش...
                </div>
              ) : (
                'تکمیل پرداخت'
              )}
            </Button>
          </div>
        </form>
      </div>
      
      {/* نوتیفیکیشن موفقیت پرداخت */}
      <Notification
        show={showNotification}
        type="success"
        title="پرداخت موفق"
        message="پرداخت شما با موفقیت انجام شد. مشاورین ما در ساعت و روز تعیین شده با شما تماس خواهند گرفت."
        duration={3000}
        position="top-center"
        onClose={() => setShowNotification(false)}
      />
    </div>
  );
};

export default Payment;