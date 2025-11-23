# Flutter Test Coverage Sentinel - Production Deployment Guide

## 📋 İçindekiler
1. [Sistem Gereksinimleri](#sistem-gereksinimleri)
2. [Sunucu Hazırlığı](#sunucu-hazırlığı)
3. [Sistem Bağımlılıkları](#sistem-bağımlılıkları)
4. [Veritabanı Kurulumu](#veritabanı-kurulumu)
5. [Redis Kurulumu](#redis-kurulumu)
6. [Backend Deployment](#backend-deployment)
7. [GitHub OAuth Kurulumu](#github-oauth-kurulumu)
8. [Environment Variables](#environment-variables)
9. [Process Manager (PM2)](#process-manager-pm2)
10. [Nginx Reverse Proxy](#nginx-reverse-proxy)
11. [SSL Sertifikası](#ssl-sertifikası)
12. [Frontend Deployment](#frontend-deployment)

---

## Sistem Gereksinimleri

### Minimum Gereksinimler
- **OS**: Ubuntu 22.04 LTS (64-bit)
- **CPU**: 2 Core
- **RAM**: 4 GB
- **Disk**: 20 GB SSD
- **Network**: 100 Mbps

### Önerilen Gereksinimler (Production)
- **OS**: Ubuntu 22.04 LTS (64-bit)
- **CPU**: 4 Core
- **RAM**: 8 GB
- **Disk**: 50 GB SSD
- **Network**: 1 Gbps

---

## Sunucu Hazırlığı

### 1. Sistem Güncellemesi
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential
```

### 2. Firewall Kurulumu
```bash
# UFW kurulum ve yapılandırma
sudo apt install -y ufw

# SSH, HTTP, HTTPS portlarını aç
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Firewall'ı etkinleştir
sudo ufw enable
sudo ufw status
```

### 3. Swap Alanı Oluşturma (Opsiyonel ama önerilen)
```bash
# 4GB swap alanı oluştur
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Kalıcı hale getir
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## Sistem Bağımlılıkları

### 1. Node.js Kurulumu (v20.x LTS)
```bash
# NodeSource repository ekle
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Node.js ve npm kur
sudo apt install -y nodejs

# Versiyonları kontrol et
node -v  # v20.x.x olmalı
npm -v   # 10.x.x olmalı
```

### 2. Git Kurulumu
```bash
sudo apt install -y git
git --version
```

---

## Veritabanı Kurulumu

### PostgreSQL 15 Kurulumu

```bash
# PostgreSQL APT repository ekle
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

# Güncelle ve kur
sudo apt update
sudo apt install -y postgresql-15 postgresql-contrib-15

# PostgreSQL servisini başlat ve enable et
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo systemctl status postgresql
```

### PostgreSQL Yapılandırması

```bash
# PostgreSQL kullanıcısına geç
sudo -u postgres psql
```

PostgreSQL içinde aşağıdaki komutları çalıştır:

```sql
-- Veritabanı ve kullanıcı oluştur
CREATE DATABASE sentinel;
CREATE USER sentineluser WITH ENCRYPTED PASSWORD 'your_strong_password_here';

-- Yetkileri ver
GRANT ALL PRIVILEGES ON DATABASE sentinel TO sentineluser;

-- Modern PostgreSQL için gerekli (15+)
\c sentinel
GRANT ALL ON SCHEMA public TO sentineluser;

-- Çıkış
\q
```

### Bağlantı Testi

```bash
# Bağlantıyı test et
psql -h localhost -U sentineluser -d sentinel -W
```

---

## Redis Kurulumu

### Redis 7.x Kurulumu

```bash
# Redis kur
sudo apt install -y redis-server

# Redis yapılandırması
sudo nano /etc/redis/redis.conf
```

Aşağıdaki ayarları yapın:
```conf
# Supervised systemd olarak değiştir
supervised systemd

# Bind address (sadece localhost)
bind 127.0.0.1

# Memory limit (maksimum RAM'in %25'i)
maxmemory 2gb
maxmemory-policy allkeys-lru

# Persistence ayarları
save 900 1
save 300 10
save 60 10000
```

Redis'i başlat:
```bash
sudo systemctl restart redis-server
sudo systemctl enable redis-server
sudo systemctl status redis-server

# Bağlantı testi
redis-cli ping  # PONG dönmeli
```

---

## Backend Deployment

### 1. Uygulama Kullanıcısı Oluştur

```bash
# Deployment için özel kullanıcı oluştur
sudo adduser --disabled-password --gecos "" sentinel
sudo usermod -aG sudo sentinel

# Kullanıcıya geç
sudo su - sentinel
```

### 2. Proje Klonlama

```bash
cd ~
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git flutter-sentinel
cd flutter-sentinel/backend
```

### 3. Dependencies Kurulumu

```bash
# NPM paketlerini kur
npm ci --production=false

# Prisma client oluştur
npx prisma generate
```

### 4. Environment Variables Yapılandırması

```bash
# .env dosyası oluştur
nano .env
```

Aşağıdaki içeriği ekleyin:

```env
# Application
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL="postgresql://sentineluser:your_strong_password_here@localhost:5432/sentinel?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_super_secure_jwt_secret_min_32_characters

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=https://yourdomain.com/api/v1/auth/github/callback
```

### 5. Veritabanı Migrasyonu

```bash
# Prisma migration çalıştır
npx prisma migrate deploy
```

### 6. Build

```bash
# TypeScript build
npm run build

# Build çıktısını kontrol et
ls -la dist/
```

---

## GitHub OAuth Kurulumu

Bu bölüm GitHub OAuth uygulaması oluşturma adımlarını detaylı anlatır.

### 1. GitHub OAuth App Oluşturma

1. **GitHub'a giriş yapın** ve ayarlar sayfasına gidin:
   - https://github.com/settings/developers

2. **"OAuth Apps" sekmesine tıklayın**

3. **"New OAuth App" butonuna tıklayın**

4. **Uygulama bilgilerini doldurun**:

   ```
   Application name: Flutter Test Coverage Sentinel
   
   Homepage URL: https://yourdomain.com
   
   Application description: Automated test coverage analysis tool for Flutter projects
   
   Authorization callback URL: https://yourdomain.com/api/v1/auth/github/callback
   ```

   **ÖNEMLİ**: Callback URL'i tam olarak yukarıdaki gibi yazın:
   - Domain adınızı kullanın
   - `/api/v1/auth/github/callback` path'i backend'in API prefix'i ile eşleşmeli
   - HTTPS kullanın (production için)

5. **"Register application" butonuna tıklayın**

### 2. Client ID ve Client Secret Alma

1. Uygulama oluşturulduktan sonra, **Client ID** görünür olacaktır.
   - Bu ID'yi kopyalayın → `.env` dosyasındaki `GITHUB_CLIENT_ID`

2. **"Generate a new client secret"** butonuna tıklayın
   - Secret oluşturulduktan sonra **sadece bir kez gösterilir**
   - Bu secret'ı kopyalayın → `.env` dosyasındaki `GITHUB_CLIENT_SECRET`

### 3. Backend Konfigürasyonu Güncelleme

Backend'in `auth.controller.ts` dosyası frontend'e yönlendirir. Production için güncelleyin:

```bash
nano ~/flutter-sentinel/backend/src/auth/auth.controller.ts
```

23. satırı bulun ve domain'inizi yazın:
```typescript
res.redirect(`https://yourdomain.com/auth/callback?token=${data.access_token}`);
```

**Build'i yeniden çalıştırın**:
```bash
cd ~/flutter-sentinel/backend
npm run build
```

### 4. OAuth Test

```bash
# Backend'i başlat
cd ~/flutter-sentinel/backend
NODE_ENV=production node dist/main.js

# OAuth endpoint'ini test et
curl -I http://localhost:3000/api/v1/auth/github
```

---

## Environment Variables

Backend için tüm environment variables'ların detaylı açıklaması:

| Variable | Açıklama | Örnek Değer | Zorunlu |
|----------|----------|-------------|---------|
| `NODE_ENV` | Uygulama ortamı | `production` | ✅ |
| `PORT` | Backend port numarası | `3000` | ✅ |
| `DATABASE_URL` | PostgreSQL bağlantı string'i | `postgresql://user:pass@localhost:5432/sentinel` | ✅ |
| `REDIS_HOST` | Redis sunucu adresi | `localhost` | ✅ |
| `REDIS_PORT` | Redis port numarası | `6379` | ✅ |
| `JWT_SECRET` | JWT token secret (min 32 karakter) | `supersecret...` | ✅ |
| `GITHUB_CLIENT_ID` | GitHub OAuth Client ID | `Iv1.abc123...` | ✅ |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth Client Secret | `1234abcd...` | ✅ |
| `GITHUB_CALLBACK_URL` | OAuth callback URL | `https://domain.com/api/v1/auth/github/callback` | ✅ |

### Güvenli Secret Oluşturma

```bash
# JWT Secret oluştur (32+ karakter)
openssl rand -base64 32
```

---

## Process Manager (PM2)

PM2, Node.js uygulamasını production'da yönetmek için kullanılır.

### 1. PM2 Kurulumu

```bash
# PM2'yi global olarak kur
sudo npm install -g pm2
```

### 2. PM2 Ecosystem Dosyası

```bash
cd ~/flutter-sentinel/backend
nano ecosystem.config.js
```

İçerik:

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

### 3. PM2 Başlatma

```bash
# Log klasörü oluştur
mkdir -p ~/flutter-sentinel/backend/logs

# PM2 ile başlat
cd ~/flutter-sentinel/backend
pm2 start ecosystem.config.js

# Status kontrol
pm2 status
pm2 logs flutter-sentinel-backend --lines 50
```

### 4. Sistem Başlangıcına Ekleme

```bash
# Startup script
pm2 startup systemd -u sentinel --hp /home/sentinel

# Çıktıdaki komutu sudo ile çalıştırın

# PM2 süreçlerini kaydet
pm2 save
```

---

## Nginx Reverse Proxy

### 1. Nginx Kurulumu

```bash
# Nginx kur
sudo apt install -y nginx

# Nginx'i başlat
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2. Nginx Yapılandırması

```bash
sudo nano /etc/nginx/sites-available/flutter-sentinel
```

Yapılandırma:

```nginx
upstream backend_api {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (Let's Encrypt ekleyecek)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    client_max_body_size 100M;

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

### 3. Nginx Etkinleştirme

```bash
# Symlink oluştur
sudo ln -s /etc/nginx/sites-available/flutter-sentinel /etc/nginx/sites-enabled/

# Default site'ı kaldır
sudo rm /etc/nginx/sites-enabled/default

# Test et
sudo nginx -t

# Restart
sudo systemctl restart nginx
```

---

## SSL Sertifikası

Let's Encrypt ile ücretsiz SSL kurulumu.

### 1. Certbot Kurulumu

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2. SSL Sertifikası Alma

```bash
# Domain'inizi kullanarak sertifika al
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 3. Otomatik Yenileme

```bash
# Test et
sudo certbot renew --dry-run

# Timer kontrol
sudo systemctl status certbot.timer
```

---

## Frontend Deployment

### 1. Frontend Environment

```bash
cd ~/flutter-sentinel/frontend
nano .env
```

İçerik:
```env
VITE_API_URL=https://yourdomain.com/api/v1
```

### 2. Frontend Build

```bash
# Dependencies
npm ci

# Build
npm run build

# Kontrol
ls -la dist/
```

Frontend Nginx tarafından serve edilecek.

---

## Güvenlik Önerileri

1. **SSH Key Authentication**: Password authentication'ı devre dışı bırak
2. **Fail2Ban**: Brute force saldırılarına karşı kur
3. **Firewall**: Sadece gerekli portları aç
4. **Environment Variables**: `.env` dosyasının izinlerini `600` yap
5. **PostgreSQL**: Sadece localhost'tan erişim
6. **Redis**: Sadece localhost'tan erişim
7. **Rate Limiting**: Nginx ile API rate limiting ekle

---

## Deployment Checklist

- [ ] Ubuntu 22.04 kurulu ve güncel
- [ ] Node.js 20.x kurulu
- [ ] PostgreSQL 15 kurulu ve yapılandırılmış
- [ ] Redis kurulu ve çalışıyor
- [ ] Backend klonlandı ve build edildi
- [ ] GitHub OAuth App oluşturuldu
- [ ] Environment variables ayarlandı
- [ ] Database migration çalıştırıldı
- [ ] PM2 kurulu ve uygulama çalışıyor
- [ ] Nginx kurulu ve yapılandırıldı
- [ ] SSL sertifikası kuruldu
- [ ] Frontend build edildi
- [ ] Firewall yapılandırıldı
- [ ] Tüm servisler otomatik başlatılıyor

---

## Yararlı Komutlar

```bash
# Service Durumları
sudo systemctl status postgresql
sudo systemctl status redis-server
sudo systemctl status nginx
pm2 status

# Loglar
pm2 logs flutter-sentinel-backend
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Restart
pm2 restart flutter-sentinel-backend
sudo systemctl restart nginx
sudo systemctl restart postgresql

# Health Check
curl https://yourdomain.com/api/v1/auth/me
```

---

**🎉 Deployment tamamlandı! Uygulamanız artık production'da çalışıyor.**
