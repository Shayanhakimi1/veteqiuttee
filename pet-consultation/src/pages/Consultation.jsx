import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { translateError } from '../utils/errorTranslations';
import Button from '../components/common/Button';
import FileUploader from '../components/common/FileUploader';
import VoiceRecorder from '../components/common/VoiceRecorder';
import ProgressBar from '../components/common/ProgressBar';
import Alert from '../components/common/Alert';
import { logger } from '../utils/logger';

const Consultation = () => {
  const navigate = useNavigate();
  const { userData, selectedPet, saveConsultationData } = useApp();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotification] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    description: '',
    medicalDocuments: [],
    videos: [],
    audioFiles: []
  });
  
  const [uploadErrors, setUploadErrors] = useState({});


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
        logger.error('Failed to load saved consultation data', { error });
      }
    }
    
    // بارگذاری نوع مشاوره انتخاب شده
    const selectedType = localStorage.getItem('selectedConsultationType');
    if (selectedType) {
        // Price is fixed at 280000
      } else {
      // اگر نوع مشاوره انتخاب نشده، به داشبورد برگرد
      navigate('/dashboard');
    }
  }, [navigate]);

  // اگر نوع حیوان انتخاب نشده، به انتخاب حیوان بازگرد
  useEffect(() => {
    if (!selectedPet) {
      navigate("/pet-selection");
    }
  }, [selectedPet, navigate]);

  // هندل آپلود فایل‌های پزشکی
  const handleMedicalRecordsUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = [];
    const errors = [];
    
    files.forEach(file => {
      // بررسی اندازه فایل (5MB)
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`فایل ${file.name} بیش از 5MB است`);
        return;
      }
      
      // بررسی نوع فایل
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        errors.push(`نوع فایل ${file.name} پشتیبانی نمی‌شود`);
        return;
      }
      
      validFiles.push(file);
    });
    
    if (errors.length > 0) {
      setUploadErrors(prev => ({ ...prev, medicalDocuments: errors }));
    } else {
      setUploadErrors(prev => ({ ...prev, medicalDocuments: [] }));
    }
    
    setFormData((prev) => ({ ...prev, medicalDocuments: validFiles }));
  };

  // هندل آپلود ویدیو
  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0] || null;
    const errors = [];
    
    if (file) {
      // بررسی اندازه فایل (50MB)
      if (file.size > 50 * 1024 * 1024) {
        errors.push('اندازه ویدیو نباید بیش از 50MB باشد');
        setUploadErrors(prev => ({ ...prev, videos: errors }));
        return;
      }
      
      // بررسی نوع فایل
      if (!file.type.startsWith('video/')) {
        errors.push('فقط فایل‌های ویدیویی مجاز هستند');
        setUploadErrors(prev => ({ ...prev, videos: errors }));
        return;
      }
      
      setUploadErrors(prev => ({ ...prev, videos: [] }));
    }
    
    setFormData((prev) => ({ ...prev, videos: file ? [file] : [] }));
  };

  // هندل آپلود فایل‌های صوتی
  const handleAudioUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = [];
    const errors = [];
    
    files.forEach(file => {
      // بررسی اندازه فایل (5MB)
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`فایل صوتی ${file.name} بیش از 5MB است`);
        return;
      }
      
      // بررسی نوع فایل
      if (!file.type.startsWith('audio/')) {
        errors.push(`فایل ${file.name} نوع صوتی نیست`);
        return;
      }
      
      validFiles.push(file);
    });
    
    if (errors.length > 0) {
      setUploadErrors(prev => ({ ...prev, audioFiles: errors }));
    } else {
      setUploadErrors(prev => ({ ...prev, audioFiles: [] }));
    }
    
    setFormData((prev) => ({ ...prev, audioFiles: validFiles }));
  };

  // هندل ضبط صدا از VoiceRecorder
  const handleVoiceRecording = (recordedFiles) => {
    setFormData((prev) => ({ 
      ...prev, 
      audioFiles: [...prev.audioFiles, ...recordedFiles] 
    }));
    setUploadErrors(prev => ({ ...prev, audioFiles: [] }));
  };



  // اعتبارسنجی فرم
  const validateForm = () => {
    const newErrors = {};

    if (!formData.description || formData.description.trim().length < 20) {
      newErrors.description = "توضیحات باید حداقل ۲۰ کاراکتر باشد";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ارسال فرم
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // آماده‌سازی داده‌های نهایی مشاوره
      const payload = {
        consultationType: formData.consultationType,
        description: formData.description,
        user: {
          fullName: userData?.fullName,
          mobile: userData?.mobile,
          nationalId: userData?.nationalId,
        },
        pet: selectedPet || {},
      };

      // ذخیره در context/localStorage (بدون فراخوانی API در این صفحه)
      saveConsultationData(payload);

      // هدایت به صفحه پرداخت با ارسال state
      navigate("/payment", { state: payload });
    } catch (error) {
      logger.error('Consultation form submission error', { error });
      const translated = translateError(error.message) || "خطا در ارسال اطلاعات مشاوره";
      setErrors({ submit: translated });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
      {/* نوار پیشرفت */}
      <div className="max-w-4xl mx-auto px-4 pt-8 mb-8">
        <ProgressBar 
          currentStep={3} 
          totalSteps={4} 
          steps={['انتخاب پت', 'ثبت نام', 'مشاوره', 'پرداخت']}
        />
      </div>

      {/* محتوای اصلی */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        {/* قیمت مشاوره تخصصی */}
        <div className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg p-4 mb-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg">📋</span>
            <span className="text-lg font-semibold">مشاوره تخصصی</span>
          </div>
          <div className="text-2xl font-bold mt-2">
            هزینه مشاوره: 280,000 تومان
          </div>
        </div>

        {/* درخواست مشاوره تخصصی */}
        <div className="card-elevated rounded-2xl p-4 sm:p-6 lg:p-8 mb-6">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 text-center">
            درخواست مشاوره تخصصی
          </h2>
          <p className="text-sm sm:text-base text-gray-600 text-center mb-4 sm:mb-6">
            لطفاً اطلاعات مورد نیاز برای مشاوره را تکمیل کنید
          </p>

          {/* اطلاعات حیوان خانگی و شما */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {/* اطلاعات حیوان خانگی */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">حیوان خانگی</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">نوع:</span>
                  <span className="font-medium">{selectedPet?.name || userData?.petSpecies || 'نامشخص'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">نام:</span>
                  <span className="font-medium">{userData?.petName || 'نامشخص'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">سن:</span>
                  <span className="font-medium">{userData?.petAge || 'نامشخص'} سال</span>
                </div>
              </div>
            </div>

            {/* اطلاعات شما */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">اطلاعات شما</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">نام:</span>
                  <span className="font-medium">{userData?.fullName || 'نامشخص'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">موبایل:</span>
                  <span className="font-medium">{userData?.mobile || 'نامشخص'}</span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* باکس بیماری/عارضه حیوان خانگی و محیط صدا */}
            <div className="card-elevated rounded-2xl p-6 shadow-lg">
              {/* بیماری / عارضه حیوان خانگی */}
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-3">
                  بیماری / عارضه حیوان خانگی <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-y min-h-[120px]"
                  rows={4}
                  placeholder="لطفاً توضیحات و سوال خود را در خصوص حیوان خانگی تان به تفصیل بنویسید..."
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500">{formData.description.length}/1000</span>
                  <span className="text-sm text-red-500">۲۰ کاراکتر حداقل مورد نیاز</span>
                </div>
                {errors.description && (
                  <p className="text-red-500 text-sm mt-2">{errors.description}</p>
                )}
              </div>

              {/* محیط صدا (اختیاری) */}
              <div>
                <label className="block text-gray-700 font-semibold mb-3">
                  محیط صدا (اختیاری)
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  در صورت داشتن فایل صوتی مرتبط با حیوان خانگی خود آن را آپلود کنید یا صدای خود را ضبط کنید
                </p>
                
                {/* VoiceRecorder Component */}
                <VoiceRecorder 
                  onRecordingComplete={handleVoiceRecording}
                  maxDuration={300}
                />
                
                {/* File Upload for Audio */}
                <div className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-2">یا فایل صوتی خود را آپلود کنید</p>
                  <p className="text-sm text-gray-500">حداکثر اندازه فایل: 5MB</p>
                  <input
                    type="file"
                    multiple
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    className="hidden"
                    id="audio-upload"
                  />
                  <label
                    htmlFor="audio-upload"
                    className="inline-block mt-3 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    انتخاب فایل صوتی
                  </label>
                </div>
                
                {/* Display uploaded audio files */}
                {formData.audioFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-gray-700">فایل‌های صوتی انتخاب شده:</p>
                    {formData.audioFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-600">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newFiles = formData.audioFiles.filter((_, i) => i !== index);
                            setFormData(prev => ({ ...prev, audioFiles: newFiles }));
                          }}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          حذف
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Display audio upload errors */}
                {uploadErrors.audioFiles && uploadErrors.audioFiles.length > 0 && (
                  <div className="mt-2 text-red-500 text-sm">
                    {uploadErrors.audioFiles.map((error, index) => (
                      <p key={index}>{error}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* باکس اسناد پزشکی */}
            <div className="card-elevated rounded-2xl p-6 shadow-lg">
              <label className="block text-gray-700 font-semibold mb-3">
                اسناد پزشکی (اختیاری)
              </label>
              <p className="text-sm text-gray-600 mb-3">
                در صورت وجود عکس آزمایش، درمان های قبلی، آزمایشگاه های ساده و پیشینه‌ای/پزشکی/دارویی آن را آپلود کنید
              </p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="text-gray-400 mb-2">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-2">فایل های خود را آپلود کنید</p>
                <p className="text-sm text-gray-500">حداکثر اندازه فایل: 5MB - فرمت‌های مجاز: JPG, PNG, PDF, DOC, DOCX</p>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleMedicalRecordsUpload}
                  className="hidden"
                  id="documents-upload"
                />
                <label
                  htmlFor="documents-upload"
                  className="inline-block mt-4 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  انتخاب فایل
                </label>
              </div>
              
              {/* Display uploaded medical documents */}
              {formData.medicalDocuments.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-gray-700">اسناد پزشکی انتخاب شده:</p>
                  {formData.medicalDocuments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm text-gray-600">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const newFiles = formData.medicalDocuments.filter((_, i) => i !== index);
                          setFormData(prev => ({ ...prev, medicalDocuments: newFiles }));
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        حذف
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Display medical documents upload errors */}
              {uploadErrors.medicalDocuments && uploadErrors.medicalDocuments.length > 0 && (
                <div className="mt-2 text-red-500 text-sm">
                  {uploadErrors.medicalDocuments.map((error, index) => (
                    <p key={index}>{error}</p>
                  ))}
                </div>
              )}
            </div>

            {/* باکس ویدیو */}
            <div className="card-elevated rounded-2xl p-6 shadow-lg">
              <label className="block text-gray-700 font-semibold mb-3">
                ویدیو (اختیاری)
              </label>
              <p className="text-sm text-gray-600 mb-3">
                اگر امکانش را دارید ویدیویی از حیوان خانگی خود آنها را از طریق آپلود کنید
              </p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="text-gray-400 mb-2">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-2">ویدیو خود را آپلود کنید</p>
                <p className="text-sm text-gray-500">حداکثر اندازه فایل: 50MB - فرمت‌های ویدیویی</p>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  id="video-upload"
                />
                <label
                  htmlFor="video-upload"
                  className="inline-block mt-4 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  انتخاب فایل
                </label>
              </div>
              
              {/* Display uploaded video */}
              {formData.videos.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-gray-700">ویدیو انتخاب شده:</p>
                  {formData.videos.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm text-gray-600">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, videos: [] }));
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        حذف
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Display video upload errors */}
              {uploadErrors.videos && uploadErrors.videos.length > 0 && (
                <div className="mt-2 text-red-500 text-sm">
                  {uploadErrors.videos.map((error, index) => (
                    <p key={index}>{error}</p>
                  ))}
                </div>
              )}
            </div>

            {/* نکات مهم */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                <span className="mr-2">💡</span>
                نکات مهم
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• هر چه توضیحات شما دقیق‌تر باشد، مشاوره بهتری دریافت خواهید کرد</li>
                <li>• در صورت وجود عکس آزمایش، فیلم یا تصاویری، حتماً آپلود کنید</li>
                <li>• تصاویر و ویدیوها به تشخیص بهتر مشکل کمک می‌کند</li>
                <li>• مشاور در زمان تعیین شده با شما تماس خواهد گرفت</li>
              </ul>
            </div>

            {/* دکمه‌ها */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                بازگشت به داشبورد
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-lg hover:from-cyan-600 hover:to-teal-600 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'در حال ارسال...' : 'ادامه به پرداخت'}
              </button>
            </div>
          </form>
        </div>

        {/* اعلان موقت */}
        {showNotification && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg">
            اطلاعات شما ذخیره شد
          </div>
        )}
      </div>
    </div>
  );
};

export default Consultation;