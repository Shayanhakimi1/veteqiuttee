import { body, param, query } from 'express-validator';

export const createConsultationValidator = [
  body('petId')
    .isUUID()
    .withMessage('شناسه حیوان خانگی معتبر نیست'),
  body('type')
    .isIn(['EMERGENCY', 'ROUTINE', 'FOLLOW_UP', 'VACCINATION', 'CHECKUP'])
    .withMessage('نوع مشاوره معتبر انتخاب کنید'),
  body('urgencyLevel')
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .withMessage('سطح اورژانسی معتبر انتخاب کنید'),
  body('symptoms')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('علائم باید بین 10 تا 2000 کاراکتر باشد'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('توضیحات نباید بیش از 5000 کاراکتر باشد'),
  body('duration')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('مدت زمان نباید بیش از 200 کاراکتر باشد'),
  body('previousTreatments')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('درمان‌های قبلی نباید بیش از 1000 کاراکتر باشد'),
  body('currentMedications')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('داروهای فعلی نباید بیش از 1000 کاراکتر باشد'),
  body('behaviorChanges')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('تغییرات رفتاری نباید بیش از 1000 کاراکتر باشد'),
  body('appetiteChanges')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('تغییرات اشتها نباید بیش از 500 کاراکتر باشد'),
  body('activityLevel')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('سطح فعالیت نباید بیش از 500 کاراکتر باشد'),
  body('environmentChanges')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('تغییرات محیطی نباید بیش از 1000 کاراکتر باشد'),
  body('photos')
    .optional()
    .isArray()
    .withMessage('عکس‌ها باید آرایه باشد'),
  body('photos.*')
    .optional()
    .isURL()
    .withMessage('آدرس عکس معتبر نیست'),
  body('preferredContactMethod')
    .optional()
    .isIn(['PHONE', 'SMS', 'EMAIL', 'IN_APP'])
    .withMessage('روش تماس ترجیحی معتبر انتخاب کنید'),
  body('scheduledDate')
    .optional()
    .isISO8601()
    .withMessage('تاریخ زمان‌بندی معتبر وارد کنید')
    .custom((value) => {
      if (value && new Date(value) < new Date()) {
        throw new Error('تاریخ زمان‌بندی نمی‌تواند در گذشته باشد');
      }
      return true;
    })
];

export const updateConsultationValidator = [
  param('id')
    .isUUID()
    .withMessage('شناسه مشاوره معتبر نیست'),
  body('type')
    .optional()
    .isIn(['EMERGENCY', 'ROUTINE', 'FOLLOW_UP', 'VACCINATION', 'CHECKUP'])
    .withMessage('نوع مشاوره معتبر انتخاب کنید'),
  body('urgencyLevel')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .withMessage('سطح اورژانسی معتبر انتخاب کنید'),
  body('symptoms')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('علائم باید بین 10 تا 2000 کاراکتر باشد'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('توضیحات نباید بیش از 5000 کاراکتر باشد'),
  body('duration')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('مدت زمان نباید بیش از 200 کاراکتر باشد'),
  body('previousTreatments')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('درمان‌های قبلی نباید بیش از 1000 کاراکتر باشد'),
  body('currentMedications')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('داروهای فعلی نباید بیش از 1000 کاراکتر باشد'),
  body('behaviorChanges')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('تغییرات رفتاری نباید بیش از 1000 کاراکتر باشد'),
  body('appetiteChanges')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('تغییرات اشتها نباید بیش از 500 کاراکتر باشد'),
  body('activityLevel')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('سطح فعالیت نباید بیش از 500 کاراکتر باشد'),
  body('environmentChanges')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('تغییرات محیطی نباید بیش از 1000 کاراکتر باشد'),
  body('photos')
    .optional()
    .isArray()
    .withMessage('عکس‌ها باید آرایه باشد'),
  body('photos.*')
    .optional()
    .isURL()
    .withMessage('آدرس عکس معتبر نیست'),
  body('preferredContactMethod')
    .optional()
    .isIn(['PHONE', 'SMS', 'EMAIL', 'IN_APP'])
    .withMessage('روش تماس ترجیحی معتبر انتخاب کنید'),
  body('scheduledDate')
    .optional()
    .isISO8601()
    .withMessage('تاریخ زمان‌بندی معتبر وارد کنید'),
  body('status')
    .optional()
    .isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FOLLOW_UP_NEEDED'])
    .withMessage('وضعیت معتبر انتخاب کنید'),
  body('veterinarianResponse')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('پاسخ دامپزشک نباید بیش از 5000 کاراکتر باشد'),
  body('diagnosis')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('تشخیص نباید بیش از 2000 کاراکتر باشد'),
  body('treatment')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('درمان نباید بیش از 2000 کاراکتر باشد'),
  body('followUpInstructions')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('دستورالعمل‌های پیگیری نباید بیش از 2000 کاراکتر باشد'),
  body('prescriptions')
    .optional()
    .isArray()
    .withMessage('نسخه‌ها باید آرایه باشد'),
  body('prescriptions.*')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('هر نسخه نباید بیش از 500 کاراکتر باشد'),
  body('nextAppointmentDate')
    .optional()
    .isISO8601()
    .withMessage('تاریخ قرار ملاقات بعدی معتبر وارد کنید'),
  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('هزینه باید عدد مثبت باشد'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('یادداشت‌ها نباید بیش از 2000 کاراکتر باشد')
];

export const getConsultationValidator = [
  param('id')
    .isUUID()
    .withMessage('شناسه مشاوره معتبر نیست')
];

export const deleteConsultationValidator = [
  param('id')
    .isUUID()
    .withMessage('شناسه مشاوره معتبر نیست')
];

export const getConsultationsValidator = [
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
  query('status')
    .optional()
    .isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FOLLOW_UP_NEEDED'])
    .withMessage('وضعیت معتبر انتخاب کنید'),
  query('type')
    .optional()
    .isIn(['EMERGENCY', 'ROUTINE', 'FOLLOW_UP', 'VACCINATION', 'CHECKUP'])
    .withMessage('نوع مشاوره معتبر انتخاب کنید'),
  query('urgencyLevel')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .withMessage('سطح اورژانسی معتبر انتخاب کنید'),
  query('petId')
    .optional()
    .isUUID()
    .withMessage('شناسه حیوان خانگی معتبر نیست'),
  query('userId')
    .optional()
    .isUUID()
    .withMessage('شناسه کاربر معتبر نیست'),
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
    .isIn(['createdAt', 'updatedAt', 'scheduledDate', 'urgencyLevel', 'status'])
    .withMessage('فیلد مرتب‌سازی معتبر انتخاب کنید'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('ترتیب مرتب‌سازی معتبر انتخاب کنید')
];

export const getUserConsultationsValidator = [
  param('userId')
    .isUUID()
    .withMessage('شناسه کاربر معتبر نیست'),
  ...getConsultationsValidator.filter(validator => 
    !validator.toString().includes('userId')
  )
];

export const getPetConsultationsValidator = [
  param('petId')
    .isUUID()
    .withMessage('شناسه حیوان خانگی معتبر نیست'),
  ...getConsultationsValidator.filter(validator => 
    !validator.toString().includes('petId')
  )
];

export const getConsultationsByStatusValidator = [
  param('status')
    .isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FOLLOW_UP_NEEDED'])
    .withMessage('وضعیت معتبر انتخاب کنید'),
  ...getConsultationsValidator.filter(validator => 
    !validator.toString().includes('status')
  )
];

export const getConsultationsByTypeValidator = [
  param('type')
    .isIn(['EMERGENCY', 'ROUTINE', 'FOLLOW_UP', 'VACCINATION', 'CHECKUP'])
    .withMessage('نوع مشاوره معتبر انتخاب کنید'),
  ...getConsultationsValidator.filter(validator => 
    !validator.toString().includes('type')
  )
];

export const updateConsultationStatusValidator = [
  param('id')
    .isUUID()
    .withMessage('شناسه مشاوره معتبر نیست'),
  body('status')
    .isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FOLLOW_UP_NEEDED'])
    .withMessage('وضعیت معتبر انتخاب کنید'),
  body('veterinarianResponse')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('پاسخ دامپزشک نباید بیش از 5000 کاراکتر باشد'),
  body('diagnosis')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('تشخیص نباید بیش از 2000 کاراکتر باشد'),
  body('treatment')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('درمان نباید بیش از 2000 کاراکتر باشد'),
  body('followUpInstructions')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('دستورالعمل‌های پیگیری نباید بیش از 2000 کاراکتر باشد'),
  body('prescriptions')
    .optional()
    .isArray()
    .withMessage('نسخه‌ها باید آرایه باشد'),
  body('prescriptions.*')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('هر نسخه نباید بیش از 500 کاراکتر باشد'),
  body('nextAppointmentDate')
    .optional()
    .isISO8601()
    .withMessage('تاریخ قرار ملاقات بعدی معتبر وارد کنید'),
  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('هزینه باید عدد مثبت باشد'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('یادداشت‌ها نباید بیش از 2000 کاراکتر باشد')
];

export const uploadVoiceMediaValidator = [
  param('id')
    .isUUID()
    .withMessage('شناسه مشاوره معتبر نیست')
];

export const getConsultationStatsValidator = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('تاریخ شروع معتبر وارد کنید'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('تاریخ پایان معتبر وارد کنید'),
  query('type')
    .optional()
    .isIn(['EMERGENCY', 'ROUTINE', 'FOLLOW_UP', 'VACCINATION', 'CHECKUP'])
    .withMessage('نوع مشاوره معتبر انتخاب کنید'),
  query('status')
    .optional()
    .isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
    .withMessage('وضعیت معتبر انتخاب کنید')
];