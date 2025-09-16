# راهنمای تنظیم GitHub Secrets برای دیپلوی خودکار

## مقدمه
برای استفاده از GitHub Actions و دیپلوی خودکار، باید اطلاعات حساس مانند رمزهای عبور و کلیدهای دسترسی را به صورت امن در GitHub Secrets ذخیره کنید.

## مراحل تنظیم Secrets

### 1. دسترسی به تنظیمات Repository
1. به repository خود در GitHub بروید
2. روی تب **Settings** کلیک کنید
3. در منوی سمت چپ، **Secrets and variables** > **Actions** را انتخاب کنید

### 2. اضافه کردن Secrets مورد نیاز

#### اطلاعات سرور SSH
```
SSH_HOST
مقدار: آدرس IP یا دامنه سرور تگراهاست
مثال: your-server.tegrahost.com
```

```
SSH_USERNAME
مقدار: نام کاربری cPanel یا SSH
مثال: your_username
```

```
SSH_PASSWORD
مقدار: رمز عبور SSH
مثال: your_secure_password
```

```
SSH_PORT
مقدار: پورت SSH (معمولاً 22)
مثال: 22
```

#### اطلاعات دامنه
```
DOMAIN
مقدار: نام دامنه شما
مثال: yourdomain.com
```

#### اطلاعات دیتابیس
```
DATABASE_URL
مقدار: رشته اتصال کامل دیتابیس
مثال: sqlserver://./MSSQLSERVER2019:1433;database=veteqiutte;user=username;password=password;integratedSecurity=false;trustServerCertificate=true
```

#### کلید امنیتی JWT
```
JWT_SECRET
مقدار: کلید مخفی برای JWT
مثال: your-super-secret-jwt-key-here-make-it-long-and-random
```

## نحوه ایجاد کلید JWT امن

### روش 1: استفاده از Node.js
```javascript
// در terminal اجرا کنید:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### روش 2: استفاده از OpenSSL
```bash
openssl rand -hex 64
```

### روش 3: استفاده از PowerShell
```powershell
[System.Web.Security.Membership]::GeneratePassword(64, 10)
```

## تنظیم SSH Key (روش امن‌تر)

### 1. تولید SSH Key
```bash
# در سیستم محلی
ssh-keygen -t rsa -b 4096 -C "github-actions@yourdomain.com"
```

### 2. کپی کردن Public Key به سرور
```bash
# کپی محتوای فایل .pub
cat ~/.ssh/id_rsa.pub

# در سرور، اضافه کردن به authorized_keys
echo "محتوای public key" >> ~/.ssh/authorized_keys
```

### 3. اضافه کردن Private Key به GitHub Secrets
```
SSH_PRIVATE_KEY
مقدار: محتوای کامل فایل private key
```

### 4. تغییر GitHub Actions برای استفاده از SSH Key
```yaml
- name: Deploy with SSH Key
  uses: appleboy/ssh-action@v1.0.3
  with:
    host: ${{ secrets.SSH_HOST }}
    username: ${{ secrets.SSH_USERNAME }}
    key: ${{ secrets.SSH_PRIVATE_KEY }}
    port: ${{ secrets.SSH_PORT || 22 }}
```

## Environment Variables اضافی

### برای محیط Production
```
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://yourdomain.com
UPLOAD_PATH=/home/username/domains/yourdomain.com/public_html/uploads
MAX_FILE_SIZE=10485760
```

### برای ایمیل (اختیاری)
```
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=email_password
```

## تست تنظیمات

### 1. تست اتصال SSH
```bash
# در سیستم محلی
ssh username@your-server.tegrahost.com
```

### 2. تست دیتابیس
```javascript
// در Node.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ اتصال دیتابیس موفق');
  } catch (error) {
    console.error('❌ خطا در اتصال دیتابیس:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
```

## امنیت و بهترین روش‌ها

### 1. محدود کردن دسترسی SSH
```bash
# در سرور، تنظیم فایل /etc/ssh/sshd_config
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AllowUsers your_username
```

### 2. استفاده از Firewall
```bash
# محدود کردن دسترسی SSH به IP های خاص
ufw allow from GITHUB_IP to any port 22
```

### 3. تغییر منظم رمزهای عبور
- هر 3 ماه JWT_SECRET را تغییر دهید
- رمز دیتابیس را منظماً تغییر دهید
- SSH keys را سالانه تجدید کنید

### 4. مانیتورینگ دسترسی‌ها
```bash
# مشاهده لاگ‌های SSH
tail -f /var/log/auth.log

# مشاهده اتصالات فعال
who
w
```

## عیب‌یابی مشکلات رایج

### خطای SSH Connection
```
# بررسی وضعیت SSH service
sudo systemctl status ssh

# راه‌اندازی مجدد SSH
sudo systemctl restart ssh
```

### خطای Permission Denied
```
# بررسی دسترسی‌های SSH directory
ls -la ~/.ssh/
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### خطای Database Connection
```
# تست اتصال دیتابیس
sqlcmd -S server -U username -P password -Q "SELECT 1"
```

## مثال کامل GitHub Secrets

```
# اطلاعات سرور
SSH_HOST=your-server.tegrahost.com
SSH_USERNAME=your_username
SSH_PASSWORD=your_secure_password
SSH_PORT=22
DOMAIN=yourdomain.com

# اطلاعات دیتابیس
DATABASE_URL=sqlserver://./MSSQLSERVER2019:1433;database=veteqiutte;user=username;password=password;integratedSecurity=false;trustServerCertificate=true

# امنیت
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2

# محیط
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://yourdomain.com
```

## نکات مهم

1. **هرگز** secrets را در کد commit نکنید
2. از نام‌های واضح برای secrets استفاده کنید
3. دسترسی repository را محدود کنید
4. منظماً secrets را بروزرسانی کنید
5. از environment های مختلف (staging, production) استفاده کنید

## تست GitHub Actions

### اجرای دستی Workflow
1. به تب **Actions** در repository بروید
2. workflow مورد نظر را انتخاب کنید
3. روی **Run workflow** کلیک کنید

### مشاهده لاگ‌ها
1. روی run اجرا شده کلیک کنید
2. هر job را برای مشاهده جزئیات باز کنید
3. خطاها را بررسی و رفع کنید

با تنظیم صحیح این secrets، GitHub Actions شما قادر خواهد بود پروژه را به صورت خودکار دیپلوی کند.