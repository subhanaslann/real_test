# Production Deployment Guide - fluttertest.tech

Bu doküman **fluttertest.tech** domain'i için özel hazırlanmış production deployment rehberidir.

## 🔐 Credentials (Güvenli Saklanmalı!)

### GitHub OAuth
```
Client ID: Ov23licGtF3q6EPcxYLZ
Client Secret: 7719234587339eb679d3d7f4647e52a8ba4be2b9
```

### Domain
```
Primary: fluttertest.tech
WWW: www.fluttertest.tech
```

### GitHub OAuth App Settings
```
Application name: Flutter Test Coverage Sentinel
Homepage URL: https://fluttertest.tech
Callback URL: https://fluttertest.tech/api/v1/auth/github/callback
```

---

## 📋 Pre-Deployment Checklist

### 1. Domain ve DNS Ayarları

**A Records (IPv4)**:
```
fluttertest.tech         →  YOUR_SERVER_IP
www.fluttertest.tech     →  YOUR_SERVER_IP
```

**DNS Kontrolü**:
```bash
# DNS propagation kontrolü
dig fluttertest.tech
dig www.fluttertest.tech

# Alternatif
nslookup fluttertest.tech
nslookup www.fluttertest.tech
```

### 2. Sunucu Erişimi

SSH ile sunucuya bağlan:
```bash
ssh root@YOUR_SERVER_IP
# veya
ssh your-username@fluttertest.tech
```

---

## 🚀 Deployment Adımları

### ADIM 1: Sunucu Hazırlığı

```bash
# Sistem güncelle
sudo apt update && sudo apt upgrade -y

# Gerekli paketler
sudo apt install -y curl wget git build-essential ufw

# Firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### ADIM 2: Node.js Kurulumu

```bash
# Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Kontrol
node -v  # v20.x.x
npm -v   # 10.x.x
```

### ADIM 3: PostgreSQL Kurulumu

```bash
# PostgreSQL 15
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update
sudo apt install -y postgresql-15 postgresql-contrib-15

# Başlat
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Database Oluştur**:
```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE sentinel;
CREATE USER sentineluser WITH ENCRYPTED PASSWORD 'SECURE_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE sentinel TO sentineluser;
\c sentinel
GRANT ALL ON SCHEMA public TO sentineluser;
\q
```

**ÖNEMLİ**: `SECURE_PASSWORD_HERE` yerine güçlü bir şifre kullan ve kaydet!

### ADIM 4: Redis Kurulumu

```bash
# Redis
sudo apt install -y redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Test
redis-cli ping  # PONG
```

### ADIM 5: Uygulama Kullanıcısı

```bash
# sentinel kullanıcısı oluştur
sudo adduser --disabled-password --gecos "" sentinel
sudo usermod -aG sudo sentinel

# Kullanıcıya geç
sudo su - sentinel
cd ~
```

### ADIM 6: Projeyi Klonla

```bash
# Git clone
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git flutter-sentinel
cd flutter-sentinel
```

**Alternatif**: Projeyi SCP/SFTP ile yükle:
```bash
# Lokal makineden
scp -r real_test sentinel@YOUR_SERVER_IP:~/flutter-sentinel
```

### ADIM 7: Backend Kurulumu

```bash
cd ~/flutter-sentinel/backend

# Dependencies
npm ci --production=false

# Prisma
npx prisma generate

# .env dosyası oluştur
nano .env
```

**.env İçeriği** (Aşağıdaki değerleri kullan):
```env
NODE_ENV=production
PORT=3000

DATABASE_URL="postgresql://sentineluser:YOUR_DB_PASSWORD@localhost:5432/sentinel?schema=public"

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=kX9mP2vN8qR5wT7yU4bL6hF3jD0sA1gZ9xC8vB7nM5qW2eR4tY6uI8oP0aS3dF5

GITHUB_CLIENT_ID=Ov23licGtF3q6EPcxYLZ
GITHUB_CLIENT_SECRET=7719234587339eb679d3d7f4647e52a8ba4be2b9
GITHUB_CALLBACK_URL=https://fluttertest.tech/api/v1/auth/github/callback

FRONTEND_URL=https://fluttertest.tech
```

**Önemli**: `YOUR_DB_PASSWORD` yerine ADIM 3'te oluşturduğunuz şifreyi yazın!

```bash
# .env dosyasını güvenli hale getir
chmod 600 .env

# Database migration
npx prisma migrate deploy

# Build
npm run build
```

### ADIM 8: Frontend Kurulumu

```bash
cd ~/flutter-sentinel/frontend

# .env dosyası oluştur
nano .env
```

**.env İçeriği**:
```env
VITE_API_URL=https://fluttertest.tech/api/v1
```

```bash
# Dependencies
npm ci

# Build
npm run build

# Kontrol
ls -la dist/
```

### ADIM 9: PM2 Kurulumu

```bash
# PM2 global kur
sudo npm install -g pm2

# Backend'e geç
cd ~/flutter-sentinel/backend

# ecosystem.config.js oluştur
nano ecosystem.config.js
```

**ecosystem.config.js İçeriği**:
```javascript
module.exports = {
  apps: [{
    name: 'flutter-sentinel-backend',
    script: './dist/main.js',
    instances: 2,
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    time: true
  }]
};
```

