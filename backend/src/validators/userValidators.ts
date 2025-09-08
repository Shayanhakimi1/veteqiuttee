import { body, param, query } from 'express-validator';

export const updateUserValidator = [
  param('id')
    .isUUID()
    .withMessage('شناسه کاربر معتبر نیست'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('نام باید بین 2 تا 50 کاراکتر باشد')
    .matches(/^[\u0600-\u06FF\s]+$/)
    .withMessage('نام باید فقط شامل حروف فارسی باشد'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('نام خانوادگی باید بین 2 تا 50 کاراکتر باشد')
    .matches(/^[\u0600-\u06FF\s]+$/)
    .withMessage('نام خانوادگی باید فقط شامل حروف فارسی باشد'),
  body('phoneNumber')
    .optional()
    .matches(/^09\d{9}$/)
    .withMessage('شماره تلفن معتبر وارد کنید (09xxxxxxxxx)'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('تاریخ تولد معتبر وارد کنید')
    .custom((value) => {
      if (value && new Date(value) > new Date()) {
        throw new Error('تاریخ تولد نمی‌تواند در آینده باشد');
      }
      return true;
    }),
  body('gender')
    .optional()
    .isIn(['MALE', 'FEMALE', 'OTHER'])
    .withMessage('جنسیت معتبر انتخاب کنید'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('آدرس نباید بیش از 500 کاراکتر باشد'),
  body('profilePicture')
    .optional()
    .isURL()
    .withMessage('آدرس تصویر پروفایل معتبر نیست'),
  body('emergencyContact')
    .optional()
    .isObject()
    .withMessage('اطلاعات تماس اضطراری باید آبجکت باشد'),
  body('emergencyContact.name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('نام تماس اضطراری باید بین 2 تا 100 کاراکتر باشد'),
  body('emergencyContact.phoneNumber')
    .optional()
    .matches(/^09\d{9}$/)
    .withMessage('شماره تلفن تماس اضطراری معتبر وارد کنید'),
  body('emergencyContact.relationship')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('نسبت تماس اضطراری نباید بیش از 50 کاراکتر باشد'),
  body('preferences')
    .optional()
    .isObject()
    .withMessage('تنظیمات باید آبجکت باشد'),
  body('preferences.language')
    .optional()
    .isIn(['fa', 'en'])
    .withMessage('زبان معتبر انتخاب کنید'),
  body('preferences.timezone')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('منطقه زمانی نباید بیش از 50 کاراکتر باشد'),
  body('preferences.notifications')
    .optional()
    .isObject()
    .withMessage('تنظیمات اعلان‌ها باید آبجکت باشد'),
  body('preferences.notifications.email')
    .optional()
    .isBoolean()
    .withMessage('تنظیم اعلان ایمیل باید بولین باشد'),
  body('preferences.notifications.sms')
    .optional()
    .isBoolean()
    .withMessage('تنظیم اعلان پیامک باید بولین باشد'),
  body('preferences.notifications.push')
    .optional()
    .isBoolean()
    .withMessage('تنظیم اعلان پوش باید بولین باشد')
];

export const getUserValidator = [
  param('id')
    .isUUID()
    .withMessage('شناسه کاربر معتبر نیست')
];

export const deleteUserValidator = [
  param('id')
    .isUUID()
    .withMessage('شناسه کاربر معتبر نیست')
];

export const getUsersValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('شماره صفحه باید عدد مثبت باشد'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('تعداد نتایج باید بین 1 تا 100 باشد'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('جستجو نباید بیش از 100 کاراکتر باشد'),
  query('role')
    .optional()
    .isIn(['USER', 'ADMIN', 'VETERINARIAN'])
    .withMessage('نقش معتبر انتخاب کنید'),
  query('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'])
    .withMessage('وضعیت معتبر انتخاب کنید'),
  query('gender')
    .optional()
    .isIn(['MALE', 'FEMALE', 'OTHER'])
    .withMessage('جنسیت معتبر انتخاب کنید'),
  query('isEmailVerified')
    .optional()
    .isBoolean()
    .withMessage('وضعیت تأیید ایمیل باید بولین باشد'),
  query('isPhoneVerified')
    .optional()
    .isBoolean()
    .withMessage('وضعیت تأیید تلفن باید بولین باشد'),
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('تاریخ شروع معتبر وارد کنید'),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('تاریخ پایان معتبر وارد کنید'),
  query('sortBy')
    .optional()
    .isIn(['firstName', 'lastName', 'email', 'createdAt', 'updatedAt', 'lastLoginAt'])
    .withMessage('فیلد مرتب‌سازی معتبر انتخاب کنید'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('ترتیب مرتب‌سازی معتبر انتخاب کنید')
];

export const updateUserStatusValidator = [
  param('id')
    .isUUID()
    .withMessage('شناسه کاربر معتبر نیست'),
  body('status')
    .isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'])
    .withMessage('وضعیت معتبر انتخاب کنید'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('دلیل نباید بیش از 500 کاراکتر باشد'),
  body('suspensionEndDate')
    .optional()
    .isISO8601()
    .withMessage('تاریخ پایان تعلیق معتبر وارد کنید')
    .custom((value, { req }) => {
      if (req.body.status === 'SUSPENDED' && !value) {
        throw new Error('تاریخ پایان تعلیق الزامی است');
      }
      if (value && new Date(value) <= new Date()) {
        throw new Error('تاریخ پایان تعلیق باید در آینده باشد');
      }
      return true;
    })
];

export const updateUserRoleValidator = [
  param('id')
    .isUUID()
    .withMessage('شناسه کاربر معتبر نیست'),
  body('role')
    .isIn(['USER', 'ADMIN', 'VETERINARIAN'])
    .withMessage('نقش معتبر انتخاب کنید'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('دلیل نباید بیش از 500 کاراکتر باشد')
];

export const getUsersByRoleValidator = [
  param('role')
    .isIn(['USER', 'ADMIN', 'VETERINARIAN'])
    .withMessage('نقش معتبر انتخاب کنید'),
  ...getUsersValidator.filter(validator => 
    !validator.toString().includes('role')
  )
];

export const getUsersByStatusValidator = [
  param('status')
    .isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'])
    .withMessage('وضعیت معتبر انتخاب کنید'),
  ...getUsersValidator.filter(validator => 
    !validator.toString().includes('status')
  )
];

export const updateUserPreferencesValidator = [
  param('id')
    .isUUID()
    .withMessage('شناسه کاربر معتبر نیست'),
  body('language')
    .optional()
    .isIn(['fa', 'en'])
    .withMessage('زبان معتبر انتخاب کنید'),
  body('timezone')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('منطقه زمانی نباید بیش از 50 کاراکتر باشد'),
  body('notifications')
    .optional()
    .isObject()
    .withMessage('تنظیمات اعلان‌ها باید آبجکت باشد'),
  body('notifications.email')
    .optional()
    .isBoolean()
    .withMessage('تنظیم اعلان ایمیل باید بولین باشد'),
  body('notifications.sms')
    .optional()
    .isBoolean()
    .withMessage('تنظیم اعلان پیامک باید بولین باشد'),
  body('notifications.push')
    .optional()
    .isBoolean()
    .withMessage('تنظیم اعلان پوش باید بولین باشد'),
  body('theme')
    .optional()
    .isIn(['light', 'dark', 'auto'])
    .withMessage('تم معتبر انتخاب کنید'),
  body('dateFormat')
    .optional()
    .isIn(['jalali', 'gregorian'])
    .withMessage('فرمت تاریخ معتبر انتخاب کنید'),
  body('timeFormat')
    .optional()
    .isIn(['12', '24'])
    .withMessage('فرمت زمان معتبر انتخاب کنید')
];

export const updateUserEmergencyContactValidator = [
  param('id')
    .isUUID()
    .withMessage('شناسه کاربر معتبر نیست'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('نام تماس اضطراری باید بین 2 تا 100 کاراکتر باشد'),
  body('phoneNumber')
    .matches(/^09\d{9}$/)
    .withMessage('شماره تلفن تماس اضطراری معتبر وارد کنید'),
  body('relationship')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('نسبت تماس اضطراری باید بین 2 تا 50 کاراکتر باشد'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('ایمیل تماس اضطراری معتبر وارد کنید')
    .normalizeEmail(),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('آدرس تماس اضطراری نباید بیش از 500 کاراکتر باشد')
];

export const uploadUserProfilePictureValidator = [
  param('id')
    .isUUID()
    .withMessage('شناسه کاربر معتبر نیست')
];

export const getUserStatsValidator = [
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('تاریخ شروع معتبر وارد کنید'),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('تاریخ پایان معتبر وارد کنید'),
  query('groupBy')
    .optional()
    .isIn(['day', 'week', 'month', 'year'])
    .withMessage('گروه‌بندی معتبر انتخاب کنید'),
  query('includeInactive')
    .optional()
    .isBoolean()
    .withMessage('شامل کاربران غیرفعال باید بولین باشد')
];

export const searchUsersValidator = [
  query('q')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('جستجو باید بین 2 تا 100 کاراکتر باشد'),
  query('fields')
    .optional()
    .isArray()
    .withMessage('فیلدهای جستجو باید آرایه باشد'),
  query('fields.*')
    .optional()
    .isIn(['firstName', 'lastName', 'email', 'phoneNumber'])
    .withMessage('فیلد جستجو معتبر انتخاب کنید'),
  ...getUsersValidator.filter(validator => 
    !validator.toString().includes('search')
  )
];

export const bulkUpdateUsersValidator = [
  body('userIds')
    .isArray({ min: 1, max: 100 })
    .withMessage('شناسه کاربران باید آرایه‌ای بین 1 تا 100 عضو باشد'),
  body('userIds.*')
    .isUUID()
    .withMessage('شناسه کاربر معتبر نیست'),
  body('updates')
    .isObject()
    .withMessage('به‌روزرسانی‌ها باید آبجکت باشد'),
  body('updates.status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'])
    .withMessage('وضعیت معتبر انتخاب کنید'),
  body('updates.role')
    .optional()
    .isIn(['USER', 'ADMIN', 'VETERINARIAN'])
    .withMessage('نقش معتبر انتخاب کنید'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('دلیل نباید بیش از 500 کاراکتر باشد')
];