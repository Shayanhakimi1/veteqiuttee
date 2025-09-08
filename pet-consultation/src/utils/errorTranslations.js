// ترجمه خطاهای انگلیسی به فارسی
export const errorTranslations = {
  // خطاهای عمومی
  'User with this email already exists': 'کاربری با این ایمیل قبلاً ثبت‌نام کرده است',
  'User already exists': 'کاربری با این اطلاعات قبلاً ثبت‌نام کرده است',
  'Invalid credentials': 'ایمیل یا رمز عبور اشتباه است',
  'User not found': 'کاربر یافت نشد',
  'Unauthorized': 'دسترسی غیرمجاز',
  'Access denied': 'دسترسی مجاز نیست',
  'Token expired': 'زمان نشست شما به پایان رسیده است',
  'Invalid token': 'توکن نامعتبر است',
  'Server error': 'خطا در سرور',
  'Internal server error': 'خطای داخلی سرور',
  'Bad request': 'درخواست نامعتبر',
  'Not found': 'یافت نشد',
  'Forbidden': 'دسترسی ممنوع',
  
  // خطاهای اعتبارسنجی فیلدها
  'Email is required': 'ایمیل الزامی است',
  'Password is required': 'رمز عبور الزامی است',
  'First name is required': 'نام الزامی است',
  'Last name is required': 'نام خانوادگی الزامی است',
  'Name is required': 'نام الزامی است',
  'Phone is required': 'شماره تلفن الزامی است',
  'Mobile is required': 'شماره موبایل الزامی است',
  'Full name is required': 'نام و نام‌خانوادگی الزامی است',
  'Pet name is required': 'نام حیوان خانگی الزامی است',
  'Pet type is required': 'نوع حیوان خانگی الزامی است',
  'Pet breed is required': 'نژاد حیوان خانگی الزامی است',
  'Pet age is required': 'سن حیوان خانگی الزامی است',
  'Pet gender is required': 'جنسیت حیوان خانگی الزامی است',
  'Please select pet type': 'لطفاً نوع حیوان خانگی را انتخاب کنید',
  'Please select pet gender': 'لطفاً جنسیت حیوان خانگی را انتخاب کنید',
  'Pet age must be a valid number': 'سن حیوان خانگی باید عدد معتبر باشد',
  'Pet age must be positive': 'سن حیوان خانگی باید مثبت باشد',
  'Confirm password is required': 'تایید رمز عبور الزامی است',
  'User with this mobile already exists': 'کاربری با این شماره موبایل قبلاً ثبت‌نام کرده است',
  'Mobile number already exists': 'شماره موبایل قبلاً ثبت شده است',
  'Duplicate mobile number': 'شماره موبایل تکراری است',
  
  // خطاهای اعتبارسنجی ایمیل
  'Please provide a valid email address': 'لطفاً یک ایمیل معتبر وارد کنید',
  'Invalid email format': 'فرمت ایمیل نامعتبر است',
  'Email must be a valid email': 'ایمیل باید معتبر باشد',
  
  // خطاهای اعتبارسنجی رمز عبور
  'Password must be at least 6 characters long': 'رمز عبور باید حداقل 6 کاراکتر باشد',
  'Password must be at least 8 characters long': 'رمز عبور باید حداقل 8 کاراکتر باشد',
  'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character': 'رمز عبور باید شامل حداقل یک حرف بزرگ، یک حرف کوچک، یک عدد و یک کاراکتر خاص باشد',
  'Password too weak': 'رمز عبور خیلی ضعیف است',
  'Password is too weak': 'رمز عبور خیلی ضعیف است',
  'Passwords do not match': 'رمزهای عبور مطابقت ندارند',
  'Password confirmation does not match': 'تایید رمز عبور مطابقت ندارد',
  'Confirm password does not match': 'تایید رمز عبور مطابقت ندارد',
  'Password and confirm password must match': 'رمز عبور و تایید آن باید یکسان باشند',
  'Password must contain uppercase letter': 'رمز عبور باید شامل حرف بزرگ باشد',
  'Password must contain lowercase letter': 'رمز عبور باید شامل حرف کوچک باشد',
  'Password must contain number': 'رمز عبور باید شامل عدد باشد',
  'Password must contain special character': 'رمز عبور باید شامل کاراکتر خاص باشد',
  
  // خطاهای اعتبارسنجی نام
  'Name must be at least 2 characters long': 'نام باید حداقل 2 کاراکتر باشد',
  'Name must not exceed 50 characters': 'نام نباید بیش از 50 کاراکتر باشد',
  'Name can only contain letters and spaces': 'نام فقط می‌تواند شامل حروف و فاصله باشد',
  'First name must be at least 2 characters long': 'نام باید حداقل 2 کاراکتر باشد',
  'Last name must be at least 2 characters long': 'نام خانوادگی باید حداقل 2 کاراکتر باشد',
  
  // خطاهای اعتبارسنجی تلفن و موبایل
  'Please provide a valid phone number': 'لطفاً شماره تلفن معتبر وارد کنید',
  'Invalid phone number format': 'فرمت شماره تلفن نامعتبر است',
  'Please provide a valid mobile number': 'لطفاً شماره موبایل معتبر وارد کنید',
  'Invalid mobile number format': 'فرمت شماره موبایل نامعتبر است',
  'Mobile number must start with 09': 'شماره موبایل باید با 09 شروع شود',
  'Mobile number must be 11 digits': 'شماره موبایل باید 11 رقم باشد',
  'Invalid mobile number': 'شماره موبایل نامعتبر است',
  
  // خطاهای اعتبارسنجی عمومی
  'Validation error': 'خطای اعتبارسنجی',
  'Required field': 'فیلد الزامی',
  'Invalid input': 'ورودی نامعتبر',
  'Field is required': 'این فیلد الزامی است',
  'Invalid format': 'فرمت نامعتبر',
  
  // خطاهای شبکه
  'Network error': 'خطای شبکه',
  'Connection failed': 'اتصال ناموفق',
  'Request timeout': 'زمان درخواست به پایان رسید',
  'Failed to fetch': 'خطا در دریافت اطلاعات',
  
  // خطاهای فایل
  'File too large': 'فایل خیلی بزرگ است',
  'Invalid file type': 'نوع فایل نامعتبر است',
  'File upload failed': 'آپلود فایل ناموفق بود',
  
  // خطاهای پرداخت
  'Payment failed': 'پرداخت ناموفق بود',
  'Invalid payment method': 'روش پرداخت نامعتبر است',
  'Payment timeout': 'زمان پرداخت به پایان رسید',
  
  // خطاهای مشاوره
  'Consultation not found': 'مشاوره یافت نشد',
  'Invalid consultation data': 'اطلاعات مشاوره نامعتبر است',
  'Consultation already exists': 'مشاوره قبلاً ثبت شده است',
  
  // خطاهای حیوان خانگی
  'Pet not found': 'حیوان خانگی یافت نشد',
  'Invalid pet data': 'اطلاعات حیوان خانگی نامعتبر است',
  'Pet already exists': 'حیوان خانگی قبلاً ثبت شده است',
  'petData.age must be a number': 'سن حیوان خانگی باید عدد باشد',
  'age must be a number': 'سن باید عدد باشد',
  'Pet age must be a number': 'سن حیوان خانگی باید عدد باشد'
};

