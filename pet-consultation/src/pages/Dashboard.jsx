import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import Button from "../components/common/Button";
import Alert from "../components/common/Alert";
import fatahiyanLogo from "../assets/fattahian3.png";

// صفحه داشبورد
const Dashboard = () => {
  const [selectedConsultationType] = useState('specialist');
  const navigate = useNavigate();
  const { userData, selectedPet, clearAllData } = useApp();

  // مدیریت خروج از حساب
  const handleLogout = () => {
    clearAllData();
    // Clear auth token from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem("rememberLogin");
    localStorage.removeItem("paymentData");
    navigate("/login");
  };


  // مدیریت درخواست مشاوره جدید
  const handleNewConsultation = () => {
    if (!selectedConsultationType) {
      alert("لطفاً نوع مشاوره را انتخاب کنید");
      return;
    }

    // ذخیره نوع مشاوره انتخاب شده
    localStorage.setItem("selectedConsultationType", selectedConsultationType);
    navigate("/consultation");
  };

  // گرفتن نام کاربر
  const getUserFirstName = () => {
    if (userData?.fullName) {
      return userData.fullName.split(" ")[0];
    }
    return "کاربر عزیز";
  };

  // گرفتن ساعت فعلی برای سلام مناسب
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "صبح بخیر";
    if (hour < 17) return "ظهر بخیر";
    if (hour < 20) return "عصر بخیر";
    return "شب بخیر";
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* هدر */}
      <div className="card bg-white shadow-soft border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
          <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
            {/* لوگو */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              <a
                href="https://fattahianpethospital.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform duration-300 hover:scale-105"
              >
                <img
                  src={fatahiyanLogo}
                  alt="لوگو بیمارستان حیوانات خانگی دکتر فتاحیان"
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 object-contain cursor-pointer hover:opacity-90 transition-opacity rounded-xl shadow-soft"
                />
              </a>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg lg:text-xl font-bold text-neutral-800">
                  مرکز مشاوره
                </span>
                <span className="text-xs sm:text-sm text-neutral-600">
                  حیوانات خانگی
                </span>
              </div>
            </div>

            {/* دکمه خروج */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-error-600 border-error-300 hover:bg-error-50 hover:border-error-400 text-xs sm:text-sm font-medium px-3 sm:px-4 py-2"
            >
              خروج
            </Button>
          </div>
        </div>
      </div>

      {/* محتوای اصلی */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* پیام خوش‌آمدگویی */}
        <div className="card-glass rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 lg:mb-10">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-800 mb-2 sm:mb-3">
              {getGreeting()} {getUserFirstName()}! 👋
            </h1>
            <p className="text-neutral-600 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed max-w-4xl mx-auto">
              به پنل کاربری مرکز مشاوره راه دور سلامت حیوانات خانگی خود خوش
              آمدید
            </p>
          </div>
        </div>

        {/* اطلاعات کاربر */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          {/* اطلاعات حیوان خانگی */}
          <div className="card-elevated hover:shadow-lg transition-all duration-300 p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-xl sm:text-2xl">{selectedPet?.emoji || "🐾"}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-neutral-800">
                حیوان خانگی شما
              </h2>
            </div>

            {selectedPet ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center py-2 sm:py-3 border-b border-neutral-100">
                  <span className="text-neutral-600 font-medium text-sm sm:text-base">نام:</span>
                  <span className="font-semibold text-neutral-800 text-sm sm:text-base">
                    {userData?.petName || selectedPet.name || "نامشخص"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 sm:py-3 border-b border-neutral-100">
                  <span className="text-neutral-600 font-medium text-sm sm:text-base">نوع:</span>
                  <span className="font-semibold text-neutral-800 text-sm sm:text-base">
                    {selectedPet.type || selectedPet.name || "نامشخص"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 sm:py-3">
                  <span className="text-neutral-600 font-medium text-sm sm:text-base">نژاد:</span>
                  <span className="font-semibold text-neutral-800 text-sm sm:text-base">
                    {userData?.petBreed || selectedPet.breed || "نامشخص"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">اطلاعات حیوان خانگی یافت نشد</p>
              </div>
            )}
          </div>

          {/* اطلاعات کاربری */}
          <div className="card-elevated hover:shadow-lg transition-all duration-300 p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary-100 rounded-full flex items-center justify-center">
                <span className="text-xl sm:text-2xl">👤</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-neutral-800">
                اطلاعات کاربری
              </h2>
            </div>

            {userData ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center py-2 sm:py-3 border-b border-neutral-100">
                  <span className="text-neutral-600 font-medium text-sm sm:text-base">نام و نام‌خانوادگی:</span>
                  <span className="font-semibold text-neutral-800 text-sm sm:text-base">
                    {userData.fullName}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 sm:py-3 border-b border-neutral-100">
                  <span className="text-neutral-600 font-medium text-sm sm:text-base">شماره موبایل:</span>
                  <span className="font-semibold text-neutral-800 font-mono text-sm sm:text-base">
                    {userData.mobile}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 sm:py-3">
                  <span className="text-neutral-600 font-medium text-sm sm:text-base">تاریخ عضویت:</span>
                  <span className="font-semibold text-neutral-800 text-sm sm:text-base">
                    {userData.registrationDate
                      ? new Date(userData.registrationDate).toLocaleDateString(
                          "fa-IR"
                        )
                      : "نامشخص"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-neutral-500">اطلاعات کاربری یافت نشد</p>
              </div>
            )}
          </div>
        </div>

        {/* دکمه درخواست مشاوره */}
        <div className="card-glass rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 text-center mt-8 sm:mt-10 lg:mt-12">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl sm:text-3xl">📞</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
              مشاوره تلفنی
            </h3>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              با متخصصان مجرب ما در زمینه سلامت حیوانات خانگی خود مشورت کنید
            </p>
          </div>

          {/* مشاوره تخصصی */}
          <div className="mb-6 sm:mb-8">
            <div className="card-elevated border-2 border-primary-200 bg-primary-50 p-4 sm:p-6 lg:p-8 text-center hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-3 sm:mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 text-xl sm:text-2xl">📋</span>
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">
                مشاوره تخصصی
              </h4>
              <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                مشاوره تخصصی با دامپزشکان مجرب
              </p>
              <div className="bg-success-50 border border-success-200 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
                <p className="text-success-700 font-bold text-base sm:text-lg">
                  💰 هزینه: 280,000 تومان
                </p>
              </div>
              <div className="mt-3 sm:mt-4">
                <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-primary-100 text-primary-700">
                  ✓ انتخاب شده
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleNewConsultation}
            className={`w-full py-3 sm:py-4 text-base sm:text-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${
              !selectedConsultationType ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!selectedConsultationType}
          >
            🚀 درخواست مشاوره جدید
          </Button>

          {!selectedConsultationType && (
            <p className="text-center text-error-500 text-xs sm:text-sm mt-2 sm:mt-3 font-medium">
              لطفاً نوع مشاوره را انتخاب کنید
            </p>
          )}
        </div>

        {/* راهنمای سریع */}
        <div className="mt-12 sm:mt-14 lg:mt-16">
          <div className="text-center mb-8 sm:mb-10">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
              راهنمای سریع
            </h3>
            <p className="text-gray-600 text-base sm:text-lg">
              خدمات ما را بهتر بشناسید
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="card-elevated text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-3 sm:mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-2xl sm:text-3xl">🩺</span>
              </div>
              <h4 className="font-bold text-gray-800 mb-2 sm:mb-3 text-base sm:text-lg">مشاوره تخصصی</h4>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                دریافت مشاوره از دامپزشکان مجرب در زمینه‌های مختلف
              </p>
            </div>

            <div className="card-elevated text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-3 sm:mb-4 bg-secondary-100 rounded-full flex items-center justify-center">
                <span className="text-2xl sm:text-3xl">📱</span>
              </div>
              <h4 className="font-bold text-gray-800 mb-2 sm:mb-3 text-base sm:text-lg">تماس تلفنی</h4>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                مشاوره در زمان تعیین شده از طریق تماس تلفنی
              </p>
            </div>

            <div className="card-elevated text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-3 sm:mb-4 bg-success-100 rounded-full flex items-center justify-center">
                <span className="text-2xl sm:text-3xl">🕐</span>
              </div>
              <h4 className="font-bold text-gray-800 mb-2 sm:mb-3 text-base sm:text-lg">
                24/7 پشتیبانی
              </h4>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                پشتیبانی و راهنمایی در تمام ساعات شبانه‌روز
              </p>
            </div>
          </div>
        </div>

        {/* فوتر */}
        <footer className="mt-12 sm:mt-14 lg:mt-16 pt-6 sm:pt-8 border-t border-neutral-200">
          <div className="text-center">
            <p className="text-neutral-600 mb-3 sm:mb-4 text-sm sm:text-base px-4">
              © 2024 مرکز مشاوره حیوانات خانگی دکتر فتاحیان. تمامی حقوق محفوظ
              است.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6">
              <a
                href="https://fattahianpethospital.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 font-medium transition-colors text-sm sm:text-base"
              >
                وب‌سایت بیمارستان
              </a>
              <span className="text-neutral-400 hidden sm:inline">|</span>
              <a
                href="tel:+982188776655"
                className="text-primary-600 hover:text-primary-700 font-medium transition-colors text-sm sm:text-base"
              >
                تماس: 021-88776655
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
