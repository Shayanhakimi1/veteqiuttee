import { body, param, query } from 'express-validator';

export const createPetValidator = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('نام حیوان خانگی باید بین 2 تا 50 کاراکتر باشد')
    .matches(/^[\u0600-\u06FF\s\w]+$/)
    .withMessage('نام حیوان خانگی شامل کاراکترهای غیرمجاز است'),
  body('species')
    .isIn(['DOG', 'CAT', 'BIRD', 'RABBIT', 'HAMSTER', 'FISH', 'REPTILE', 'OTHER'])
    .withMessage('نوع حیوان خانگی معتبر انتخاب کنید'),
  body('breed')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('نژاد نباید بیش از 100 کاراکتر باشد'),
  body('gender')
    .isIn(['MALE', 'FEMALE', 'UNKNOWN'])
    .withMessage('جنسیت معتبر انتخاب کنید'),
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
  body('weight')
    .optional()
    .isFloat({ min: 0.1, max: 1000 })
    .withMessage('وزن باید بین 0.1 تا 1000 کیلوگرم باشد'),
  body('color')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('رنگ نباید بیش از 50 کاراکتر باشد'),
  body('microchipId')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('شناسه میکروچیپ نباید بیش از 50 کاراکتر باشد'),
  body('medicalHistory')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('سابقه پزشکی نباید بیش از 2000 کاراکتر باشد'),
  body('allergies')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('آلرژی‌ها نباید بیش از 1000 کاراکتر باشد'),
  body('medications')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('داروها نباید بیش از 1000 کاراکتر باشد'),
  body('vaccinations')
    .optional()
    .isArray()
    .withMessage('واکسیناسیون‌ها باید آرایه باشد'),
  body('vaccinations.*')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('هر واکسیناسیون نباید بیش از 100 کاراکتر باشد'),
  body('specialNeeds')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('نیازهای خاص نباید بیش از 1000 کاراکتر باشد'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('یادداشت‌ها نباید بیش از 2000 کاراکتر باشد')
];

export const updatePetValidator = [
  param('id')
    .isUUID()
    .withMessage('شناسه حیوان خانگی معتبر نیست'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('نام حیوان خانگی باید بین 2 تا 50 کاراکتر باشد')
    .matches(/^[\u0600-\u06FF\s\w]+$/)
    .withMessage('نام حیوان خانگی شامل کاراکترهای غیرمجاز است'),
  body('species')
    .optional()
    .isIn(['DOG', 'CAT', 'BIRD', 'RABBIT', 'HAMSTER', 'FISH', 'REPTILE', 'OTHER'])
    .withMessage('نوع حیوان خانگی معتبر انتخاب کنید'),
  body('breed')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('نژاد نباید بیش از 100 کاراکتر باشد'),
  body('gender')
    .optional()
    .isIn(['MALE', 'FEMALE', 'UNKNOWN'])
    .withMessage('جنسیت معتبر انتخاب کنید'),
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
  body('weight')
    .optional()
    .isFloat({ min: 0.1, max: 1000 })
    .withMessage('وزن باید بین 0.1 تا 1000 کیلوگرم باشد'),
  body('color')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('رنگ نباید بیش از 50 کاراکتر باشد'),
  body('microchipId')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('شناسه میکروچیپ نباید بیش از 50 کاراکتر باشد'),
  body('medicalHistory')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('سابقه پزشکی نباید بیش از 2000 کاراکتر باشد'),
  body('allergies')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('آلرژی‌ها نباید بیش از 1000 کاراکتر باشد'),
  body('medications')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('داروها نباید بیش از 1000 کاراکتر باشد'),
  body('vaccinations')
    .optional()
    .isArray()
    .withMessage('واکسیناسیون‌ها باید آرایه باشد'),
  body('vaccinations.*')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('هر واکسیناسیون نباید بیش از 100 کاراکتر باشد'),
  body('specialNeeds')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('نیازهای خاص نباید بیش از 1000 کاراکتر باشد'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('یادداشت‌ها نباید بیش از 2000 کاراکتر باشد'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('وضعیت فعال بودن باید بولین باشد')
];

export const getPetValidator = [
  param('id')
    .isUUID()
    .withMessage('شناسه حیوان خانگی معتبر نیست')
];

export const deletePetValidator = [
  param('id')
    .isUUID()
    .withMessage('شناسه حیوان خانگی معتبر نیست')
];

export const getPetsValidator = [
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
  query('species')
    .optional()
    .isIn(['DOG', 'CAT', 'BIRD', 'RABBIT', 'HAMSTER', 'FISH', 'REPTILE', 'OTHER'])
    .withMessage('نوع حیوان خانگی معتبر انتخاب کنید'),
  query('gender')
    .optional()
    .isIn(['MALE', 'FEMALE', 'UNKNOWN'])
    .withMessage('جنسیت معتبر انتخاب کنید'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('وضعیت فعال بودن باید بولین باشد'),
  query('sortBy')
    .optional()
    .isIn(['name', 'species', 'dateOfBirth', 'createdAt', 'updatedAt'])
    .withMessage('فیلد مرتب‌سازی معتبر انتخاب کنید'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('ترتیب مرتب‌سازی معتبر انتخاب کنید')
];

export const getUserPetsValidator = [
  param('userId')
    .isUUID()
    .withMessage('شناسه کاربر معتبر نیست'),
  ...getPetsValidator
];

export const getPetsBySpeciesValidator = [
  param('species')
    .isIn(['DOG', 'CAT', 'BIRD', 'RABBIT', 'HAMSTER', 'FISH', 'REPTILE', 'OTHER'])
    .withMessage('نوع حیوان خانگی معتبر انتخاب کنید'),
  ...getPetsValidator.filter(validator => 
    !validator.toString().includes('species')
  )
];

export const updatePetStatusValidator = [
  param('id')
    .isUUID()
    .withMessage('شناسه حیوان خانگی معتبر نیست'),
  body('isActive')
    .isBoolean()
    .withMessage('وضعیت فعال بودن باید بولین باشد')
];

export const getPetStatsValidator = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('تاریخ شروع معتبر وارد کنید'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('تاریخ پایان معتبر وارد کنید'),
  query('species')
    .optional()
    .isIn(['DOG', 'CAT', 'BIRD', 'RABBIT', 'HAMSTER', 'FISH', 'REPTILE', 'OTHER'])
    .withMessage('نوع حیوان خانگی معتبر انتخاب کنید')
];