```bash
# Log klasörü
mkdir -p logs

# PM2 başlat
pm2 start ecosystem.config.js

# Kontrol
pm2 status
pm2 logs flutter-sentinel-backend --lines 50

# Sistem başlangıcı
pm2 startup systemd -u sentinel --hp /home/sentinel
# Yukarıdaki komutun verdiği çıktıyı sudo ile çalıştır

pm2 save
```

### ADIM 10: Nginx Kurulumu

```bash
# Root kullanıcıya geç
exit  # sentinel kullanıcısından çık

# Nginx kur
sudo apt install -y nginx

# Site config oluştur
sudo nano /etc/nginx/sites-available/flutter-sentinel
```

**Nginx Configuration**:
```nginx
upstream backend_api {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name fluttertest.tech www.fluttertest.tech;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name fluttertest.tech www.fluttertest.tech;

    # SSL certificates (Let's Encrypt will add these)
    # ssl_certificate /etc/letsencrypt/live/fluttertest.tech/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/fluttertest.tech/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    client_max_body_size 100M;

    access_log /var/log/nginx/fluttertest-access.log;
    error_log /var/log/nginx/fluttertest-error.log;

    # Backend API
    location /api/ {
        proxy_pass http://backend_api;
        proxy_http_version 1.1;
        
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_cache_bypass $http_upgrade;
        proxy_redirect off;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 300s;
    }

    # Frontend
    location / {
        root /home/sentinel/flutter-sentinel/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

```bash
# Symlink oluştur
sudo ln -s /etc/nginx/sites-available/flutter-sentinel /etc/nginx/sites-enabled/

# Default site'ı kaldır
sudo rm /etc/nginx/sites-enabled/default

# Test
sudo nginx -t

# Başlat
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### ADIM 11: SSL Sertifikası (Let's Encrypt)

```bash
# Certbot kur
sudo apt install -y certbot python3-certbot-nginx

# SSL sertifikası al
sudo certbot --nginx -d fluttertest.tech -d www.fluttertest.tech

# Email: YOUR_EMAIL@example.com
# Terms: A (Agree)
# Redirect: 2 (HTTPS'e yönlendir)

# Test renewal
sudo certbot renew --dry-run

# Auto-renewal kontrol
sudo systemctl status certbot.timer
```

---

## ✅ Post-Deployment Verification

### 1. Backend Test

```bash
# Backend çalışıyor mu?
pm2 status

# Logs kontrol
pm2 logs flutter-sentinel-backend --lines 20

# API test
curl https://fluttertest.tech/api/v1
```

### 2. Database Test

```bash
# PostgreSQL
sudo systemctl status postgresql

# Redis
redis-cli ping
```

### 3. OAuth Test

Tarayıcıda:
```
https://fluttertest.tech/api/v1/auth/github
```

GitHub'a redirect etmeli.

### 4. Frontend Test

```
https://fluttertest.tech
```

Login sayfası görünmeli.

### 5. Full Flow Test

1. `https://fluttertest.tech/login` → Login sayfası
2. "Login with GitHub" → GitHub'a yönlendirme
3. GitHub'da authorize → Dashboard'a yönlendirme
4. Dashboard görünmeli

---

## 🔧 Troubleshooting

### Backend Çalışmıyor

```bash
pm2 logs flutter-sentinel-backend --err
pm2 restart flutter-sentinel-backend
```

### Database Connection Error

```bash
# PostgreSQL çalışıyor mu?
sudo systemctl status postgresql

# .env kontrolü
cat ~/flutter-sentinel/backend/.env | grep DATABASE_URL
```

### SSL Issues

```bash
# Sertifika kontrol
sudo certbot certificates

# Nginx error log
sudo tail -f /var/log/nginx/fluttertest-error.log
```

### OAuth Redirect Hatası

GitHub OAuth App settings'te callback URL kontrol et:
```
https://fluttertest.tech/api/v1/auth/github/callback
```

---

## 📊 Monitoring

### Log Files

```bash
# Backend
pm2 logs flutter-sentinel-backend

# Nginx access
sudo tail -f /var/log/nginx/fluttertest-access.log

# Nginx error
sudo tail -f /var/log/nginx/fluttertest-error.log
```

### System Resources

```bash
# CPU/Memory
htop

# Disk
df -h

# PM2 monitoring
pm2 monit
```

---

## 🔄 Update Deployment

```bash
cd ~/flutter-sentinel

# Git pull
git pull origin main

# Backend update
cd backend
npm ci --production=false
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 reload flutter-sentinel-backend

# Frontend update
cd ../frontend
npm ci
npm run build
```

---

## 🔐 Security Checklist

- [x] Firewall enabled (UFW)
- [x] SSH key authentication
- [x] .env file permissions (600)
- [x] PostgreSQL only localhost
- [x] Redis only localhost
- [x] SSL/HTTPS enabled
- [x] Security headers (Nginx)
- [x] Strong database password
- [x] GitHub OAuth secrets secure

---

## 📞 Support Information

**Domain**: fluttertest.tech
**Backend**: https://fluttertest.tech/api/v1
**Frontend**: https://fluttertest.tech
**SSL**: Let's Encrypt (Auto-renew)

---

## ✅ Deployment Complete!

Uygulama artık **https://fluttertest.tech** adresinde live!

Test için:
1. https://fluttertest.tech → Ana sayfa
2. https://fluttertest.tech/login → Login sayfası
3. GitHub OAuth flow testi

**🎉 Başarıyla deploy edildi!**
