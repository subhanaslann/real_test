# Docker Deployment Guide - fluttertest.tech

Bu doküman Docker Compose kullanarak **fluttertest.tech** deployment rehberidir.

## 🚀 Avantajlar

- ✅ **Kolay kurulum** - Tek komutla tüm servisler
- ✅ **İzole ortam** - Her servis kendi container'ında
- ✅ **Kolay güncelleme** - `docker-compose pull && docker-compose up -d`
- ✅ **Otomatik restart** - Hata durumunda otomatik yeniden başlatma
- ✅ **Kolay rollback** - Önceki versiyona dönüş

## 📋 Gereksinimler

- Ubuntu 22.04 sunucu
- Docker ve Docker Compose
- Domain DNS ayarları (A record)

---

## 🔧 Kurulum Adımları

### 1. Sunucuya Bağlan

```bash
ssh root@78.135.66.207
```

### 2. Sistem Güncellemesi

```bash
apt update && apt upgrade -y
apt install -y curl git ufw
```

### 3. Docker Kurulumu

```bash
# Docker repository ekle
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Docker Compose kur
apt install -y docker-compose-plugin

# Kontrol
docker --version
docker compose version
```

### 4. Firewall Ayarları

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

### 5. Projeyi Klonla

```bash
cd /root
git clone https://github.com/subhanaslann/real_test.git flutter-sentinel
cd flutter-sentinel
```

### 6. Environment Dosyası

```bash
cp .env.docker .env
```

### 7. SSL Sertifikası Al (İlk Kurulum)

SSL için önce HTTP'de çalıştırıp certbot ile sertifika alalım:

```bash
# Geçici olarak nginx.conf'u düzenle (SSL satırlarını kaldır)
nano frontend/nginx.conf
```

SSL bölümünü yoruma al veya kaldır, sadece 80 portunu bırak.

```bash
# Container'ları başlat
docker compose up -d

# SSL sertifikası al
docker compose run --rm certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  -d fluttertest.tech \
  -d www.fluttertest.tech \
  --email YOUR_EMAIL@example.com \
  --agree-tos \
  --no-eff-email
```

### 8. Nginx Config'i Geri Yükle

```bash
# SSL satırlarını geri ekle
nano frontend/nginx.conf
```

SSL bölümünü aktif et.

### 9. Database Migration

```bash
# Backend container'a gir
docker compose exec backend sh

# Migration çalıştır
npx prisma migrate deploy

# Çık
exit
```

### 10. Servisleri Yeniden Başlat

```bash
docker compose down
docker compose up -d
```

---

## ✅ Kontrol ve Test

### Container'ları Kontrol Et

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
```

### Sağlık Kontrolü

```bash
# Backend
curl https://fluttertest.tech/api/v1

# Frontend
curl https://fluttertest.tech
```

### Tarayıcıda Test

- https://fluttertest.tech - Ana sayfa
- https://fluttertest.tech/login - Login
- https://fluttertest.tech/api/v1 - API

---

## 🔄 Güncelleme

```bash
cd /root/flutter-sentinel

# En son kodu çek
git pull origin main

# Yeniden build ve başlat
docker compose build --no-cache
docker compose up -d

# Migration varsa çalıştır
docker compose exec backend npx prisma migrate deploy
```

---

## 📊 Yönetim Komutları

### Logları İzle

```bash
# Tüm servisler
docker compose logs -f

# Sadece backend
docker compose logs -f backend

# Sadece frontend
docker compose logs -f frontend
```

### Servisleri Yönet

```bash
# Durdur
docker compose stop

# Başlat
docker compose start

# Yeniden başlat
docker compose restart

# Kaldır
docker compose down

# Kaldır ve volume'leri sil
docker compose down -v
```

### Database Yedekleme

```bash
# Backup
docker compose exec postgres pg_dump -U sentineluser sentinel > backup.sql

# Restore
docker compose exec -T postgres psql -U sentineluser sentinel < backup.sql
```

---

## 🐛 Troubleshooting

### Container Çalışmıyor

```bash
docker compose ps
docker compose logs backend
```

### Database Bağlantı Hatası

```bash
docker compose exec postgres psql -U sentineluser -d sentinel
```

### SSL Yenileme

```bash
docker compose run --rm certbot renew
docker compose restart frontend
```

---

## 🎉 Başarılı Deployment!

Uygulama **https://fluttertest.tech** adresinde canlı!
