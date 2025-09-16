# چک‌لیست استقرار پروژه در تگراهاست
## Deployment Checklist for Tegrahost

### ✅ مرحله 1: آپلود فایل‌ها
- [ ] آپلود فولدر `pet-consultation/dist/` به `public_html/`
- [ ] آپلود فولدر `backend/` به `public_html/api/`
- [ ] بررسی کامل بودن فایل‌ها

### ✅ مرحله 2: تنظیم ساختار فایل‌ها
```
public_html/
├── index.html              ✓
├── assets/                 ✓
├── api/
│   ├── dist/              ✓
│   ├── package.json       ✓
│   ├── .env               ✓
│   └── prisma/            ✓
└── .htaccess              ✓
```

### ✅ مرحله 3: ایجاد فایل .htaccess
**مسیر:** `public_html/.htaccess`

```apache
RewriteEngine On

# API routing
RewriteRule ^api/(.*)$ http://localhost:3003/api/$1 [P,L]

# SPA routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule . /index.html [L]

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"

# Protect .env file
<Files ".env">
    Order allow,deny
    Deny from all
</Files>
```

### ✅ مرحله 4: تنظیم دسترسی‌های فایل‌ها
```bash
# دسترسی فایل‌های عمومی
chmod 644 public_html/index.html
chmod -R 644 public_html/assets/

# دسترسی فایل‌های backend
chmod 755 public_html/api/
chmod -R 644 public_html/api/dist/
chmod 600 public_html/api/.env

# دسترسی فولدرها
find public_html/ -type d -exec chmod 755 {} \;
```

### ✅ مرحله 5: نصب وابستگی‌های Node.js
```bash
cd public_html/api/
npm install --production
npx prisma generate
npx prisma db push
```

### ✅ مرحله 6: شروع سرور Node.js
```bash
# نصب PM2
npm install -g pm2

# شروع سرور
pm2 start dist/server.js --name "veteqiutte-api"
pm2 startup
pm2 save
```

### ✅ مرحله 7: تست عملکرد

#### تست API:
```bash
# تست health endpoint
curl -X GET https://yourdomain.com/api/health

# تست register endpoint
curl -X POST https://yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "09123456789",
    "petName": "Fluffy",
    "petType": "cat",
    "petAge": 2
  }'
```

#### تست Frontend:
- [ ] باز کردن https://yourdomain.com
- [ ] بررسی لود شدن صفحه اصلی
- [ ] تست فرم ثبت‌نام
- [ ] بررسی console برای خطاها

### ✅ مرحله 8: بررسی نهایی

#### چک‌لیست تست:
- [ ] صفحه اصلی لود می‌شود
- [ ] فایل‌های CSS و JS لود می‌شوند
- [ ] API endpoints پاسخ می‌دهند
- [ ] دیتابیس متصل است
- [ ] فرم‌ها کار می‌کنند
- [ ] SSL فعال است
- [ ] سرور Node.js در حال اجرا است

#### دستورات مفید:
```bash
# بررسی وضعیت سرور
pm2 status

# مشاهده لاگ‌ها
pm2 logs veteqiutte-api

# ری‌استارت سرور
pm2 restart veteqiutte-api

# بررسی پورت‌های باز
netstat -tlnp | grep :3003
```

### 🚨 عیب‌یابی مشکلات رایج

#### مشکل: API در دسترس نیست
- [ ] بررسی اجرای Node.js server
- [ ] بررسی باز بودن پورت 3003
- [ ] بررسی فایل .htaccess

#### مشکل: خطای دیتابیس
- [ ] بررسی connection string در .env
- [ ] اجرای `prisma db push`
- [ ] بررسی دسترسی‌های دیتابیس

#### مشکل: فایل‌های استاتیک لود نمی‌شوند
- [ ] بررسی مسیرهای assets
- [ ] بررسی دسترسی‌های فایل‌ها
- [ ] بررسی .htaccess

#### مشکل: CORS Error
- [ ] اضافه کردن domain به CORS settings
- [ ] بررسی headers در .htaccess

### 📋 اطلاعات مهم

**متغیرهای محیطی (.env):**
```
DATABASE_URL="sqlserver://./MSSQLSERVER2019:1433;database=drfattah_veteqiutte2_prod;user=drfattah_shayan;password=******;trustServerCertificate=true;encrypt=false;integratedSecurity=false"
JWT_SECRET="your-super-secret-jwt-key-for-production-change-this"
NODE_ENV="production"
PORT=3003
```

**پورت‌های مورد استفاده:**
- Frontend: 80/443 (HTTP/HTTPS)
- Backend API: 3003
- Database: 1433 (MS SQL)

**فایل‌های مهم:**
- `public_html/index.html` - صفحه اصلی
- `public_html/.htaccess` - تنظیمات Apache
- `public_html/api/.env` - متغیرهای محیطی
- `public_html/api/dist/server.js` - سرور اصلی

### ✅ تکمیل استقرار

بعد از تکمیل همه مراحل:
- [ ] پروژه به درستی اجرا می‌شود
- [ ] همه تست‌ها موفق هستند
- [ ] مانیتورینگ فعال است
- [ ] پشتیبان‌گیری تنظیم شده

**🎉 تبریک! پروژه شما با موفقیت در تگراهاست مستقر شد.**

---

**نکته:** برای استفاده از اسکریپت خودکار تست، فایل `test_deployment.sh` را اجرا کنید:
```bash
bash test_deployment.sh
```