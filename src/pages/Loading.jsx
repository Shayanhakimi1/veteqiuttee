import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import fatahiyanVideo from "../assets/kishisland.mp4";
import fatahiyanLogo from "../assets/fattahian3.png";
import posterImage from "../assets/kishisland2.jpg";

// صفحه لودینگ
const Loading = () => {
  const navigate = useNavigate();
  const { userData } = useApp();
  const [showPaw, setShowPaw] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    // انیمیشن پنجه
    const pawInterval = setInterval(() => {
      setShowPaw((prev) => !prev);
    }, 1000);

    // پاکسازی
    return () => {
      clearInterval(pawInterval);
    };
  }, []);

  // تابع مدیریت لود شدن ویدیو
  const handleVideoLoad = () => {
    setVideoLoaded(true);
  };

  // تابع کلیک دکمه شروع مشاوره
  const handleStartConsultation = () => {
    // بررسی وجود userData برای تعیین مسیر
    if (userData && userData.mobile && userData.password) {
      navigate("/dashboard");
    } else {
      navigate("/pet-selection");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* ویدیو بک‌گراند تمام صفحه */}
      <video
        autoPlay
        loop
        muted
        preload="metadata"
        playsInline
        poster={posterImage}
        onLoadedData={handleVideoLoad}
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src={fatahiyanVideo} type="video/mp4" />
      </video>
      
      {/* Overlay برای بهتر دیده شدن محتوا */}
      <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div>

      {/* Loading indicator برای ویدیو */}
      {!videoLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-15 bg-black bg-opacity-60">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg">در حال بارگذاری...</p>
          </div>
        </div>
      )}

      {/* ایکون‌های گوشه بالا */}
      <div className="absolute top-4 left-4 z-30">
        <div
          className={`text-4xl transition-all duration-500 ${
            showPaw ? "scale-110 opacity-100" : "scale-90 opacity-70"
          }`}
        >
          🐾
        </div>
      </div>
      
      <div className="absolute top-4 right-4 z-30">
        <div
          className={`text-4xl transition-all duration-500 ${
            showPaw ? "scale-90 opacity-70" : "scale-110 opacity-100"
          }`}
        >
          🐾
        </div>
      </div>

      {/* کانتینر اصلی بدون شیشه‌ای */}
      <div className="relative z-20 text-center max-w-md w-full space-y-6">
        {/* بخش لوگو - بدون شیشه‌ای */}
        <div className="text-center">
          <div className="w-56 h-56 mx-auto mb-4 rounded-full overflow-hidden shadow-2xl backdrop-blur-sm bg-white/15 border border-white/25 p-2">
            <a
              href="https://fattahianpethospital.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={fatahiyanLogo}
                alt="لوگو بیمارستان حیوانات خانگی دکتر فتاحیان"
                className="w-full h-full object-contain cursor-pointer hover:opacity-80 transition-opacity"
              />
            </a>
          </div>
        </div>

        {/* کادر حامی اپلیکیشن زیر لوگو */}
        <div className="backdrop-blur-md bg-white/25 rounded-2xl px-6 py-3 shadow-xl border border-white/30 mb-4">
          <p className="text-xs drop-shadow">
            <span className="text-white">حامی اپلیکیشن فروشگاه بزرگ </span>
            <span style={{color: '#0D47A1'}} className="font-semibold">کاژه</span>
            <br />
            <span className="text-orange-500 font-medium">جزیره زیبای کیش</span>
          </p>
        </div>

        {/* بخش متن خوش‌آمدگویی - جدا و شیشه‌ای */}
        <div className="backdrop-blur-md bg-white/25 rounded-3xl p-5 shadow-2xl border border-white/30">
          <h1 className="text-xl font-bold text-white mb-3 leading-relaxed drop-shadow-lg">
            به مرکز مشاوره از راه دور
            <br />
            <span style={{color: '#0D47A1'}}>
              گروه درمانی حیوانات خانگی
              <br />
              حمیدرضا فتاحیان
            </span>
            <br />
            <span className="text-white">خوش آمدید</span>
          </h1>

          <p className="text-white/90 text-sm leading-relaxed drop-shadow">
            مشاوره‌های تخصصی برای سلامت و رفاه حیوان خانگی شما
          </p>
        </div>

        {/* بخش دکمه شروع مشاوره - جدا و شیشه‌ای */}
        <div className="backdrop-blur-md bg-white/25 rounded-3xl p-6 shadow-2xl border border-white/30">
          <button
            onClick={handleStartConsultation}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-4 px-8 rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            <span className="text-lg">🐾 شروع مشاوره 🐾</span>
          </button>


        </div>
      </div>


    </div>
  );
};

export default Loading;
