import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/common/Button";
import InputField from "../components/common/InputField";
import { logger } from "../utils/logger";
import Alert from "../components/common/Alert";
import fatahiyanLogo from "../assets/fattahian3.png";
import { translateError } from "../utils/errorTranslations";
// صفحه ورود
const Login = () => {
  const navigate = useNavigate();
  const { login, adminLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState("");
  const [formData, setFormData] = useState({
    mobile: "",
    password: "",
    rememberMe: false,
    isAdminLogin: false, // اضافه کردن فیلد برای تفکیک لاگین ادمین
  });

  // بارگذاری اطلاعات ذخیره شده
  useEffect(() => {
    const savedData = localStorage.getItem("loginFormData");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData((prev) => ({ ...prev, ...parsedData }));
      } catch (error) {
        logger.error('Failed to load login information', { error });
      }
    }
  }, []);

  // ذخیره اطلاعات فرم
  useEffect(() => {
    // فقط mobile و rememberMe را ذخیره می‌کنیم، نه password
    const dataToSave = {
      mobile: formData.mobile,
      rememberMe: formData.rememberMe,
    };
    localStorage.setItem("loginFormData", JSON.stringify(dataToSave));
  }, [formData.mobile, formData.rememberMe]);

  // اعتبارسنجی فیلدها
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case "mobile": {
        const mobileRegex = /^09\d{9}$/;
        if (!mobileRegex.test(value)) {
          newErrors.mobile = "شماره موبایل باید با 09 شروع شده و 11 رقم باشد";
        } else {
          delete newErrors.mobile;
        }
        break;
      }

      case "password":
        // Password validation removed - no restrictions
        delete newErrors.password;
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  // مدیریت تغییرات فیلدها
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: fieldValue }));

    if (type !== "checkbox") {
      validateField(name, value);
    }

    // پاک کردن خطای ورود در صورت تغییر فیلدها
    if (loginError) {
      setLoginError("");
    }
  };

  // مدیریت blur فیلدها
  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  // ارسال فرم ورود
  const handleSubmit = (e) => {
    e.preventDefault();

    // اعتبارسنجی کامل
    validateField("mobile", formData.mobile);
    validateField("password", formData.password);

    // بررسی وجود خطا
    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsLoading(true);
    setLoginError("");

    // ورود با استفاده از API
    setTimeout(async () => {
      try {
        // ورود کاربر عادی یا ادمین
        const loginFunction = formData.isAdminLogin ? adminLogin : login;
        const response = await loginFunction(
          formData.mobile,
          formData.password,
          formData.rememberMe
        );

        // پاک کردن فرم
        localStorage.removeItem("loginFormData");

        // هدایت بر اساس نوع کاربر
        if (response.isAdmin) {
          navigate("/admin/dashboard");
        } else {
          navigate("/pet-selection");
        }
      } catch (error) {
        // ترجمه خطای ورود به فارسی
        const translatedError =
          translateError(error.message) ||
          "شماره موبایل یا رمز عبور اشتباه است";
        setLoginError(translatedError);
      } finally {
        setIsLoading(false);
      }
    }, 1500);
  };

  // بررسی معتبر بودن فرم
  const isFormValid = () => {
    return (
      formData.mobile.trim() !== "" &&
      formData.password.trim() !== "" &&
      Object.keys(errors).length === 0
    );
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-2 sm:p-4">
      <div className="max-w-md w-full mx-2 sm:mx-4">
        {/* لوگو و عنوان */}
        <div className="text-center mb-4 sm:mb-8">
          <a
            href="https://fattahianpethospital.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <img
              src={fatahiyanLogo}
              alt="لوگو بیمارستان حیوانات خانگی دکتر فتاحیان"
              className="w-36 h-36 sm:w-52 sm:h-52 md:w-68 md:h-68 mx-auto mb-2 sm:mb-4 object-contain cursor-pointer hover:opacity-80 transition-opacity"
            />
          </a>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            ورود به حساب کاربری
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            برای دسترسی به خدمات مشاوره وارد شوید
          </p>
        </div>

        {/* فرم ورود */}
        <div className="card">
          {/* نمایش خطای ورود */}
          {loginError && (
            <div className="mb-6">
              <Alert type="error" message={loginError} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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

            {/* چک باکس ادمین */}
            <div className="flex items-center">
              <input
                id="isAdminLogin"
                name="isAdminLogin"
                type="checkbox"
                checked={formData.isAdminLogin}
                onChange={handleInputChange}
                className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isAdminLogin"
                className="mr-2 block text-sm text-gray-700"
              >
                ورود به عنوان ادمین
              </label>
            </div>

            {/* چک باکس "مرا به خاطر بسپار" */}
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
              />
              <label
                htmlFor="rememberMe"
                className="mr-2 block text-sm text-gray-700"
              >
                مرا به خاطر بسپار
              </label>
            </div>

            {/* دکمه ورود */}
            <Button
              type="submit"
              loading={isLoading}
              disabled={!isFormValid()}
              size="lg"
              className="w-full"
            >
              ورود
            </Button>
          </form>

          {/* لینک ثبت نام */}
          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <p className="text-gray-600">
              حساب کاربری ندارید؟{" "}
              <button
                onClick={() => navigate("/registration")}
                className="text-cyan-600 hover:underline font-medium"
              >
                ثبت نام کنید
              </button>
            </p>
          </div>
        </div>

        {/* اطلاعات تماس */}
        <div className="text-center mt-4 sm:mt-8">
          <p className="text-xs sm:text-sm text-gray-500">
            در صورت بروز مشکل با شماره{" "}
            <span className="font-medium text-gray-700">021-12345678</span> تماس
            بگیرید
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
