# راهنمای تنظیمات پس از آپلود فایل‌ها به تگراهاست

## مرحله 1: بررسی ساختار فایل‌ها

### ساختار مورد انتظار در پوشه اصلی دامنه:

```
public_html/
├── index.html                    # فایل اصلی frontend از pet-consultation/dist/
├── assets/                       # فولدر assets از pet-consultation/dist/
│   ├── *.css
│   ├── *.js
│   ├── *.jpg, *.png, *.mp4
│   └── ...
├── api/                          # فولدر backend
│   ├── dist/                     # کد کامپایل شده backend
│   │   ├── app.js
│   │   ├── server.js
│   │   └── ...
│   ├── package.json
│   ├── .env
│   ├── prisma/
│   │   └── schema.prisma
│   └── node_modules/             # بعد از npm install
└── .htaccess                     # فایل تنظیمات Apache
```

### دستورات بررسی:
```bash
# بررسی وجود فایل‌های اصلی
ls -la public_html/
ls -la public_html/assets/
ls -la public_html/api/dist/
```

## مرحله 2: تنظیمات سرور Node.js

### نصب وابستگی‌ها:
```bash
cd public_html/api/
npm install --production
npx prisma generate
```

### تست اتصال دیتابیس:
```bash
npx prisma db push
```

### اجرای سرور:
```bash
# روش 1: استفاده از PM2 (توصیه می‌شود)
npm install -g pm2
pm2 start dist/server.js --name "veteqiutte-api"
pm2 startup
pm2 save

# روش 2: اجرای مستقیم
node dist/server.js
```

## مرحله 3: تنظیم فایل .htaccess

### ایجاد فایل .htaccess در پوشه اصلی:
```apache
# فایل .htaccess در public_html/

# فعال‌سازی Rewrite Engine
RewriteEngine On

# مسیریابی API به Node.js server
RewriteRule ^api/(.*)$ http://localhost:3003/api/$1 [P,L]

# مسیریابی SPA - همه درخواست‌ها به index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule . /index.html [L]

# تنظیمات امنیتی
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"

# فشرده‌سازی فایل‌ها
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# کش کردن فایل‌های استاتیک
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType image/svg+xml "access plus 1 month"
</IfModule>
```

## مرحله 4: تنظیم دسترسی‌های فایل‌ها

### دستورات chmod:
```bash
# دسترسی فایل‌های عمومی
chmod 644 public_html/index.html
chmod -R 644 public_html/assets/

# دسترسی فایل‌های backend
chmod 755 public_html/api/
chmod -R 644 public_html/api/dist/
chmod 600 public_html/api/.env
chmod 644 public_html/api/package.json

# دسترسی فولدرها
find public_html/ -type d -exec chmod 755 {} \;
```

## مرحله 5: تنظیمات امنیتی اضافی

### محافظت از فایل .env:
```apache
# اضافه کردن به .htaccess
<Files ".env">
    Order allow,deny
    Deny from all
</Files>
```

### تنظیم فایروال (در صورت دسترسی):
```bash
# باز کردن پورت 3003 برای Node.js
sudo ufw allow 3003
```

## مرحله 6: تست نهایی

### 1. تست API:
```bash
# تست endpoint اصلی
curl -X GET https://yourdomain.com/api/health

# تست ثبت‌نام
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

### 2. تست Frontend:
- باز کردن https://yourdomain.com در مرورگر
- بررسی لود شدن صفحه اصلی
- تست فرم ثبت‌نام
- بررسی console برای خطاهای JavaScript

### 3. بررسی لاگ‌ها:
```bash
# لاگ‌های Apache
tail -f /var/log/apache2/error.log
tail -f /var/log/apache2/access.log

# لاگ‌های Node.js (با PM2)
pm2 logs veteqiutte-api
```

## عیب‌یابی مشکلات رایج

### مشکل 1: API در دسترس نیست
- بررسی کنید Node.js server در حال اجرا باشد
- پورت 3003 باز باشد
- فایل .htaccess صحیح باشد

### مشکل 2: خطای دیتابیس
- بررسی connection string در .env
- اطمینان از اجرای `prisma db push`
- بررسی دسترسی‌های دیتابیس

### مشکل 3: فایل‌های استاتیک لود نمی‌شوند
- بررسی مسیرهای assets در index.html
- بررسی دسترسی‌های فایل‌ها
- بررسی تنظیمات .htaccess

### مشکل 4: CORS Error
- اضافه کردن domain به تنظیمات CORS در backend
- بررسی headers در .htaccess

## نکات مهم:

1. **پشتیبان‌گیری**: قبل از هر تغییر، از فایل‌ها پشتیبان بگیرید
2. **مانیتورینگ**: از PM2 برای مانیتورینگ Node.js استفاده کنید
3. **SSL**: اطمینان حاصل کنید SSL فعال باشد
4. **Performance**: از CDN برای فایل‌های استاتیک استفاده کنید
5. **Security**: به‌روزرسانی منظم پکیج‌ها

## دستورات مفید:

```bash
# بررسی وضعیت سرور
pm2 status

# ری‌استارت سرور
pm2 restart veteqiutte-api

# بررسی استفاده از منابع
top
df -h

# بررسی پورت‌های باز
netstat -tlnp | grep :3003
```

با دنبال کردن این مراحل، پروژه شما باید به درستی در تگراهاست اجرا شود.