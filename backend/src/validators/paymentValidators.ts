import { body, param, query } from 'express-validator';

export const createPaymentValidator = [
  body('consultationId')
    .isUUID()
    .withMessage('شناسه مشاوره معتبر نیست'),
  body('amount')
    .isFloat({ min: 1000, max: 50000000 })
    .withMessage('مبلغ باید بین 1000 تا 50000000 ریال باشد'),
  body('gateway')
    .isIn(['ZARINPAL', 'MELLAT', 'PARSIAN'])
    .withMessage('درگاه پرداخت معتبر انتخاب کنید'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('توضیحات نباید بیش از 500 کاراکتر باشد')
];

export const initiatePaymentValidator = [
  body('paymentId')
    .isUUID()
    .withMessage('شناسه پرداخت معتبر نیست'),
  body('callbackUrl')
    .optional()
    .isURL()
    .withMessage('آدرس بازگشت معتبر نیست')
];

export const verifyPaymentValidator = [
  body('gateway')
    .isIn(['ZARINPAL', 'MELLAT', 'PARSIAN'])
    .withMessage('درگاه پرداخت معتبر انتخاب کنید'),
  body('authority')
    .notEmpty()
    .withMessage('کد مرجع الزامی است')
    .isLength({ min: 10, max: 100 })
    .withMessage('کد مرجع معتبر نیست'),
  body('transactionId')
    .optional()
    .isLength({ min: 10, max: 100 })
    .withMessage('شناسه تراکنش معتبر نیست')
];

export const refundPaymentValidator = [
  param('id')
    .isUUID()
    .withMessage('شناسه پرداخت معتبر نیست'),
  body('amount')
    .optional()
    .isFloat({ min: 1000 })
    .withMessage('مبلغ بازپرداخت باید حداقل 1000 ریال باشد'),
  body('reason')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('دلیل بازپرداخت باید بین 10 تا 500 کاراکتر باشد'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('توضیحات نباید بیش از 1000 کاراکتر باشد')
];

export const getPaymentValidator = [
  param('id')
    .isUUID()
    .withMessage('شناسه پرداخت معتبر نیست')
];

export const getPaymentsValidator = [
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
    .isIn(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED'])
    .withMessage('وضعیت معتبر انتخاب کنید'),
  query('gateway')
    .optional()
    .isIn(['ZARINPAL', 'MELLAT', 'PARSIAN'])
    .withMessage('درگاه پرداخت معتبر انتخاب کنید'),
  query('userId')
    .optional()
    .isUUID()
    .withMessage('شناسه کاربر معتبر نیست'),
  query('consultationId')
    .optional()
    .isUUID()
    .withMessage('شناسه مشاوره معتبر نیست'),
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('تاریخ شروع معتبر وارد کنید'),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('تاریخ پایان معتبر وارد کنید'),
  query('amountFrom')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('مبلغ شروع باید عدد مثبت باشد'),
  query('amountTo')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('مبلغ پایان باید عدد مثبت باشد'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'amount', 'status', 'gateway'])
    .withMessage('فیلد مرتب‌سازی معتبر انتخاب کنید'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('ترتیب مرتب‌سازی معتبر انتخاب کنید')
];

export const getUserPaymentsValidator = [
  param('userId')
    .isUUID()
    .withMessage('شناسه کاربر معتبر نیست'),
  ...getPaymentsValidator.filter(validator => 
    !validator.toString().includes('userId')
  )
];

export const getPaymentsByStatusValidator = [
  param('status')
    .isIn(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED'])
    .withMessage('وضعیت معتبر انتخاب کنید'),
  ...getPaymentsValidator.filter(validator => 
    !validator.toString().includes('status')
  )
];

export const getPaymentsByGatewayValidator = [
  param('gateway')
    .isIn(['ZARINPAL', 'MELLAT', 'PARSIAN'])
    .withMessage('درگاه پرداخت معتبر انتخاب کنید'),
  ...getPaymentsValidator.filter(validator => 
    !validator.toString().includes('gateway')
  )
];

export const getConsultationPaymentsValidator = [
  param('consultationId')
    .isUUID()
    .withMessage('شناسه مشاوره معتبر نیست'),
  ...getPaymentsValidator.filter(validator => 
    !validator.toString().includes('consultationId')
  )
];

export const updatePaymentStatusValidator = [
  param('id')
    .isUUID()
    .withMessage('شناسه پرداخت معتبر نیست'),
  body('status')
    .isIn(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED'])
    .withMessage('وضعیت معتبر انتخاب کنید'),
  body('transactionId')
    .optional()
    .isLength({ min: 10, max: 100 })
    .withMessage('شناسه تراکنش معتبر نیست'),
  body('gatewayResponse')
    .optional()
    .isObject()
    .withMessage('پاسخ درگاه باید آبجکت باشد'),
  body('failureReason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('دلیل شکست نباید بیش از 500 کاراکتر باشد'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('یادداشت‌ها نباید بیش از 1000 کاراکتر باشد')
];

// Webhook validators
export const zarinpalCallbackValidator = [
  query('Authority')
    .notEmpty()
    .withMessage('کد مرجع الزامی است'),
  query('Status')
    .notEmpty()
    .withMessage('وضعیت الزامی است')
];

export const mellatCallbackValidator = [
  body('RefId')
    .optional()
    .notEmpty()
    .withMessage('شناسه مرجع الزامی است'),
  body('ResCode')
    .notEmpty()
    .withMessage('کد نتیجه الزامی است')
];

export const parsianCallbackValidator = [
  body('Token')
    .optional()
    .notEmpty()
    .withMessage('توکن الزامی است'),
  body('status')
    .notEmpty()
    .withMessage('وضعیت الزامی است')
];

// Payment statistics validators
export const getPaymentStatsValidator = [
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('تاریخ شروع معتبر وارد کنید'),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('تاریخ پایان معتبر وارد کنید'),
  query('gateway')
    .optional()
    .isIn(['ZARINPAL', 'MELLAT', 'PARSIAN'])
    .withMessage('درگاه پرداخت معتبر انتخاب کنید'),
  query('groupBy')
    .optional()
    .isIn(['day', 'week', 'month', 'year'])
    .withMessage('گروه‌بندی معتبر انتخاب کنید')
];

export const getUserPaymentStatsValidator = [
  param('userId')
    .optional()
    .isUUID()
    .withMessage('شناسه کاربر معتبر نیست'),
  ...getPaymentStatsValidator
];

// Payment report validators
export const getPaymentReportValidator = [
  query('reportType')
    .isIn(['summary', 'detailed', 'gateway_comparison', 'user_analysis'])
    .withMessage('نوع گزارش معتبر انتخاب کنید'),
  query('dateFrom')
    .isISO8601()
    .withMessage('تاریخ شروع معتبر وارد کنید'),
  query('dateTo')
    .isISO8601()
    .withMessage('تاریخ پایان معتبر وارد کنید'),
  query('format')
    .optional()
    .isIn(['json', 'csv', 'excel'])
    .withMessage('فرمت گزارش معتبر انتخاب کنید'),
  query('gateway')
    .optional()
    .isIn(['ZARINPAL', 'MELLAT', 'PARSIAN'])
    .withMessage('درگاه پرداخت معتبر انتخاب کنید'),
  query('status')
    .optional()
    .isIn(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED'])
    .withMessage('وضعیت معتبر انتخاب کنید')
];

export const zarinpalWebhookValidator = [
  body('Authority')
    .notEmpty()
    .withMessage('کد مرجع الزامی است'),
  body('Status')
    .notEmpty()
    .withMessage('وضعیت الزامی است')
];

export const mellatWebhookValidator = [
  body('RefId')
    .notEmpty()
    .withMessage('شناسه مرجع الزامی است'),
  body('ResCode')
    .notEmpty()
    .withMessage('کد نتیجه الزامی است'),
  body('SaleOrderId')
    .optional()
    .notEmpty()
    .withMessage('شناسه سفارش معتبر نیست'),
  body('SaleReferenceId')
    .optional()
    .notEmpty()
    .withMessage('شناسه مرجع فروش معتبر نیست')
];