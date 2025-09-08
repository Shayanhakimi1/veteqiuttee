import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import fatahiyanLogo from '../assets/fattahian3.png';

// صفحه اصلی
const Home = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentSpecialistSlide, setCurrentSpecialistSlide] = useState(0);

  // داده‌های بنر اسلایدر
  const bannerSlides = [
    {
      id: 1,
      title: 'بیمارستان حیوانات خانگی دکتر فتاحیان',
      subtitle: 'مرکز تخصصی مشاوره و درمان حیوانات خانگی',
      description: 'با بیش از 15 سال تجربه در زمینه دامپزشکی، ما آماده ارائه بهترین خدمات به شما و حیوان خانگی‌تان هستیم.',
      image: '🏥',
      bgColor: 'from-cyan-500 to-teal-500'
    },
    {
      id: 2,
      title: 'مشاوره تلفنی تخصصی',
      subtitle: '24 ساعته در خدمت شما',
      description: 'دریافت مشاوره فوری از متخصصین مجرب در هر ساعت از شبانه‌روز برای حل مشکلات حیوان خانگی‌تان.',
      image: '📞',
      bgColor: 'from-blue-500 to-purple-500'
    },
    {
      id: 3,
      title: 'خدمات جراحی پیشرفته',
      subtitle: 'با تجهیزات مدرن و تیم متخصص',
      description: 'انجام انواع جراحی‌های تخصصی با استفاده از جدیدترین تکنولوژی‌ها و تیم جراحان مجرب.',
      image: '⚕️',
      bgColor: 'from-green-500 to-emerald-500'
    }
  ];

  // داده‌های متخصصین
  const specialists = [
    {
      id: 1,
      name: 'دکتر حمیدرضا فتاحیان',
      specialty: 'دامپزشک عمومی و جراح',
      experience: '15 سال تجربه',
      image: '👨‍⚕️',
      description: 'متخصص در زمینه جراحی و درمان حیوانات خانگی',
      bgColor: 'from-cyan-500 to-teal-500'
    },
    {
      id: 2,
      name: 'دکتر سارا احمدی',
      specialty: 'متخصص بیماری‌های داخلی',
      experience: '8 سال تجربه',
      image: '👩‍⚕️',
      description: 'متخصص در تشخیص و درمان بیماری‌های داخلی حیوانات',
      bgColor: 'from-pink-500 to-rose-500'
    },
    {
      id: 3,
      name: 'دکتر محمد رضایی',
      specialty: 'جراح تخصصی',
      experience: '12 سال تجربه',
      image: '👨‍⚕️',
      description: 'متخصص در جراحی‌های پیچیده و اورژانسی',
      bgColor: 'from-indigo-500 to-purple-500'
    },
    {
      id: 4,
      name: 'دکتر فاطمه کریمی',
      specialty: 'متخصص رادیولوژی',
      experience: '6 سال تجربه',
      image: '👩‍⚕️',
      description: 'متخصص در تصویربرداری و تشخیص تصویری',
      bgColor: 'from-emerald-500 to-green-500'
    }
  ];

  // داده‌های مقالات
  const articles = [
    {
      id: 1,
      title: 'نحوه مراقبت از گربه در فصل زمستان',
      summary: 'راهنمای کامل برای نگهداری و مراقبت از گربه‌ها در فصل سرد',
      image: '🐱',
      date: '1403/08/15',
      readTime: '5 دقیقه'
    },
    {
      id: 2,
      title: 'علائم بیماری در سگ‌ها که نباید نادیده گرفت',
      summary: 'شناخت علائم اولیه بیماری‌ها برای تشخیص زودهنگام',
      image: '🐕',
      date: '1403/08/10',
      readTime: '7 دقیقه'
    },
    {
      id: 3,
      title: 'تغذیه صحیح حیوانات خانگی',
      summary: 'راهنمای تغذیه مناسب برای انواع مختلف حیوانات خانگی',
      image: '🍽️',
      date: '1403/08/05',
      readTime: '6 دقیقه'
    },
    {
      id: 4,
      title: 'واکسیناسیون حیوانات خانگی',
      summary: 'برنامه واکسیناسیون و اهمیت آن برای سلامت حیوان',
      image: '💉',
      date: '1403/07/28',
      readTime: '4 دقیقه'
    }
  ];

  // تابع تغییر اسلاید بنر
  const nextBannerSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  };

  const prevBannerSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };

  // تابع تغییر اسلاید متخصصین
  const nextSpecialistSlide = () => {
    setCurrentSpecialistSlide((prev) => (prev + 1) % Math.ceil(specialists.length / 2));
  };

  const prevSpecialistSlide = () => {
    setCurrentSpecialistSlide((prev) => (prev - 1 + Math.ceil(specialists.length / 2)) % Math.ceil(specialists.length / 2));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* هدر */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
          <div className="flex flex-col items-center justify-center gap-4">
            {/* لوگو در مرکز */}
            <div className="flex flex-col items-center gap-2 sm:gap-3">
              <a href="https://fattahianpethospital.com/" target="_blank" rel="noopener noreferrer">
                <img 
                  src={fatahiyanLogo} 
                  alt="لوگو بیمارستان حیوانات خانگی دکتر فتاحیان" 
                  className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 object-contain cursor-pointer hover:opacity-80 transition-opacity mx-auto"
                />
              </a>
              <div className="text-center">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">بیمارستان حیوانات خانگی</h1>
                <p className="text-sm sm:text-base text-gray-600">دکتر حمیدرضا فتاحیان</p>
              </div>
            </div>

            {/* دکمه‌های ناوبری */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/login')}
                className="text-xs sm:text-sm"
              >
                ورود
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/pet-selection')}
                className="text-xs sm:text-sm"
              >
                شروع مشاوره
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* بنر اسلایدر */}
      <section className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
        <div className="absolute inset-0">
          {bannerSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                index === currentSlide ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              <div className={`h-full bg-gradient-to-r ${slide.bgColor} flex items-center`}>
                <div className="max-w-6xl mx-auto px-2 sm:px-4 text-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 items-center">
                    <div className="text-center md:text-right">
                      <div className="text-3xl sm:text-4xl md:text-6xl mb-2 sm:mb-4">{slide.image}</div>
                      <h2 className="text-lg sm:text-2xl md:text-4xl font-bold mb-2 sm:mb-4">{slide.title}</h2>
                      <h3 className="text-sm sm:text-lg md:text-xl mb-2 sm:mb-4 opacity-90">{slide.subtitle}</h3>
                      <p className="text-xs sm:text-sm md:text-lg opacity-80 leading-relaxed">{slide.description}</p>
                      <div className="mt-3 sm:mt-6">
                        <Button
                          size="sm"
                          className="bg-white text-gray-800 hover:bg-gray-100 text-xs sm:text-sm"
                          onClick={() => navigate('/pet-selection')}
                        >
                          شروع مشاوره
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* دکمه‌های ناوبری اسلایدر */}
        <button
          onClick={prevBannerSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={nextBannerSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* نقاط ناوبری */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* محتوای اصلی */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* بخش متخصصین */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">تیم متخصصین ما</h2>
            <p className="text-gray-600 text-lg">با متخصصین مجرب و دلسوز ما آشنا شوید</p>
          </div>

          <div className="relative">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSpecialistSlide * 100}%)` }}
              >
                {Array.from({ length: Math.ceil(specialists.length / 2) }).map((_, slideIndex) => (
                  <div key={slideIndex} className="w-full flex-shrink-0">
                    <div className="grid md:grid-cols-2 gap-6">
                      {specialists.slice(slideIndex * 2, slideIndex * 2 + 2).map((specialist) => (
                        <div key={specialist.id} className={`bg-gradient-to-br ${specialist.bgColor} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-white`}>
                          <div className="text-center">
                            <div className="text-5xl mb-4">{specialist.image}</div>
                            <h3 className="text-xl font-bold mb-2">{specialist.name}</h3>
                            <p className="text-white/90 font-medium mb-2">{specialist.specialty}</p>
                            <p className="text-white/80 text-sm mb-3">{specialist.experience}</p>
                            <p className="text-white/90 text-sm">{specialist.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* دکمه‌های ناوبری متخصصین */}
            <button
              onClick={prevSpecialistSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-full transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSpecialistSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-full transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </section>

        {/* بخش مقالات */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">مقالات و راهنماها</h2>
            <p className="text-gray-600 text-lg">اطلاعات مفید برای بهتر مراقبت از حیوان خانگی‌تان</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {articles.map((article) => (
              <div key={article.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="p-6">
                  <div className="text-4xl mb-4 text-center">{article.image}</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2">{article.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{article.summary}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{article.date}</span>
                    <span>{article.readTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              مشاهده همه مقالات
            </Button>
          </div>
        </section>
      </main>

      {/* فوتر */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <a href="https://fattahianpethospital.com/" target="_blank" rel="noopener noreferrer">
                  <img 
                    src={fatahiyanLogo} 
                    alt="لوگو" 
                    className="w-28 h-28 object-contain cursor-pointer hover:opacity-80 transition-opacity"
                  />
                </a>
                <div>
                  <h3 className="font-bold">بیمارستان حیوانات خانگی</h3>
                  <p className="text-sm text-gray-300">دکتر حمیدرضا فتاحیان</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm">
                ارائه بهترین خدمات دامپزشکی با بیش از 15 سال تجربه
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">خدمات ما</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>مشاوره تلفنی</li>
                <li>جراحی تخصصی</li>
                <li>درمان بیماری‌ها</li>
                <li>واکسیناسیون</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">تماس با ما</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <p>📞 تلفن: 021-12345678</p>
                <p>📱 موبایل: 09123456789</p>
                <p>📧 ایمیل: info@fatahiyanvet.com</p>
                <p>📍 آدرس: تهران، خیابان ولیعصر</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 1403 بیمارستان حیوانات خانگی دکتر حمیدرضا فتاحیان. تمامی حقوق محفوظ است.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              طراحی و توسعه توسط فروشگاه کاژه
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;