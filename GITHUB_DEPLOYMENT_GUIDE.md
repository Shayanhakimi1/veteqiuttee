# راهنمای دیپلوی از گیت‌هاب به تگراهاست

## مزایای دیپلوی از گیت‌هاب
- مدیریت آسان‌تر کد
- امکان rollback سریع
- CI/CD خودکار
- همکاری تیمی بهتر

## مراحل آماده‌سازی گیت‌هاب

### 1. ایجاد Repository
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/veteqiutte.git
git push -u origin main
```

### 2. تنظیم GitHub Actions (اختیاری)
ایجاد فایل `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Tegrahost

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install Backend Dependencies
      run: |
        cd backend
        npm ci
        
    - name: Build Backend
      run: |
        cd backend
        npm run build
        
    - name: Install Frontend Dependencies
      run: |
        cd pet-consultation
        npm ci
        
    - name: Build Frontend
      run: |
        cd pet-consultation
        npm run build
        
    - name: Deploy to Server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        password: ${{ secrets.PASSWORD }}
        script: |
          cd /home/username/domains/yourdomain.com/public_html
          git pull origin main
          cd api
          npm install --production
          npx prisma generate
          pm2 restart veteqiutte-api
```

## روش‌های دیپلوی از گیت‌هاب

### روش 1: دیپلوی دستی

#### مرحله 1: کلون کردن در سرور
```bash
# اتصال به سرور تگراهاست از طریق SSH
ssh username@yourdomain.com

# رفتن به مسیر public_html
cd /home/username/domains/yourdomain.com/public_html

# کلون کردن پروژه
git clone https://github.com/username/veteqiutte.git .
```

#### مرحله 2: نصب وابستگی‌ها و بیلد
```bash
# Backend
cd api
npm install --production
npm run build
npx prisma generate
npx prisma db push

# Frontend (اگر نیاز به بیلد باشد)
cd ../
npm install
npm run build
```

#### مرحله 3: تنظیم فایل‌ها
```bash
# کپی کردن فایل‌های frontend
cp -r pet-consultation/dist/* ./

# کپی کردن فایل‌های backend
mkdir -p api
cp -r backend/dist/* api/
cp backend/package.json api/
cp backend/.env api/
cp -r backend/prisma api/
```

### روش 2: استفاده از Git Hooks

#### تنظیم Post-Receive Hook
ایجاد فایل `hooks/post-receive` در bare repository:

```bash
#!/bin/bash
cd /home/username/domains/yourdomain.com/public_html
git --git-dir=/path/to/bare/repo.git --work-tree=/home/username/domains/yourdomain.com/public_html checkout -f

# Build Backend
cd backend
npm install --production
npm run build
npx prisma generate

# Build Frontend
cd ../pet-consultation
npm install
npm run build

# Copy files
cp -r dist/* ../
cp -r ../backend/dist/* ../api/

# Restart services
pm2 restart veteqiutte-api
```

### روش 3: GitHub Actions (خودکار)

#### تنظیم Secrets در GitHub
1. رفتن به Settings > Secrets and variables > Actions
2. اضافه کردن:
   - `HOST`: آدرس سرور
   - `USERNAME`: نام کاربری SSH
   - `PASSWORD`: رمز عبور SSH
   - `DATABASE_URL`: رشته اتصال دیتابیس
   - `JWT_SECRET`: کلید JWT

#### فایل workflow (بالا ذکر شد)

## مدیریت Environment Variables

### فایل .env.production
```env
DATABASE_URL="sqlserver://./MSSQLSERVER2019:1433;database=veteqiutte;user=username;password=password;integratedSecurity=false;trustServerCertificate=true"
JWT_SECRET="your-production-jwt-secret"
NODE_ENV="production"
PORT=3001
```

### استفاده از GitHub Secrets
```yaml
- name: Create .env file
  run: |
    echo "DATABASE_URL=${{ secrets.DATABASE_URL }}" > backend/.env
    echo "JWT_SECRET=${{ secrets.JWT_SECRET }}" >> backend/.env
    echo "NODE_ENV=production" >> backend/.env
```

## مدیریت Branch ها

### استراتژی Branching
```
main (production)
├── develop (staging)
├── feature/user-management
├── feature/consultation-system
└── hotfix/critical-bug
```

### دستورات مفید Git
```bash
# ایجاد branch جدید
git checkout -b feature/new-feature

# merge کردن
git checkout main
git merge feature/new-feature

# push کردن
git push origin main

# pull کردن تغییرات
git pull origin main
```

## Rollback و بازگشت

### بازگشت به commit قبلی
```bash
# مشاهده تاریخچه
git log --oneline

# بازگشت به commit خاص
git checkout <commit-hash>

# یا reset کردن
git reset --hard <commit-hash>
git push --force
```

### استفاده از PM2 برای rollback
```bash
# ذخیره وضعیت فعلی
pm2 save

# بازگشت به وضعیت قبلی
pm2 resurrect
```

## مانیتورینگ و لاگ‌ها

### مشاهده لاگ‌های GitHub Actions
1. رفتن به tab Actions در repository
2. انتخاب workflow اجرا شده
3. مشاهده جزئیات هر step

### مشاهده لاگ‌های سرور
```bash
# لاگ‌های PM2
pm2 logs veteqiutte-api

# لاگ‌های Git
git log --oneline -10

# لاگ‌های سیستم
tail -f /var/log/nginx/access.log
```

## نکات امنیتی

### محافظت از اطلاعات حساس
1. هرگز فایل `.env` را commit نکنید
2. از GitHub Secrets استفاده کنید
3. SSH keys را به جای password استفاده کنید
4. دسترسی‌های repository را محدود کنید

### فایل .gitignore
```
# Environment variables
.env
.env.local
.env.production

# Dependencies
node_modules/

# Build outputs
dist/
build/

# Database
*.db
*.sqlite

# Logs
logs/
*.log

# Temporary files
temp/
tmp/
```

## عیب‌یابی مشکلات رایج

### مشکل دسترسی SSH
```bash
# تست اتصال SSH
ssh -T git@github.com

# تنظیم SSH key
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

### مشکل permissions
```bash
# تنظیم دسترسی‌ها
chmod 755 /path/to/project
chmod 644 .env
chown -R username:username /path/to/project
```

### مشکل Node.js modules
```bash
# پاک کردن cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## خلاصه مراحل

1. **آماده‌سازی Repository**
   - ایجاد repo در GitHub
   - Push کردن کد

2. **تنظیم سرور**
   - Clone کردن پروژه
   - نصب dependencies
   - تنظیم environment variables

3. **خودکارسازی (اختیاری)**
   - تنظیم GitHub Actions
   - تنظیم Git Hooks

4. **تست و مانیتورینگ**
   - تست عملکرد
   - مشاهده لاگ‌ها
   - آماده‌باش برای rollback

با این روش می‌توانید به راحتی پروژه خود را از گیت‌هاب به تگراهاست دیپلوی کنید و مدیریت کنید.