import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../hooks/useApp";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/common/Button";
import InputField from "../components/common/InputField";
import ProgressBar from "../components/common/ProgressBar";
import Alert from "../components/common/Alert";
import AdModal from "../components/common/AdModal";
import {
  translateError,
  translateValidationErrors,
} from "../utils/errorTranslations";

// صفحه ثبت نام
const Registration = () => {
  const navigate = useNavigate();
  const { selectedPet } = useApp();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showAdModal, setShowAdModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    petName: "",
    petBreed: "",
    petAge: "",
    petGender: "",
    isNeutered: false,
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  // پاک‌سازی اطلاعات پس از رفرش صفحه
  useEffect(() => {
    // هیچ اطلاعاتی در localStorage ذخیره نمی‌شود
    // فرم همیشه خالی شروع می‌شود
    console.log("صفحه ثبت‌نام بارگذاری شد - فرم خالی");
  }, []);

  // تولید placeholder بر اساس نوع حیوان انتخابی
  const getBreedPlaceholder = () => {
    if (!selectedPet) return "نژاد حیوان خانگی را وارد کنید";

    switch (selectedPet.name) {
      case "سگ":
        return "نژاد حیوان خانگی را وارد کنید (مثال: ژرمن شپرد)";
      case "گربه":
        return "نژاد حیوان خانگی را وارد کنید (مثال: پرشین)";
      default:
        return "نژاد حیوان خانگی را وارد کنید (مثال: خرگوش)";
    }
  };

  // عدم ذخیره خودکار در localStorage
  // اطلاعات فقط در حافظه موقت نگهداری می‌شوند

  // نمایش مودال تبلیغاتی بعد از 5 ثانیه
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAdModal(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // اعتبارسنجی فیلدها
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case "fullName": {
        const nameParts = value
          ? value
              .trim()
              .split(" ")
              .filter((part) => part.length > 0)
          : [];
        if (!value || value.length < 3) {
          newErrors.fullName = "نام و نام‌خانوادگی باید حداقل 3 کاراکتر باشد";
        } else if (nameParts.length < 2) {
          newErrors.fullName = "لطفاً هم نام و هم نام‌خانوادگی را وارد کنید";
        } else {
          delete newErrors.fullName;
        }
        break;
      }

      case "petName":
        if (value.length < 2) {
          newErrors.petName = "نام حیوان خانگی باید حداقل 2 کاراکتر باشد";
        } else {
          delete newErrors.petName;
        }
        break;

      case "petBreed":
        if (value.length < 2) {
          newErrors.petBreed = "نژاد حیوان خانگی باید حداقل 2 کاراکتر باشد";
        } else {
          delete newErrors.petBreed;
        }
        break;

      case "petAge":
        if (!value) {
          newErrors.petAge = "لطفاً سن حیوان خانگی را وارد کنید";
        } else {
          delete newErrors.petAge;
        }
        break;

      case "petGender":
        if (!value) {
          newErrors.petGender = "لطفاً جنسیت حیوان خانگی را انتخاب کنید";
        } else {
          delete newErrors.petGender;
        }
        break;

      case "mobile": {
        // تبدیل اعداد فارسی به انگلیسی
        const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
        const normalizedValue = value.replace(/[\u06F0-\u06F9]/g, (d) =>
          String(persianDigits.indexOf(d))
        );
        const mobileRegex = /^09[0-9]{9}$/;
        if (!mobileRegex.test(normalizedValue)) {
          newErrors.mobile = "شماره موبایل باید با 09 شروع شده و 11 رقم باشد";
        } else {
          delete newErrors.mobile;
        }
        break;
      }

      case "password":
        if (value.length < 6) {
          newErrors.password = "رمز عبور باید حداقل 6 کاراکتر باشد";
        } else {
          delete newErrors.password;
        }
        // بررسی مطابقت با تایید رمز
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          newErrors.confirmPassword = "تایید رمز عبور مطابقت ندارد";
        } else if (
          formData.confirmPassword &&
          value === formData.confirmPassword
        ) {
          delete newErrors.confirmPassword;
        }
        break;

      case "confirmPassword":
        if (value !== formData.password) {
          newErrors.confirmPassword = "تایید رمز عبور مطابقت ندارد";
        } else {
          delete newErrors.confirmPassword;
        }
        break;

      default:
        break;
    }

    // پاک کردن خطای submit در صورت تغییر هر فیلد
    if (newErrors.submit) {
      delete newErrors.submit;
    }
    
    setErrors(newErrors);
  };

  // محاسبه قدرت رمز عبور
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // مدیریت تغییرات فیلدها
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let fieldValue = type === "checkbox" ? checked : value;

    // تبدیل اعداد فارسی به انگلیسی برای فیلد موبایل
    if (name === "mobile" && type !== "checkbox") {
      const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
      fieldValue = value.replace(/[\u06F0-\u06F9]/g, (d) =>
        String(persianDigits.indexOf(d))
      );
    }

    setFormData((prev) => ({ ...prev, [name]: fieldValue }));
    if (type !== "checkbox") {
      validateField(name, fieldValue);
    }
  };

  // مدیریت blur فیلدها
  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  // ارسال فرم
  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Form submitted with data:", formData);

    // اعتبارسنجی کامل
    const newErrors = {};

    // بررسی تمام فیلدهای ضروری
    const requiredFields = {
      fullName: "نام و نام‌خانوادگی",
      petName: "نام حیوان خانگی",
      petBreed: "نژاد حیوان خانگی",
      petAge: "سن حیوان خانگی",
      petGender: "جنسیت حیوان خانگی",
      mobile: "شماره موبایل",
      password: "رمز عبور",
      confirmPassword: "تایید رمز عبور",
    };

    // بررسی فیلدهای خالی
    Object.keys(requiredFields).forEach((field) => {
      if (!formData[field] || formData[field].toString().trim() === "") {
        newErrors[field] = `${requiredFields[field]} الزامی است`;
      }
    });

    // اعتبارسنجی تخصصی
    if (formData.fullName && formData.fullName.length < 3) {
      newErrors.fullName = "نام و نام‌خانوادگی باید حداقل 3 کاراکتر باشد";
    } else if (formData.fullName) {
      const nameParts = formData.fullName
        .trim()
        .split(" ")
        .filter((part) => part.length > 0);
      if (nameParts.length < 2) {
        newErrors.fullName = "لطفاً هم نام و هم نام‌خانوادگی را وارد کنید";
      }
    }

    if (formData.mobile) {
      const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
      const normalizedMobile = formData.mobile.replace(
        /[\u06F0-\u06F9]/g,
        (d) => String(persianDigits.indexOf(d))
      );
      const mobileRegex = /^09[0-9]{9}$/;
      if (!mobileRegex.test(normalizedMobile)) {
        newErrors.mobile = "شماره موبایل باید با 09 شروع شده و 11 رقم باشد";
      }
    }

    // Password validation removed - no restrictions

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "تایید رمز عبور مطابقت ندارد";
    }

    if (!selectedPet) {
      newErrors.petType = "لطفاً نوع حیوان خانگی را انتخاب کنید";
    }

    console.log("Validation errors:", newErrors);
    setErrors(newErrors);

    // بررسی وجود خطا
    if (Object.keys(newErrors).length > 0) {
      console.log("Form has validation errors, not submitting");
      return;
    }

    console.log("Form is valid, proceeding with registration...");

    setIsLoading(true);

    // ثبت‌نام با استفاده از API
    setTimeout(async () => {
      try {
        console.log("شروع فرآیند ثبت‌نام...");

        // پاک کردن خطاهای قبلی
        setErrors((prev) => ({ ...prev, submit: null }));

        // تقسیم اطلاعات به بخش‌های مختلف
        const nameParts = formData.fullName
          .trim()
          .split(" ")
          .filter((part) => part.length > 0);
        const userData = {
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || nameParts[0] || "",
          mobile: formData.mobile,
          password: formData.password,
        };

        // تبدیل نوع حیوان به انگلیسی
        const getSpeciesInEnglish = (persianName) => {
          const speciesMap = {
            'سگ': 'dog',
            'گربه': 'cat',
            'پرنده': 'bird',
            'خرگوش': 'rabbit',
            'همستر': 'hamster',
            'ماهی': 'fish',
            'خزنده': 'reptile'
          };
          return speciesMap[persianName] || 'other';
        };

        // تبدیل جنسیت به انگلیسی
        const getGenderInEnglish = (persianGender) => {
          const genderMap = {
            'نر': 'MALE',
            'ماده': 'FEMALE'
          };
          return genderMap[persianGender] || 'UNKNOWN';
        };

        const petData = {
          name: formData.petName,
          species: getSpeciesInEnglish(selectedPet?.name || 'نامشخص'),
          breed: formData.petBreed || null,
          age: formData.petAge ? parseInt(formData.petAge) : null,
          gender: getGenderInEnglish(formData.petGender),
          isNeutered: Boolean(formData.isNeutered),
        };

        console.log("ارسال اطلاعات به سرور:", { userData, petData });

        // ثبت‌نام کاربر
        const response = await register(userData, petData);
        console.log("پاسخ سرور:", response);

        setIsLoading(false);

        // نمایش پیام موفقیت
        setErrors({ submit: null });

        // هدایت به صفحه داشبورد پس از ثبت‌نام موفق
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } catch (error) {
        console.error("خطا در ثبت‌نام:", error);
        setIsLoading(false);

        // مدیریت انواع مختلف خطا
        let errorMessage = "خطا در ثبت‌نام. لطفاً دوباره تلاش کنید.";

        try {
          // بررسی نوع خطا
          if (error.name === "TypeError" && error.message.includes("fetch")) {
            errorMessage =
              "خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید.";
          } else if (error.name === "AbortError") {
            errorMessage = "درخواست لغو شد. لطفاً دوباره تلاش کنید.";
          } else if (error.response) {
            // خطاهای HTTP
            const status = error.response.status;
            const data = error.response.data;

            switch (status) {
              case 400:
                // ترجمه خطاهای اعتبارسنجی
                if (
                  data?.message &&
                  data.message.includes("Validation error:")
                ) {
                  errorMessage = translateValidationErrors(data.message);
                } else {
                  errorMessage =
                    translateError(data?.message) ||
                    "اطلاعات وارد شده معتبر نیست.";
                }
                break;
              case 409:
                errorMessage =
                  translateError(data?.message) ||
                  "کاربری با این شماره موبایل قبلاً ثبت‌نام کرده است.";
                // حذف ریدایرکت خودکار به صفحه ورود؛ کاربر می‌تواند دستی به صفحه ورود برود
                break;
              case 422:
                errorMessage =
                  translateError(data?.message) ||
                  "اطلاعات وارد شده ناقص یا نامعتبر است.";
                break;
              case 500:
                errorMessage = "خطا در سرور. لطفاً بعداً تلاش کنید.";
                break;
              case 503:
                errorMessage =
                  "سرویس موقتاً در دسترس نیست. لطفاً بعداً تلاش کنید.";
                break;
              default:
                errorMessage =
                  translateError(data?.message) ||
                  `خطا در سرور (کد: ${status})`;
            }
          } else if (error.message) {
            // ترجمه پیام خطا
            errorMessage = translateError(error.message);

            // بررسی خطاهای خاص برای هدایت
            if (
              error.message.includes("قبلاً در سیستم ثبت‌نام کرده است") ||
              error.message.includes(
                "کاربری با این شماره موبایل قبلاً ثبت‌نام کرده است"
              ) ||
              error.message.includes("User already exists") ||
              error.message.includes("duplicate")
            ) {
              // حذف ریدایرکت خودکار به صفحه ورود؛ صرفاً نمایش پیام خطا
            }
          }
        } catch (parseError) {
          console.error("خطا در تجزیه خطا:", parseError);
          errorMessage = "خطای غیرمنتظره رخ داد. لطفاً دوباره تلاش کنید.";
        }

        setErrors((prev) => ({ ...prev, submit: errorMessage }));
      }
    }, 1500);
  };

  // بررسی معتبر بودن فرم
  const isFormValid = () => {
    const requiredFields = [
      "fullName",
      "petName",
      "petBreed",
      "petAge",
      "petGender",
      "mobile",
      "password",
      "confirmPassword",
    ];
    
    // بررسی پر بودن فیلدهای الزامی
    const allRequiredFieldsFilled = requiredFields.every((field) => {
      const value = formData[field];
      return typeof value === "string"
        ? value.trim() !== ""
        : value !== null && value !== undefined;
    });
    
    // بررسی عدم وجود خطا در فیلدهای پر شده (به جز خطای submit)
    const hasFieldErrors = Object.keys(errors).some(key => {
      if (key === 'submit') return false; // خطای submit نباید دکمه را غیرفعال کند
      const fieldValue = formData[key];
      const hasValue = typeof fieldValue === "string" 
        ? fieldValue.trim() !== "" 
        : fieldValue !== null && fieldValue !== undefined;
      return hasValue && errors[key]; // فقط اگر فیلد پر است و خطا دارد
    });
    
    return allRequiredFieldsFilled && !hasFieldErrors;
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* هدر */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <ProgressBar currentStep={2} totalSteps={4} />
        </div>
      </div>

      {/* محتوای اصلی */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* نمایش نوع پت انتخابی */}
        {selectedPet && (
          <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 mb-8">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedPet.emoji}</span>
              <div>
                <p className="text-sm text-cyan-600 font-medium">
                  حیوان خانگی انتخابی:
                </p>
                <p className="text-cyan-800 font-bold">{selectedPet.name}</p>
              </div>
            </div>
          </div>
        )}

        {/* عنوان */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            ثبت نام در سیستم
          </h1>
          <p className="text-gray-600">
            لطفاً اطلاعات خود و حیوان خانگی‌تان را وارد کنید
          </p>
        </div>

        {/* فرم ثبت نام */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card">
            {/* اطلاعات شخصی */}
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              اطلاعات شخصی
            </h3>

            <div className="space-y-4">
              <InputField
                label="نام و نام‌خانوادگی"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder="نام و نام‌خانوادگی خود را وارد کنید"
                error={errors.fullName}
                required
              />

              <InputField
                label="شماره موبایل"
                name="mobile"
                type="tel"
                value={formData.mobile}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder="09xxxxxxxxx"
                error={errors.mobile}
                required
                className="ltr text-left"
                maxLength={11}
              />
            </div>
          </div>

          <div className="card">
            {/* اطلاعات حیوان خانگی */}
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              اطلاعات حیوان خانگی
            </h3>

            <div className="space-y-4">
              <InputField
                label="نام حیوان خانگی"
                name="petName"
                value={formData.petName}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder="نام حیوان خانگی خود را وارد کنید"
                error={errors.petName}
                required
              />

              <InputField
                label="نژاد حیوان خانگی"
                name="petBreed"
                value={formData.petBreed}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder={getBreedPlaceholder()}
                error={errors.petBreed}
                required
              />

              <InputField
                label="سن حیوان خانگی"
                name="petAge"
                value={formData.petAge}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder="سن حیوان خانگی را وارد کنید (مثال: 2 سال، 6 ماه)"
                error={errors.petAge}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  جنسیت حیوان خانگی <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="petGender"
                      value="نر"
                      checked={formData.petGender === "نر"}
                      onChange={handleInputChange}
                      className="ml-2 text-cyan-600 focus:ring-cyan-500"
                    />
                    نر
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="petGender"
                      value="ماده"
                      checked={formData.petGender === "ماده"}
                      onChange={handleInputChange}
                      className="ml-2 text-cyan-600 focus:ring-cyan-500"
                    />
                    ماده
                  </label>
                </div>
                {errors.petGender && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.petGender}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isNeutered"
                    checked={formData.isNeutered}
                    onChange={handleInputChange}
                    className="ml-2 text-cyan-600 focus:ring-cyan-500 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    عقیم شده است
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="card">
            {/* رمز عبور */}
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              رمز عبور
            </h3>

            <div className="space-y-4">
              <div>
                <InputField
                  label="رمز عبور"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  placeholder="رمز عبور خود را وارد کنید"
                  error={errors.password}
                  required
                  showPasswordToggle
                />

                {/* نمایشگر قدرت رمز */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>قدرت رمز عبور:</span>
                      <span>{passwordStrength}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength < 50
                            ? "bg-red-500"
                            : passwordStrength < 75
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${passwordStrength}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <InputField
                label="تایید رمز عبور"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder="رمز عبور را مجدداً وارد کنید"
                error={errors.confirmPassword}
                required
                showPasswordToggle
              />
            </div>
          </div>

          {/* نمایش خطای ثبت نام */}
          {errors.submit && (
            <Alert type="error" message={errors.submit} className="mb-4" />
          )}

          {/* دکمه ثبت نام */}
          <div className="text-center pt-4">
            <Button
              type="submit"
              loading={isLoading}
              disabled={!isFormValid()}
              size="lg"
              className="min-w-48"
            >
              ثبت نام
            </Button>

            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => navigate("/pet-selection")}
                disabled={isLoading}
              >
                بازگشت
              </Button>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              با ثبت نام، شما با
              <a href="#" className="text-cyan-600 hover:underline">
                قوانین و مقررات
              </a>{" "}
              موافقت می‌کنید
            </p>
          </div>
        </form>

        {/* لینک ورود */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            قبلاً ثبت نام کرده‌اید؟{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-cyan-600 hover:underline font-medium"
            >
              وارد شوید
            </button>
          </p>
        </div>
      </div>

      {/* مودال تبلیغاتی */}
      <AdModal isOpen={showAdModal} onClose={() => setShowAdModal(false)} />
    </div>
  );
};

export default Registration;