// تابع ترجمه خطا
export const translateError = (errorMessage) => {
  if (!errorMessage || typeof errorMessage !== 'string') {
    return 'خطای نامشخص رخ داده است';
  }
  
  // جستجوی دقیق
  if (errorTranslations[errorMessage]) {
    return errorTranslations[errorMessage];
  }
  
  // جستجوی جزئی برای پیام‌های پیچیده
  for (const [englishError, persianError] of Object.entries(errorTranslations)) {
    if (errorMessage.includes(englishError)) {
      return persianError;
    }
  }
  
  // اگر ترجمه‌ای یافت نشد، پیام اصلی را برگردان
  return errorMessage;
};

// تابع ترجمه خطاهای اعتبارسنجی چندگانه
export const translateValidationErrors = (errorMessage) => {
  if (!errorMessage || typeof errorMessage !== 'string') {
    return 'خطای اعتبارسنجی رخ داده است';
  }
  
  // اگر پیام شامل "Validation error:" است، آن را حذف کن
  let cleanMessage = errorMessage.replace(/^Validation error:\s*/i, '');
  
  // تقسیم خطاهای چندگانه بر اساس کاما
  const errors = cleanMessage.split(',').map(error => error.trim());
  
  // ترجمه هر خطا
  const translatedErrors = errors.map(error => translateError(error));
  
  // ترکیب خطاهای ترجمه شده
  return translatedErrors.join('، ');
};

export default { errorTranslations, translateError, translateValidationErrors };