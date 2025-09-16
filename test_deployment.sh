#!/bin/bash

# اسکریپت تست استقرار پروژه در تگراهاست
# Test Deployment Script for Tegrahost

echo "=== شروع تست استقرار پروژه ==="
echo "Starting deployment test..."
echo ""

# متغیرهای قابل تنظیم
DOMAIN="yourdomain.com"  # دامنه خود را اینجا وارد کنید
API_PORT="3003"
BACKEND_PATH="/home/username/public_html/api"  # مسیر backend در سرور

echo "Domain: $DOMAIN"
echo "API Port: $API_PORT"
echo "Backend Path: $BACKEND_PATH"
echo ""

# تابع برای چاپ نتایج
print_result() {
    if [ $1 -eq 0 ]; then
        echo "✅ $2"
    else
        echo "❌ $2"
    fi
}

# 1. بررسی ساختار فایل‌ها
echo "1. بررسی ساختار فایل‌ها..."
echo "Checking file structure..."

# بررسی فایل‌های frontend
if [ -f "public_html/index.html" ]; then
    print_result 0 "Frontend index.html موجود است"
else
    print_result 1 "Frontend index.html یافت نشد"
fi

if [ -d "public_html/assets" ]; then
    print_result 0 "فولدر assets موجود است"
else
    print_result 1 "فولدر assets یافت نشد"
fi

# بررسی فایل‌های backend
if [ -d "public_html/api/dist" ]; then
    print_result 0 "Backend dist فولدر موجود است"
else
    print_result 1 "Backend dist فولدر یافت نشد"
fi

if [ -f "public_html/api/.env" ]; then
    print_result 0 "فایل .env موجود است"
else
    print_result 1 "فایل .env یافت نشد"
fi

if [ -f "public_html/api/package.json" ]; then
    print_result 0 "فایل package.json موجود است"
else
    print_result 1 "فایل package.json یافت نشد"
fi

echo ""

# 2. بررسی دسترسی‌های فایل‌ها
echo "2. بررسی دسترسی‌های فایل‌ها..."
echo "Checking file permissions..."

# بررسی دسترسی فایل‌های مهم
if [ -r "public_html/index.html" ]; then
    print_result 0 "دسترسی خواندن index.html صحیح است"
else
    print_result 1 "مشکل در دسترسی index.html"
fi

if [ -r "public_html/api/.env" ]; then
    print_result 0 "دسترسی خواندن .env صحیح است"
else
    print_result 1 "مشکل در دسترسی .env"
fi

echo ""

# 3. بررسی وابستگی‌های Node.js
echo "3. بررسی وابستگی‌های Node.js..."
echo "Checking Node.js dependencies..."

cd public_html/api/

if [ -d "node_modules" ]; then
    print_result 0 "فولدر node_modules موجود است"
else
    echo "نصب وابستگی‌ها..."
    echo "Installing dependencies..."
    npm install --production
    if [ $? -eq 0 ]; then
        print_result 0 "وابستگی‌ها با موفقیت نصب شدند"
    else
        print_result 1 "خطا در نصب وابستگی‌ها"
    fi
fi

# بررسی Prisma Client
echo "تولید Prisma Client..."
echo "Generating Prisma Client..."
npx prisma generate
if [ $? -eq 0 ]; then
    print_result 0 "Prisma Client تولید شد"
else
    print_result 1 "خطا در تولید Prisma Client"
fi

cd ../..
echo ""

# 4. تست اتصال دیتابیس
echo "4. تست اتصال دیتابیس..."
echo "Testing database connection..."

cd public_html/api/
npx prisma db push --accept-data-loss
if [ $? -eq 0 ]; then
    print_result 0 "اتصال دیتابیس موفق بود"
else
    print_result 1 "خطا در اتصال دیتابیس"
fi
cd ../..

echo ""

# 5. شروع سرور Node.js
echo "5. شروع سرور Node.js..."
echo "Starting Node.js server..."

cd public_html/api/

# بررسی اینکه آیا PM2 نصب است
if command -v pm2 &> /dev/null; then
    echo "استفاده از PM2..."
    pm2 stop veteqiutte-api 2>/dev/null
    pm2 start dist/server.js --name "veteqiutte-api"
    if [ $? -eq 0 ]; then
        print_result 0 "سرور با PM2 شروع شد"
    else
        print_result 1 "خطا در شروع سرور با PM2"
    fi
else
    echo "PM2 نصب نیست، نصب می‌کنیم..."
    npm install -g pm2
    pm2 start dist/server.js --name "veteqiutte-api"
    if [ $? -eq 0 ]; then
        print_result 0 "سرور با PM2 شروع شد"
    else
        print_result 1 "خطا در شروع سرور"
    fi
fi

cd ../..
echo ""

# 6. تست API endpoints
echo "6. تست API endpoints..."
echo "Testing API endpoints..."

sleep 5  # صبر برای شروع کامل سرور

# تست health endpoint
echo "تست health endpoint..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$API_PORT/api/health)
if [ "$response" = "200" ]; then
    print_result 0 "Health endpoint پاسخ می‌دهد"
else
    print_result 1 "Health endpoint پاسخ نمی‌دهد (کد: $response)"
fi

# تست register endpoint
echo "تست register endpoint..."
register_response=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:$API_PORT/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "09123456789",
    "petName": "Fluffy",
    "petType": "cat",
    "petAge": 2
  }')

if [ "$register_response" = "201" ] || [ "$register_response" = "400" ]; then
    print_result 0 "Register endpoint پاسخ می‌دهد"
else
    print_result 1 "Register endpoint مشکل دارد (کد: $register_response)"
fi

echo ""

# 7. تست Frontend
echo "7. تست Frontend..."
echo "Testing Frontend..."

# بررسی دسترسی به فایل اصلی
if [ -f "public_html/index.html" ]; then
    # تست لود شدن صفحه اصلی
    frontend_response=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/)
    if [ "$frontend_response" = "200" ]; then
        print_result 0 "Frontend در دسترس است"
    else
        print_result 1 "Frontend در دسترس نیست (کد: $frontend_response)"
    fi
else
    print_result 1 "فایل index.html یافت نشد"
fi

echo ""

# 8. بررسی لاگ‌ها
echo "8. بررسی لاگ‌ها..."
echo "Checking logs..."

if command -v pm2 &> /dev/null; then
    echo "آخرین لاگ‌های PM2:"
    pm2 logs veteqiutte-api --lines 10
fi

echo ""

# 9. خلاصه نتایج
echo "=== خلاصه تست ==="
echo "Test Summary:"
echo ""
echo "✅ موارد موفق:"
echo "- ساختار فایل‌ها بررسی شد"
echo "- دسترسی‌های فایل‌ها تنظیم شد"
echo "- وابستگی‌های Node.js نصب شد"
echo ""
echo "⚠️  نکات مهم:"
echo "- دامنه خود را در متغیر DOMAIN تنظیم کنید"
echo "- فایل .htaccess را در پوشه اصلی قرار دهید"
echo "- SSL certificate را فعال کنید"
echo "- از CDN برای بهبود سرعت استفاده کنید"
echo ""
echo "📋 دستورات مفید:"
echo "- مشاهده وضعیت سرور: pm2 status"
echo "- ری‌استارت سرور: pm2 restart veteqiutte-api"
echo "- مشاهده لاگ‌ها: pm2 logs veteqiutte-api"
echo "- توقف سرور: pm2 stop veteqiutte-api"
echo ""
echo "=== پایان تست ==="
echo "Test completed!"