import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import fatahiyanVideo from "/src/assets/kishisland.mp4";
import fatahiyanLogo from "../assets/fattahian3.png";
import posterImage from "../assets/kishisland2.jpg";

// صفحه لودینگ
const Loading = () => {
  const navigate = useNavigate();
  useAuth(); // Keep the hook for potential future use
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
    // همه کاربران به فرآیند انتخاب حیوان خانگی هدایت می‌شوند
    navigate("/pet-selection");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden" style={{ backgroundImage: `url(${posterImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      {/* Overlay برای بهتر دیده شدن محتوا */}
      <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div>



      {/* ایکون‌های گوشه بالا */}
      <div className="absolute top-20 left-4 z-30">
        <div
          className={`text-4xl transition-all duration-500 ${
            showPaw ? "scale-110 opacity-100" : "scale-90 opacity-70"
          }`}
        >
          🐾
        </div>
      </div>
      
      <div className="absolute top-20 right-4 z-30">
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
        {/* بخش لوگو - مرکز صفحه */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-56 h-56 mx-auto mb-6 rounded-full overflow-hidden card-glass p-2">
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
          
          {/* بخش اسپانسر زیر لوگو */}
          <div className="card-glass rounded-xl p-4 mb-4">
            <div className="text-center text-white">
              <p className="text-sm font-semibold mb-2">
                <span className="text-yellow-300">حامی اپلیکیشن:</span> <span className="text-blue-300">فروشگاه بزرگ کاژه</span>
              </p>
              <p className="text-sm font-medium text-orange-400">
                جزیره زیبای کیش
              </p>
            </div>
          </div>
        </div>



        {/* بخش متن خوش‌آمدگویی - جدا و شیشه‌ای */}
        <div className="card-glass rounded-3xl p-6">
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
        <div className="card-glass rounded-3xl p-6">
          <button
            onClick={handleStartConsultation}
            className="btn-primary w-full py-4 px-8 text-lg font-bold rounded-2xl transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary-300"
          >
            <span className="text-lg">🐾 شروع مشاوره 🐾</span>
          </button>
        </div>
      </div>


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
      
      {/* Loading indicator برای ویدیو */}
      {!videoLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-15 bg-black bg-opacity-60">
          <div className="card-glass rounded-2xl p-8 text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg">در حال بارگذاری...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loading;
