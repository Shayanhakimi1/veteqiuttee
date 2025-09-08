import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import Button from '../components/common/Button';
import FileUploader from '../components/common/FileUploader';
import VoiceRecorder from '../components/common/VoiceRecorder';
import ProgressBar from '../components/common/ProgressBar';
import Alert from '../components/common/Alert';

// صفحه فرم مشاوره
const Consultation = () => {
  const navigate = useNavigate();
  const { userData, selectedPet, saveConsultationData } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    description: '',
    medicalDocuments: [],
    videos: [],
    audioFiles: []
  });
  const [consultationType, setConsultationType] = useState('');
  const [consultationPrice, setConsultationPrice] = useState(0);

  // بارگذاری داده‌های ذخیره شده و نوع مشاوره
  useEffect(() => {
    const savedData = localStorage.getItem('consultationData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData({
          description: parsed.description || '',
          medicalDocuments: parsed.medicalDocuments || [],
          videos: parsed.videos || [],
          audioFiles: parsed.audioFiles || []
        });
      } catch (error) {
        console.error('خطا در بارگذاری داده‌های ذخیره شده:', error);
      }
    }
    
    // بارگذاری نوع مشاوره انتخاب شده
    const selectedType = localStorage.getItem('selectedConsultationType');
    if (selectedType) {
      setConsultationType(selectedType);
      setConsultationPrice(280000); // قیمت ثابت برای همه انواع مشاوره
    } else {
      // اگر نوع مشاوره انتخاب نشده، به داشبورد برگرد
      navigate('/dashboard');
    }
  }, [navigate]);

  // ذخیره خودکار هر 3 ثانیه
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (formData.description.trim() !== '' || 
          formData.medicalDocuments.length > 0 || 
          formData.videos.length > 0) {
        localStorage.setItem('consultationData', JSON.stringify(formData));
      }
    }, 3000);

    return () => clearInterval(autoSaveInterval);
  }, [formData]);

  // اعتبارسنجی توضیحات
  const validateDescription = (value) => {
    const newErrors = { ...errors };
    const hasAudioFile = formData.audioFiles && formData.audioFiles.length > 0;
    
    if (value.length < 20 && !hasAudioFile) {
      newErrors.description = 'توضیحات باید حداقل 20 کاراکتر باشد یا فایل صوتی آپلود کنید';
    } else {
      delete newErrors.description;
    }
    
    setErrors(newErrors);
  };

  // مدیریت تغییر توضیحات
  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, description: value }));
    validateDescription(value);
  };

  // مدیریت آپلود اسناد پزشکی
  const handleMedicalDocumentsUpload = (files) => {
    setFormData(prev => ({ ...prev, medicalDocuments: files }));
  };

  // مدیریت آپلود ویدیو
  const handleVideoUpload = (files) => {
    setFormData(prev => ({ ...prev, videos: files }));
  };

  // ارسال فرم
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // اعتبارسنجی
    validateDescription(formData.description);
    
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    setIsLoading(true);
    
    // شبیه‌سازی ارسال
    setTimeout(() => {
      const consultationData = {
        ...formData,
        submissionDate: new Date().toISOString(),
        consultationType: consultationType,
        price: consultationPrice
      };
      
      saveConsultationData(consultationData);
      localStorage.removeItem('consultationData'); // پاک کردن داده‌های موقت
      navigate('/payment');
    }, 1500);
  };

  // بررسی معتبر بودن فرم
  const isFormValid = () => {
    // اگر فایل صوتی موجود باشد، توضیحات اجباری نیست
    const hasAudioFile = formData.audioFiles && formData.audioFiles.length > 0;
    const hasValidDescription = formData.description.length >= 20;
    
    return (hasValidDescription || hasAudioFile) && Object.keys(errors).length === 0;
  };

  // محاسبه تعداد کاراکترهای باقی‌مانده
  const remainingChars = Math.max(0, 20 - formData.description.length);

  return (
    <div className="min-h-screen gradient-bg">
      {/* هدر */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <ProgressBar currentStep={3} totalSteps={4} />
          </div>
        </div>
      </div>

      {/* محتوای اصلی */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* نمایش قیمت و نوع مشاوره */}
        <div className="text-center mb-6">
          <div className={`text-white px-6 py-3 rounded-xl inline-block ${
            consultationType === 'emergency' 
              ? 'bg-gradient-to-r from-red-500 to-red-600' 
              : 'bg-gradient-to-r from-cyan-500 to-teal-500'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-lg">
                {consultationType === 'emergency' ? '🚨' : '📋'}
              </span>
              <span className="text-sm font-medium">
                {consultationType === 'emergency' ? 'مشاوره اورژانسی' : 'مشاوره تخصصی'}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium">هزینه مشاوره:</span>
              <span className="text-lg font-bold mr-2">{consultationPrice.toLocaleString()} تومان</span>
            </div>
          </div>
        </div>

        {/* عنوان */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            درخواست {consultationType === 'emergency' ? 'مشاوره اورژانسی' : 'مشاوره تخصصی'}
          </h1>
          <p className="text-gray-600">
            لطفاً اطلاعات مورد نیاز برای مشاوره را تکمیل کنید
          </p>
        </div>

        {/* نمایش اطلاعات کاربر و پت */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">اطلاعات شما</h3>
            <div className="space-y-2">
              <p><span className="text-gray-600">نام:</span> <span className="font-medium">{userData?.fullName}</span></p>
              <p><span className="text-gray-600">موبایل:</span> <span className="font-medium ltr text-left">{userData?.mobile}</span></p>
            </div>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">حیوان خانگی</h3>
            <div className="space-y-2">
              <p><span className="text-gray-600">نوع:</span> <span className="font-medium">{selectedPet?.name}</span></p>
              <p><span className="text-gray-600">نام:</span> <span className="font-medium">{userData?.petName}</span></p>
              <p><span className="text-gray-600">نژاد:</span> <span className="font-medium">{userData?.petBreed}</span></p>
            </div>
          </div>
        </div>

        {/* فرم مشاوره */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* توضیحات */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              بیماری / عارضه حیوان خانگی <span className="text-red-500">*</span>
            </h3>
            
            <div className="space-y-2">
              <textarea
                value={formData.description}
                onChange={handleDescriptionChange}
                placeholder="لطفا توضیحات و سوال خود را در خصوص حیوان خانگی تان به تفصیل بنویسید..."
                className={`w-full h-32 px-4 py-3 border-2 rounded-xl resize-none focus:outline-none transition-all duration-300 ${
                  errors.description 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-300 focus:border-cyan-500'
                }`}
                maxLength={1000}
              />
              
              {/* شمارنده کاراکتر */}
              <div className="flex justify-between text-sm">
                <span className={`${
                  remainingChars > 0 ? 'text-red-500' : 'text-green-600'
                }`}>
                  {remainingChars > 0 
                    ? `${remainingChars} کاراکتر تا حداقل مورد نیاز` 
                    : '✓ حداقل کاراکتر رعایت شده'
                  }
                </span>
                <span className="text-gray-500">
                  {formData.description.length}/1000
                </span>
              </div>
              
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
              
              {/* بخش ضبط صدا */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <VoiceRecorder
                   onRecordingComplete={(files) => {
                     setFormData(prev => ({ ...prev, audioFiles: files }));
                     // به‌روزرسانی validation هنگام تغییر فایل صوتی
                     validateDescription(formData.description);
                   }}
                   maxDuration={300}
                 />
              </div>
            </div>
          </div>

          {/* آپلود اسناد پزشکی */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              اسناد پزشکی (اختیاری)
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              در صورت داشتن مدارک پزشکی حیوان خانگی خود اعم از گزارش آزمایش،درمان های انجام شده(نسخه های قدیمی)،تصویربرداری های ساده و پیشرفته(رادیوگرافی،ام آر آی و...)در این قسمت آپلود کنید
            </p>
            
            <FileUploader
              onFilesChange={handleMedicalDocumentsUpload}
              acceptedTypes={['image/jpeg', 'image/png', 'image/jpg']}
              maxFileSize={5 * 1024 * 1024} // 5MB
              maxFiles={5}
              multiple
              initialFiles={formData.medicalDocuments}
            />
          </div>

          {/* آپلود ویدیو */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              ویدیو (اختیاری)
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              اگر امکانش را دارید کلیپ ویدیویی از عارضه حیوان خانگی خود اعم از اندام درگیر،علائم رفتاری او را اینجا آپلود کنید
            </p>
            
            <FileUploader
              onFilesChange={handleVideoUpload}
              acceptedTypes={['video/mp4', 'video/avi', 'video/mov']}
              maxFileSize={100 * 1024 * 1024} // 100MB
              maxFiles={2}
              multiple
              initialFiles={formData.videos}
            />
          </div>

          {/* راهنمایی */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h4 className="font-semibold text-blue-800 mb-3">💡 نکات مهم:</h4>
            <ul className="text-blue-700 text-sm space-y-2">
              <li>• هر چه توضیحات شما دقیق‌تر باشد، مشاوره بهتری دریافت خواهید کرد</li>
              <li>• در صورت وجود علائم اورژانسی، فوراً با دامپزشک تماس بگیرید</li>
              <li>• تصاویر و ویدیوها به تشخیص بهتر مشکل کمک می‌کنند</li>
              <li>• مشاور در زمان تعیین شده با شما تماس خواهد گرفت</li>
            </ul>
          </div>

          {/* دکمه ادامه */}
          <div className="text-center pt-4">
            <Button
              type="submit"
              loading={isLoading}
              disabled={!isFormValid()}
              size="lg"
              className="min-w-48"
            >
              ادامه به پرداخت
            </Button>
            
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                disabled={isLoading}
              >
                بازگشت به داشبورد
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Consultation;