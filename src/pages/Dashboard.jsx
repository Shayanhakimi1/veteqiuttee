import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import Button from "../components/common/Button";
import Alert from "../components/common/Alert";
import fatahiyanLogo from "../assets/fattahian3.png";

// صفحه داشبورد
const Dashboard = () => {
  const [selectedConsultationType, setSelectedConsultationType] = useState("");
  const navigate = useNavigate();
  const { userData, selectedPet, clearAllData, setIsLoggedIn } = useApp();

  // مدیریت خروج از حساب
  const handleLogout = () => {
    clearAllData();
    setIsLoggedIn(false);
    localStorage.removeItem("rememberLogin");
    localStorage.removeItem("paymentData");
    navigate("/login");
  };

  // مدیریت انتخاب نوع مشاوره
  const handleConsultationTypeSelect = (type) => {
    setSelectedConsultationType(type);
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
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            {/* لوگو */}
            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href="https://fattahianpethospital.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={fatahiyanLogo}
                  alt="لوگو بیمارستان حیوانات خانگی دکتر فتاحیان"
                  className="w-24 h-24 sm:w-36 sm:h-36 md:w-44 md:h-44 object-contain cursor-pointer hover:opacity-80 transition-opacity"
                />
              </a>
              <span className="text-sm sm:text-lg font-bold text-gray-800">
                مرکز مشاوره
              </span>
            </div>

            {/* دکمه خروج */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 border-red-300 hover:bg-red-50 text-xs sm:text-sm"
            >
              خروج
            </Button>
          </div>
        </div>
      </div>

      {/* محتوای اصلی */}
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* پیام خوش‌آمدگویی */}
        <div className="card mb-4 sm:mb-8">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              {getGreeting()} {getUserFirstName()}! 👋
            </h1>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg">
              به پنل کاربری مرکز مشاوره راه دور سلامت حیوانات خانگی خود خوش
              آمدید
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
          {/* اطلاعات حیوان خانگی */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{selectedPet?.emoji || "🐾"}</span>
              <h2 className="text-xl font-bold text-gray-800">
                حیوان خانگی شما
              </h2>
            </div>

            {selectedPet && userData ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">نوع:</span>
                  <span className="font-medium text-gray-800">
                    {selectedPet.name}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">نام:</span>
                  <span className="font-medium text-gray-800">
                    {userData.petName}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">نژاد:</span>
                  <span className="font-medium text-gray-800">
                    {userData.petBreed}
                  </span>
                </div>
                {userData.petAge && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">سن:</span>
                    <span className="font-medium text-gray-800">
                      {userData.petAge}
                    </span>
                  </div>
                )}
                {userData.petGender && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">جنسیت:</span>
                    <span className="font-medium text-gray-800">
                      {userData.petGender}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">وضعیت عقیم‌سازی:</span>
                  <span className="font-medium text-gray-800">
                    {userData.isNeutered ? (
                      <span className="text-green-600">✓ عقیم شده</span>
                    ) : (
                      <span className="text-orange-600">✗ عقیم نشده</span>
                    )}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  اطلاعات حیوان خانگی یافت نشد
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/pet-selection")}
                >
                  انتخاب حیوان خانگی
                </Button>
              </div>
            )}
          </div>

          {/* اطلاعات کاربری */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">👤</span>
              <h2 className="text-xl font-bold text-gray-800">اطلاعات شما</h2>
            </div>

            {userData ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">نام:</span>
                  <span className="font-medium text-gray-800">
                    {userData.fullName}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">موبایل:</span>
                  <span className="font-medium text-gray-800 ltr text-left">
                    {userData.mobile}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">تاریخ عضویت:</span>
                  <span className="font-medium text-gray-800">
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
                <p className="text-gray-500">اطلاعات کاربری یافت نشد</p>
              </div>
            )}
          </div>
        </div>

        {/* دکمه درخواست مشاوره */}
        <div className="text-center mt-12">
          <div className="card max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl">📞</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                مشاوره تلفنی
              </h3>
              <p className="text-gray-600 text-sm">
                با متخصصان مجرب ما در زمینه سلامت حیوانات خانگی خود مشورت کنید
              </p>
            </div>

            {/* انواع مشاوره */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* مشاوره تخصصی */}
              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedConsultationType === "normal"
                    ? "border-cyan-500 bg-cyan-50 shadow-md"
                    : "border-gray-200 hover:border-cyan-400"
                }`}
                onClick={() => handleConsultationTypeSelect("normal")}
              >
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-lg">📋</span>
                  </div>
                  <h4 className="text-base font-bold text-gray-800 mb-1">
                    مشاوره تخصصی
                  </h4>
                  <p className="text-gray-600 text-xs mb-3">
                    مشاوره معمولی برای موارد غیراورژانسی
                  </p>
                  <div className="bg-blue-50 rounded-lg p-2">
                    <p className="text-blue-700 font-bold text-sm">
                      💰 هزینه: 280,000 تومان
                    </p>
                  </div>
                  {selectedConsultationType === "normal" && (
                    <div className="mt-2">
                      <span className="text-cyan-600 text-sm font-medium">
                        ✓ انتخاب شده
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* مشاوره اورژانسی */}
              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedConsultationType === "emergency"
                    ? "border-red-500 bg-red-50 shadow-md"
                    : "border-gray-200 hover:border-red-400"
                }`}
                onClick={() => handleConsultationTypeSelect("emergency")}
              >
                <div className="text-center">
                  <div className="w-10 h-10 mx-auto mb-2 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 text-lg">🚨</span>
                  </div>
                  <h4 className="text-base font-bold text-gray-800 mb-1">
                    مشاوره اورژانسی
                  </h4>
                  <p className="text-gray-600 text-xs mb-3">
                    مشاوره فوری برای موارد اضطراری
                  </p>
                  <div className="bg-red-50 rounded-lg p-2">
                    <p className="text-red-700 font-bold text-sm">
                      💰 هزینه: 280,000 تومان
                    </p>
                  </div>
                  {selectedConsultationType === "emergency" && (
                    <div className="mt-2">
                      <span className="text-red-600 text-sm font-medium">
                        ✓ انتخاب شده
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleNewConsultation}
              className={`w-full ${
                !selectedConsultationType ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!selectedConsultationType}
            >
              درخواست مشاوره جدید
            </Button>

            {!selectedConsultationType && (
              <p className="text-center text-red-500 text-sm mt-2">
                لطفاً نوع مشاوره را انتخاب کنید
              </p>
            )}
          </div>
        </div>

        {/* راهنمای سریع */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
            راهنمای سریع
          </h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card text-center hover:shadow-xl transition-all duration-300">
              <div className="text-3xl mb-3">🩺</div>
              <h4 className="font-semibold text-gray-800 mb-2">مشاوره تخصصی</h4>
              <p className="text-sm text-gray-600">
                دریافت مشاوره از دامپزشکان مجرب در زمینه‌های مختلف
              </p>
            </div>

            <div className="card text-center hover:shadow-xl transition-all duration-300">
              <div className="text-3xl mb-3">📱</div>
              <h4 className="font-semibold text-gray-800 mb-2">تماس تلفنی</h4>
              <p className="text-sm text-gray-600">
                مشاوره در زمان تعیین شده از طریق تماس تلفنی
              </p>
            </div>

            <div className="card text-center hover:shadow-xl transition-all duration-300">
              <div className="text-3xl mb-3">🕐</div>
              <h4 className="font-semibold text-gray-800 mb-2">
                24/7 پشتیبانی
              </h4>
              <p className="text-sm text-gray-600">
                پشتیبانی و راهنمایی در تمام ساعات شبانه‌روز
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
