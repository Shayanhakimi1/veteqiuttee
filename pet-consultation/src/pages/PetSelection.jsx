import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import Button from '../components/common/Button';
import ProgressBar from '../components/common/ProgressBar';
import { logger } from '../utils/logger';
import { FaDog, FaCat, FaDove } from 'react-icons/fa';

// صفحه انتخاب نوع حیوان خانگی
const PetSelection = () => {
  const navigate = useNavigate();
  const { savePetSelection } = useApp();
  const [selectedPet, setSelectedPet] = useState(null);
  const [isLoading, setIsLoading] = useState(false);


  // بارگذاری اطلاعات ذخیره شده
  useEffect(() => {
    const savedSelection = localStorage.getItem('selectedPetType');
    if (savedSelection) {
      try {
        const parsedSelection = JSON.parse(savedSelection);
        setSelectedPet(parsedSelection);
      } catch (error) {
        logger.error('Failed to load pet selection data', { error });
      }
    }
  }, []);



  // انواع حیوانات خانگی
  const petTypes = [
    {
      id: 'dog',
      name: 'سگ',
      description: 'بهترین دوست انسان با نیاز به مراقبت‌های ویژه',
      icon: FaDog,
      color: 'from-primary-400 to-primary-500'
    },
    {
      id: 'cat',
      name: 'گربه',
      description: 'حیوان خانگی مستقل و دوست‌داشتنی',
      icon: FaCat,
      color: 'from-secondary-400 to-secondary-500'
    },
    {
      id: 'other',
      name: 'سایر حیوانات',
      description: 'پرندگان، خرگوش، همستر و سایر حیوانات خانگی',
      icon: FaDove,
      color: 'from-primary-300 to-secondary-400'
    }
    ];

  // انتخاب نوع حیوان
  const handlePetSelect = (pet) => {
    setSelectedPet(pet);
    // ذخیره در context و localStorage با کلید واحد (بدون کامپوننت React)
    try {
      const petData = {
        id: pet.id,
        name: pet.name,
        description: pet.description,
        color: pet.color
      };
      savePetSelection(petData);
    } catch (e) {
      logger.error('Failed to save pet selection', { error: e });
    }
  };

  // ادامه به مرحله بعد
  const handleContinue = () => {
    if (!selectedPet) return;
    
    setIsLoading(true);
    
    // ذخیره انتخاب در context و localStorage (ایمن در صورت انتخاب قبلی)
    const petData = {
      id: selectedPet.id,
      name: selectedPet.name,
      description: selectedPet.description,
      color: selectedPet.color
    };
    savePetSelection(petData);
    
    // انتقال به صفحه ثبت نام
    setTimeout(() => {
      navigate('/registration');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* هدر */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <ProgressBar currentStep={1} totalSteps={4} />
        </div>
      </div>

      {/* محتوای اصلی */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* عنوان */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            <span className="block" style={{color: '#0D47A1'}}>دیگر نگران نباشید</span>
            <span className="block">ما اینجاییم برای پت ها و آرامش</span>
            <span className="block">دل های شما</span>
          </h1>
          <p className="text-gray-600 text-lg">
            لطفاً نوع حیوان خانگی خود را انتخاب کنید تا بتوانیم بهترین مشاوره را ارائه دهیم
          </p>
        </div>

        {/* کارت‌های انتخاب */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 md:gap-8 mb-8 sm:mb-12 w-full max-w-5xl mx-auto">
          {petTypes.map((pet) => (
            <div
              key={pet.id}
              className={`
                card cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl p-6 sm:p-8 md:p-10 min-h-[160px] sm:min-h-[200px] md:min-h-[240px] flex flex-col justify-center
                ${selectedPet?.id === pet.id 
                  ? 'ring-4 ring-cyan-500 bg-gradient-to-br from-cyan-50 to-teal-50 border-2 border-cyan-500' 
                  : 'hover:shadow-xl'
                }
              `}
              onClick={() => handlePetSelect(pet)}
            >
              {/* ایکون */}
              <div className="text-center mb-3 sm:mb-5 md:mb-7">
                <div className={`w-20 h-20 sm:w-28 sm:h-28 md:w-40 md:h-40 mx-auto rounded-full bg-gradient-to-br ${pet.color} flex items-center justify-center mb-2 sm:mb-4 md:mb-5 shadow-lg`}>
                  <pet.icon className="text-3xl sm:text-5xl md:text-7xl text-white" />
                </div>
              </div>

              {/* اطلاعات */}
              <div className="text-center">
                <h3 className="text-base sm:text-xl md:text-3xl font-bold text-gray-800 mb-2 sm:mb-3 md:mb-4">
                  {pet.name}
                </h3>


                {/* تیک انتخاب */}
                {selectedPet?.id === pet.id && (
                  <div className="flex justify-center">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16 5L8 13l-4-4 1-1 3 3 7-7 1 1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* دکمه ادامه */}
        <div className="text-center">
          <Button
            onClick={handleContinue}
            disabled={!selectedPet}
            loading={isLoading}
            size="lg"
            className="min-w-32 sm:min-w-48 text-sm sm:text-base"
          >
            ادامه
          </Button>
          
          <div className="mt-3 sm:mt-4">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              disabled={isLoading}
              className="text-sm sm:text-base"
            >
              بازگشت
            </Button>
          </div>
          
          {/* جملات حامی */}
          <div className="mt-3 sm:mt-4 text-center">
            <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
              حامی پلتفرم <span className="text-slate-700 font-semibold">فروشگاه کاژه</span>
            </p>
            <p className="text-xs sm:text-sm text-orange-500 font-medium">
              جزیره کیش
            </p>
          </div>
          
          {!selectedPet && (
            <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3">
              لطفاً یکی از گزینه‌ها را انتخاب کنید
            </p>
          )}
        </div>
      </div>


    </div>
  );
};

export default PetSelection;