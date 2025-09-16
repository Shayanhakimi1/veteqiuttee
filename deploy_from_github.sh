#!/bin/bash

# اسکریپت دیپلوی خودکار از گیت‌هاب به تگراهاست
# نویسنده: Assistant
# تاریخ: $(date)

# تنظیمات قابل تغییر
GITHUB_REPO="https://github.com/username/veteqiutte.git"
DOMAIN="yourdomain.com"
USERNAME="your_username"
PROJECT_PATH="/home/$USERNAME/domains/$DOMAIN/public_html"
API_PATH="$PROJECT_PATH/api"
BACKUP_PATH="/home/$USERNAME/backups"

# رنگ‌ها برای نمایش بهتر
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# تابع نمایش پیام
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# تابع بررسی وجود دستور
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 نصب نشده است"
        exit 1
    fi
}

# تابع پشتیبان‌گیری
create_backup() {
    print_status "ایجاد پشتیبان..."
    
    BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p $BACKUP_PATH
    
    if [ -d "$PROJECT_PATH" ]; then
        tar -czf "$BACKUP_PATH/$BACKUP_NAME.tar.gz" -C "$PROJECT_PATH" .
        print_success "پشتیبان در $BACKUP_PATH/$BACKUP_NAME.tar.gz ایجاد شد"
    else
        print_warning "مسیر پروژه وجود ندارد، پشتیبان‌گیری انجام نشد"
    fi
}

# تابع کلون یا آپدیت کردن
clone_or_update() {
    print_status "دریافت کد از گیت‌هاب..."
    
    if [ -d "$PROJECT_PATH/.git" ]; then
        print_status "آپدیت کردن پروژه موجود..."
        cd $PROJECT_PATH
        git fetch origin
        git reset --hard origin/main
        git clean -fd
    else
        print_status "کلون کردن پروژه جدید..."
        rm -rf $PROJECT_PATH
        mkdir -p $PROJECT_PATH
        git clone $GITHUB_REPO $PROJECT_PATH
        cd $PROJECT_PATH
    fi
    
    print_success "کد با موفقیت دریافت شد"
}

# تابع نصب وابستگی‌های backend
install_backend_deps() {
    print_status "نصب وابستگی‌های backend..."
    
    cd $PROJECT_PATH/backend
    
    if [ -f "package.json" ]; then
        npm install --production
        print_success "وابستگی‌های backend نصب شدند"
    else
        print_error "فایل package.json در backend یافت نشد"
        exit 1
    fi
}

# تابع بیلد backend
build_backend() {
    print_status "بیلد کردن backend..."
    
    cd $PROJECT_PATH/backend
    
    if npm run build; then
        print_success "Backend با موفقیت بیلد شد"
    else
        print_error "خطا در بیلد backend"
        exit 1
    fi
}

# تابع تنظیم Prisma
setup_prisma() {
    print_status "تنظیم Prisma..."
    
    cd $PROJECT_PATH/backend
    
    if npx prisma generate; then
        print_success "Prisma Client تولید شد"
    else
        print_error "خطا در تولید Prisma Client"
        exit 1
    fi
    
    # اجرای migration (اختیاری)
    read -p "آیا می‌خواهید migration اجرا شود؟ (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if npx prisma db push; then
            print_success "Migration با موفقیت اجرا شد"
        else
            print_warning "خطا در اجرای migration"
        fi
    fi
}

# تابع نصب وابستگی‌های frontend
install_frontend_deps() {
    print_status "نصب وابستگی‌های frontend..."
    
    cd $PROJECT_PATH/pet-consultation
    
    if [ -f "package.json" ]; then
        npm install
        print_success "وابستگی‌های frontend نصب شدند"
    else
        print_error "فایل package.json در frontend یافت نشد"
        exit 1
    fi
}

# تابع بیلد frontend
build_frontend() {
    print_status "بیلد کردن frontend..."
    
    cd $PROJECT_PATH/pet-consultation
    
    if npm run build; then
        print_success "Frontend با موفقیت بیلد شد"
    else
        print_error "خطا در بیلد frontend"
        exit 1
    fi
}

