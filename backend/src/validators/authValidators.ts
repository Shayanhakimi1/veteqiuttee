import { body } from 'express-validator';

export const registerValidator = [
  body('email')
    .isEmail()
    .withMessage('ایمیل معتبر وارد کنید')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('رمز عبور باید حداقل 8 کاراکتر باشد')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('رمز عبور باید شامل حروف کوچک، بزرگ و عدد باشد'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('نام باید بین 2 تا 50 کاراکتر باشد')
    .matches(/^[\u0600-\u06FF\s]+$/)
    .withMessage('نام باید فقط شامل حروف فارسی باشد'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('نام خانوادگی باید بین 2 تا 50 کاراکتر باشد')
    .matches(/^[\u0600-\u06FF\s]+$/)
    .withMessage('نام خانوادگی باید فقط شامل حروف فارسی باشد'),
  body('phoneNumber')
    .matches(/^09\d{9}$/)
    .withMessage('شماره تلفن معتبر وارد کنید (09xxxxxxxxx)'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('تاریخ تولد معتبر وارد کنید'),
  body('gender')
    .optional()
    .isIn(['MALE', 'FEMALE', 'OTHER'])
    .withMessage('جنسیت معتبر انتخاب کنید'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('آدرس نباید بیش از 500 کاراکتر باشد')
];

export const loginValidator = [
  body('email')
    .isEmail()
    .withMessage('ایمیل معتبر وارد کنید')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('رمز عبور الزامی است')
];

export const refreshTokenValidator = [
  body('refreshToken')
    .notEmpty()
    .withMessage('توکن تازه‌سازی الزامی است')
];

export const sendVerificationCodeValidator = [
  body('phoneNumber')
    .matches(/^09\d{9}$/)
    .withMessage('شماره تلفن معتبر وارد کنید (09xxxxxxxxx)')
];

export const verifyCodeValidator = [
  body('phoneNumber')
    .matches(/^09\d{9}$/)
    .withMessage('شماره تلفن معتبر وارد کنید (09xxxxxxxxx)'),
  body('code')
    .isLength({ min: 4, max: 6 })
    .withMessage('کد تأیید باید بین 4 تا 6 رقم باشد')
    .isNumeric()
    .withMessage('کد تأیید باید عددی باشد')
];

export const forgotPasswordValidator = [
  body('email')
    .isEmail()
    .withMessage('ایمیل معتبر وارد کنید')
    .normalizeEmail()
];

export const resetPasswordValidator = [
  body('token')
    .notEmpty()
    .withMessage('توکن بازیابی الزامی است'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('رمز عبور جدید باید حداقل 8 کاراکتر باشد')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('رمز عبور جدید باید شامل حروف کوچک، بزرگ و عدد باشد')
];

export const changePasswordValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('رمز عبور فعلی الزامی است'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('رمز عبور جدید باید حداقل 8 کاراکتر باشد')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('رمز عبور جدید باید شامل حروف کوچک، بزرگ و عدد باشد')
];

export const updateProfileValidator = [
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
    .withMessage('تاریخ تولد معتبر وارد کنید'),
  body('gender')
    .optional()
    .isIn(['MALE', 'FEMALE', 'OTHER'])
    .withMessage('جنسیت معتبر انتخاب کنید'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('آدرس نباید بیش از 500 کاراکتر باشد')
];