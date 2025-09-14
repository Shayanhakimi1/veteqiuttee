import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { paymentAPI } from '../services/api';
import { logger } from '../utils/logger';
import Button from '../components/common/Button';
import InputField from '../components/common/InputField';
import ProgressBar from '../components/common/ProgressBar';
import Notification from '../components/common/Notification';
import FileUploader from '../components/common/FileUploader';


// صفحه پرداخت
const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { consultationData, savePaymentData, clearConsultationData } = useApp();
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
  
  // قیمت ثابت برای همه انواع مشاوره
  const amount = 280000;

  // تولید تاریخ‌های روزهای فرد (یکشنبه، سه‌شنبه، پنج‌شنبه)
  const generateDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 1; i <= 21; i++) {
      // بررسی 21 روز آینده برای پیدا کردن روزهای مورد نظر
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      // بررسی اینکه روز یکشنبه (0)، سه‌شنبه (2) یا پنج‌شنبه (4) باشد
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 2 || dayOfWeek === 4) {
        // یکشنبه، سه‌شنبه، پنج‌شنبه
        // تبدیل به تاریخ شمسی (ساده‌سازی شده)
        const persianDate = date.toLocaleDateString("fa-IR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        dates.push({
          id: date.toISOString().split("T")[0],
          display: persianDate,
          date: date,
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

        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        slots.push({
          id: timeString,
          display: timeString,
          available: Math.random() > 0.2, // شبیه‌سازی در دسترس بودن
        });
      }
    }

    return slots;
  };

  const availableDates = generateDates();
  const availableTimeSlots = generateTimeSlots();

  // بارگذاری داده‌های مشاوره
  useEffect(() => {
    // Check if consultation data exists in context or navigation state
    const hasConsultationData = consultationData || location.state;
    if (!hasConsultationData) {
      navigate('/consultation');
    }
  }, [consultationData, location.state, navigate]);

  // ذخیره خودکار داده‌های فرم به صورت دوره‌ای (صرفاً وابسته به فرم)
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (Object.keys(formData).some((key) => formData[key] !== "")) {
        localStorage.setItem("paymentFormData", JSON.stringify(formData));
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
      logger.error('Copy to clipboard failed', { error: err });
    }
  };

  // انتخاب تاریخ
  const handleDateSelect = (dateId) => {
    setFormData((prev) => ({
      ...prev,
      selectedDate: dateId,
    }));

    // پاک کردن خطای مربوطه
    if (errors.selectedDate) {
      setErrors((prev) => ({ ...prev, selectedDate: "" }));
    }
  };

  // انتخاب ساعت
  const handleTimeSelect = (timeId) => {
    setFormData((prev) => ({
      ...prev,
      selectedTime: timeId,
    }));

    // پاک کردن خطای مربوطه
    if (errors.selectedTime) {
      setErrors((prev) => ({ ...prev, selectedTime: "" }));
    }
  };

  // تأیید شماره تلفن
  const handlePhoneConfirm = (e) => {
    setFormData((prev) => ({
      ...prev,
      confirmPhone: e.target.checked,
    }));

    // پاک کردن خطای مربوطه
    if (errors.confirmPhone) {
      setErrors((prev) => ({ ...prev, confirmPhone: "" }));
    }
  };



  // ارسال فرم پرداخت
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // اعتبارسنجی فرم
      const newErrors = {};
      if (!formData.selectedDate) {
        newErrors.selectedDate = 'انتخاب تاریخ الزامی است';
      }
      if (!formData.selectedTime) {
        newErrors.selectedTime = 'انتخاب زمان الزامی است';
      }
      if (!formData.confirmPhone) {
        newErrors.confirmPhone = 'تأیید شماره تماس الزامی است';
      }
      if (formData.paymentReceipt.length === 0) {
        newErrors.paymentReceipt = 'بارگذاری رسید پرداخت الزامی است';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsLoading(false);
        return;
      }

      // آماده‌سازی داده‌های نهایی
      const paymentData = {
        ...consultationData,
        ...formData,
        amount,
        paymentDate: new Date().toISOString(),
        status: 'pending'
      };

      // ذخیره داده‌ها
      await savePaymentData(paymentData);

      // پاک کردن اطلاعات مشاوره بعد از پرداخت موفق
      clearConsultationData();

      // نمایش پیام موفقیت
      setShowNotification(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (error) {
      logger.error('Payment registration failed', { error });
      setErrors({ submit: 'خطا در ثبت پرداخت. لطفاً دوباره تلاش کنید.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* هدر */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <ProgressBar currentStep={4} totalSteps={4} />
          </div>
        </div>
      </div>

      {/* محتوای اصلی */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* نمایش قیمت و نوع مشاوره */}
        <div className="text-center mb-6">
          <div className="text-white px-6 py-3 rounded-xl inline-block bg-gradient-to-r from-cyan-500 to-teal-500">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-lg">💳</span>
              <span className="text-sm font-medium">پرداخت هزینه مشاوره</span>
            </div>
            <div>
              <span className="text-sm font-medium">هزینه مشاوره:</span>
              <span className="text-lg font-bold mr-2">{amount.toLocaleString()} تومان</span>
            </div>
          </div>
        </div>

        {/* نمایش شماره کارت */}
        <div className="text-center mb-6">
          <div className="text-white px-6 py-3 rounded-xl inline-block bg-gradient-to-r from-cyan-500 to-teal-500">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-lg">💳</span>
              <span className="text-sm font-medium">شماره کارت:</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-lg font-bold">{cardNumber}</span>
              <button
                type="button"
                onClick={copyCardNumber}
                className="text-white/80 hover:text-white text-sm"
              >
                کپی
              </button>
            </div>
            {showCopyAlert && (
              <p className="text-white/90 text-xs mt-1">شماره کارت کپی شد</p>
            )}
          </div>
        </div>

        {/* فرم انتخاب زمان و تایید */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
          {/* بارگذاری رسید پرداخت */}
          <div>
            <label className="block text-gray-700 mb-2">بارگذاری رسید پرداخت</label>
            <FileUploader
              files={formData.paymentReceipt}
              onChange={(files) => setFormData({ ...formData, paymentReceipt: files })}
              accept="image/*"
              maxFiles={3}
              label="رسید پرداخت را بارگذاری کنید"
            />
            {errors.paymentReceipt && (
              <p className="text-red-500 text-sm mt-2">{errors.paymentReceipt}</p>
            )}
          </div>

          {/* انتخاب تاریخ */}
          <div>
            <label className="block text-gray-700 mb-2">تاریخ مشاوره</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {availableDates.map((date) => (
                <button
                  type="button"
                  key={date.id}
                  onClick={() => handleDateSelect(date.id)}
                  className={`p-3 rounded-xl border transition-all ${
                    formData.selectedDate === date.id
                      ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                      : "border-gray-200 hover:border-gray-300"
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
          <div>
            <label className="block text-gray-700 mb-2">ساعت مشاوره</label>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {availableTimeSlots.map((slot) => (
                <button
                  type="button"
                  key={slot.id}
                  onClick={() => handleTimeSelect(slot.id)}
                  disabled={!slot.available}
                  className={`p-2 rounded-xl border transition-all ${
                    formData.selectedTime === slot.id
                      ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                      : "border-gray-200 hover:border-gray-300"
                  } ${!slot.available ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {slot.display}
                </button>
              ))}
            </div>
            {errors.selectedTime && (
              <p className="text-red-500 text-sm mt-2">{errors.selectedTime}</p>
            )}
          </div>

          {/* تایید شماره تلفن */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="confirmPhone"
              checked={formData.confirmPhone}
              onChange={handlePhoneConfirm}
              className="mr-2"
            />
            <label htmlFor="confirmPhone" className="text-gray-700">
              تایید می‌کنم شماره تلفن ثبت‌شده صحیح است
            </label>
          </div>
          {errors.confirmPhone && (
            <p className="text-red-500 text-sm mt-2">{errors.confirmPhone}</p>
          )}



          {/* دکمه ارسال */}
          <div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "در حال هدایت به پرداخت..." : "تایید و ادامه"}
            </Button>
            {errors.submit && (
              <p className="text-red-500 text-sm mt-2">{errors.submit}</p>
            )}
          </div>
        </form>

        {/* اعلان موقت */}
        {showNotification && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg">
            اطلاعات شما ذخیره شد
          </div>
        )}
      </div>

      {/* فوتر ساده با لوگو */}
      <div className="py-6 text-center text-white opacity-80">

        <p className="text-sm">بیمارستان دامپزشکی دکتر فتاحیان</p>
      </div>

      {/* نمایش پیام موفقیت */}
      {showNotification && (
        <Notification
          type="success"
          message="پرداخت با موفقیت ثبت شد. در حال هدایت به داشبورد..."
          onClose={() => setShowNotification(false)}
        />
      )}
    </div>
  );
};

export default Payment;