# تابع کپی کردن فایل‌ها
copy_files() {
    print_status "کپی کردن فایل‌ها..."
    
    # کپی فایل‌های frontend به root
    if [ -d "$PROJECT_PATH/pet-consultation/dist" ]; then
        cp -r $PROJECT_PATH/pet-consultation/dist/* $PROJECT_PATH/
        print_success "فایل‌های frontend کپی شدند"
    fi
    
    # ایجاد مسیر API
    mkdir -p $API_PATH
    
    # کپی فایل‌های backend
    if [ -d "$PROJECT_PATH/backend/dist" ]; then
        cp -r $PROJECT_PATH/backend/dist/* $API_PATH/
        cp $PROJECT_PATH/backend/package.json $API_PATH/
        cp -r $PROJECT_PATH/backend/prisma $API_PATH/
        
        # کپی .env اگر وجود داشته باشد
        if [ -f "$PROJECT_PATH/backend/.env" ]; then
            cp $PROJECT_PATH/backend/.env $API_PATH/
        fi
        
        print_success "فایل‌های backend کپی شدند"
    fi
}

# تابع تنظیم دسترسی‌ها
set_permissions() {
    print_status "تنظیم دسترسی‌ها..."
    
    # تنظیم دسترسی فایل‌ها
    find $PROJECT_PATH -type f -exec chmod 644 {} \;
    find $PROJECT_PATH -type d -exec chmod 755 {} \;
    
    # دسترسی خاص برای .env
    if [ -f "$API_PATH/.env" ]; then
        chmod 600 $API_PATH/.env
    fi
    
    print_success "دسترسی‌ها تنظیم شدند"
}

# تابع ایجاد .htaccess
create_htaccess() {
    print_status "ایجاد فایل .htaccess..."
    
    cat > $PROJECT_PATH/.htaccess << 'EOF'
# تنظیمات امنیتی
ServerTokens Prod
ServerSignature Off

# محافظت از فایل‌های حساس
<Files ".env">
    Order allow,deny
    Deny from all
</Files>

<Files "*.log">
    Order allow,deny
    Deny from all
</Files>

# فشرده‌سازی
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

# Cache headers
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>

# مسیریابی API
RewriteEngine On

# API routes
RewriteRule ^api/(.*)$ http://localhost:3001/$1 [P,L]

# SPA routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
EOF

    print_success "فایل .htaccess ایجاد شد"
}

# تابع راه‌اندازی PM2
setup_pm2() {
    print_status "راه‌اندازی PM2..."
    
    cd $API_PATH
    
    # بررسی وجود PM2
    if ! command -v pm2 &> /dev/null; then
        print_status "نصب PM2..."
        npm install -g pm2
    fi
    
    # توقف process قبلی
    pm2 stop veteqiutte-api 2>/dev/null || true
    pm2 delete veteqiutte-api 2>/dev/null || true
    
    # شروع process جدید
    if pm2 start server.js --name "veteqiutte-api" --env production; then
        pm2 save
        print_success "سرور با PM2 راه‌اندازی شد"
    else
        print_error "خطا در راه‌اندازی PM2"
        exit 1
    fi
}

# تابع تست عملکرد
test_deployment() {
    print_status "تست عملکرد..."
    
    sleep 5
    
    # تست API
    if curl -f -s "http://localhost:3001/health" > /dev/null; then
        print_success "API در حال اجرا است"
    else
        print_warning "API پاسخ نمی‌دهد"
    fi
    
    # تست frontend
    if [ -f "$PROJECT_PATH/index.html" ]; then
        print_success "فایل‌های frontend موجود هستند"
    else
        print_warning "فایل index.html یافت نشد"
    fi
    
    # نمایش وضعیت PM2
    pm2 status
}

# تابع پاکسازی
cleanup() {
    print_status "پاکسازی فایل‌های موقت..."
    
    # حذف فایل‌های غیرضروری
    rm -rf $PROJECT_PATH/backend/node_modules
    rm -rf $PROJECT_PATH/pet-consultation/node_modules
    rm -rf $PROJECT_PATH/backend/src
    rm -rf $PROJECT_PATH/pet-consultation/src
    rm -rf $PROJECT_PATH/.git
    
    print_success "پاکسازی انجام شد"
}

# تابع اصلی
main() {
    print_status "شروع دیپلوی از گیت‌هاب..."
    
    # بررسی دستورات مورد نیاز
    check_command "git"
    check_command "node"
    check_command "npm"
    
    # اجرای مراحل
    create_backup
    clone_or_update
    install_backend_deps
    build_backend
    setup_prisma
    install_frontend_deps
    build_frontend
    copy_files
    set_permissions
    create_htaccess
    setup_pm2
    test_deployment
    cleanup
    
    print_success "دیپلوی با موفقیت انجام شد!"
    print_status "آدرس سایت: https://$DOMAIN"
    print_status "آدرس API: https://$DOMAIN/api"
    
    # نمایش دستورات مفید
    echo
    print_status "دستورات مفید:"
    echo "  pm2 status                 - مشاهده وضعیت سرور"
    echo "  pm2 logs veteqiutte-api    - مشاهده لاگ‌ها"
    echo "  pm2 restart veteqiutte-api - راه‌اندازی مجدد"
    echo "  pm2 stop veteqiutte-api    - توقف سرور"
}

# اجرای اسکریپت
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi