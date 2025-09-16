# راهنمای استقرار پروژه در تگراهاست

## مراحل انجام شده:

### 1. تنظیمات دیتابیس
- ✅ Schema.prisma به MS SQL Server تبدیل شد
- ✅ فایل .env با اطلاعات دیتابیس تگراهاست به‌روزرسانی شد
- ✅ پکیج‌های production نصب شدند

### 2. بیلد پروژه
- ✅ Backend بیلد شد (فولدر dist)
- 🔄 Frontend در حال بیلد (فولدر dist)

## مراحل باقی‌مانده:

### 3. تست اتصال دیتابیس
```bash
npx prisma db push
```

### 4. آپلود فایل‌ها به تگراهاست

#### Backend:
- فولدر `backend/dist/` (کد کامپایل شده)
- فایل `backend/package.json`
- فولدر `backend/prisma/`
- فایل `backend/.env` (با اطلاعات صحیح دیتابیس)
- فولدر `backend/node_modules/` (یا اجرای npm install در سرور)

#### Frontend:
- فولدر `pet-consultation/dist/` (فایل‌های استاتیک)

### 5. تنظیمات سرور تگراهاست

#### برای Backend (Node.js):
```bash
# در پوشه backend
npm install --production
npx prisma generate
npx prisma db push
npm start
```

#### برای Frontend:
- فایل‌های dist را در پوشه public_html قرار دهید
- یا از static file hosting استفاده کنید

### 6. متغیرهای محیطی مهم:
```
DATABASE_URL="sqlserver://./MSSQLSERVER2019:1433;database=drfattah_veteqiutte2_prod;user=drfattah_shayan;password=******;trustServerCertificate=true;encrypt=false;integratedSecurity=false"
JWT_SECRET="your-super-secret-jwt-key-for-production-change-this"
NODE_ENV="production"
PORT=3003
```

### 7. نکات مهم:
- پسورد دیتابیس را با پسورد واقعی جایگزین کنید
- JWT_SECRET را تغییر دهید
- پورت 3003 برای backend استفاده می‌شود
- اطمینان حاصل کنید که دیتابیس MS SQL در تگراهاست فعال است

### 8. تست نهایی:
- تست API endpoints
- تست اتصال دیتابیس
- تست عملکرد frontend

## ساختار فایل‌های نهایی:
```
backend/
├── dist/           # کد کامپایل شده
├── prisma/         # فایل‌های دیتابیس
├── package.json    # وابستگی‌ها
├── .env           # متغیرهای محیطی
└── node_modules/   # پکیج‌ها

pet-consultation/
└── dist/          # فایل‌های استاتیک frontend
```

## وضعیت فعلی:
- ✅ Backend آماده استقرار
- 🔄 Frontend در حال آماده‌سازی
- ⏳ نیاز به تست اتصال دیتابیس