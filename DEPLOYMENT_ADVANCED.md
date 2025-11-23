# Flutter Test Coverage Sentinel - Advanced Operations Guide

Bu doküman, deployment sonrası monitoring, backup, troubleshooting ve optimizasyon konularını detaylı anlatır.

## 📋 İçindekiler
1. [Monitoring ve Logging](#monitoring-ve-logging)
2. [Backup Stratejisi](#backup-stratejisi)
3. [Performance Optimization](#performance-optimization)
4. [Troubleshooting](#troubleshooting)
5. [Güvenlik Sertleştirme](#güvenlik-sertleştirme)
6. [Scaling Strategies](#scaling-strategies)
7. [Update ve Maintenance](#update-ve-maintenance)

---

## Monitoring ve Logging

### 1. Log Dosyalarının Konumları

```bash
# Backend (PM2)
~/flutter-sentinel/backend/logs/pm2-error.log
~/flutter-sentinel/backend/logs/pm2-out.log

# Nginx
/var/log/nginx/flutter-sentinel-access.log
/var/log/nginx/flutter-sentinel-error.log

# PostgreSQL
/var/log/postgresql/postgresql-15-main.log

# Redis
/var/log/redis/redis-server.log

# System
/var/log/syslog
```

### 2. Log Görüntüleme

```bash
# Backend logs (real-time)
pm2 logs flutter-sentinel-backend

# Son 100 satır
pm2 logs flutter-sentinel-backend --lines 100

# Sadece error logs
pm2 logs flutter-sentinel-backend --err

# Nginx access log (real-time)
sudo tail -f /var/log/nginx/flutter-sentinel-access.log

# Nginx error log
sudo tail -f /var/log/nginx/flutter-sentinel-error.log

# PostgreSQL query logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# Redis logs
sudo tail -f /var/log/redis/redis-server.log

# System logs (backend servisi)
sudo journalctl -u pm2-sentinel -f
```

### 3. Log Rotation

#### PM2 Log Rotation
```bash
# pm2-logrotate modülünü kur
pm2 install pm2-logrotate

# Yapılandırma
pm2 set pm2-logrotate:max_size 10M        # Max 10MB per file
pm2 set pm2-logrotate:retain 7            # 7 gün sakla
pm2 set pm2-logrotate:compress true       # Gzip ile sıkıştır
pm2 set pm2-logrotate:workerInterval 30   # 30 saniyede kontrol

# Ayarları görüntüle
pm2 conf pm2-logrotate
```

#### Nginx Log Rotation (Otomatik)
Ubuntu'da logrotate zaten yapılandırılmış. Özel ayar için:

```bash
sudo nano /etc/logrotate.d/nginx
```

```
/var/log/nginx/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    prerotate
        if [ -d /etc/logrotate.d/httpd-prerotate ]; then \
            run-parts /etc/logrotate.d/httpd-prerotate; \
        fi
    endscript
    postrotate
        invoke-rc.d nginx rotate >/dev/null 2>&1
    endscript
}
```

### 4. Disk Kullanımı İzleme

```bash
# Genel disk kullanımı
df -h

# Backend klasörü boyutu
du -sh ~/flutter-sentinel

# Log dosyaları boyutu
du -sh ~/flutter-sentinel/backend/logs
du -sh /var/log/nginx
du -sh /var/log/postgresql

# En büyük dosyaları bul
sudo du -a /var/log | sort -n -r | head -n 20
```

### 5. PM2 Monitoring Dashboard

```bash
# Terminal monitoring
pm2 monit

# Web dashboard (pm2-web)
pm2 install pm2-web
# http://localhost:9000 adresinden erişilebilir
```

### 6. Performance Metrics

```bash
# CPU ve Memory kullanımı
htop

# Process bazlı
ps aux | grep node
ps aux | grep postgres
ps aux | grep redis

# PM2 ile detaylı metrics
pm2 describe flutter-sentinel-backend

# Memory kullanımı
free -h

# Network bağlantıları
netstat -tuln | grep -E ':(3000|5432|6379|80|443)'
```

---

## Backup Stratejisi

### 1. PostgreSQL Backup

#### Manuel Backup
```bash
# Full database dump
sudo -u postgres pg_dump sentinel > ~/backups/sentinel_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
sudo -u postgres pg_dump sentinel | gzip > ~/backups/sentinel_$(date +%Y%m%d_%H%M%S).sql.gz
```

#### Otomatik Backup Script
```bash
# Backup script oluştur
mkdir -p ~/backups
nano ~/backups/backup-database.sh
```

İçerik:
```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/home/sentinel/backups/database"
RETENTION_DAYS=7
DB_NAME="sentinel"
DB_USER="sentineluser"
DB_PASSWORD="your_password"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup filename with timestamp
BACKUP_FILE="$BACKUP_DIR/sentinel_$(date +%Y%m%d_%H%M%S).sql.gz"

# Perform backup
export PGPASSWORD=$DB_PASSWORD
pg_dump -h localhost -U $DB_USER $DB_NAME | gzip > $BACKUP_FILE

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "$(date): Backup successful: $BACKUP_FILE" >> /var/log/db-backup.log
    
    # Delete old backups
    find $BACKUP_DIR -name "sentinel_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    echo "$(date): Old backups deleted (older than $RETENTION_DAYS days)" >> /var/log/db-backup.log
else
    echo "$(date): Backup failed!" >> /var/log/db-backup.log
    exit 1
fi

unset PGPASSWORD
```

Çalıştırılabilir yap:
```bash
chmod +x ~/backups/backup-database.sh
```

#### Cron ile Otomatik Backup (Her gün 03:00)
```bash
crontab -e
```

Ekle:
```cron
0 3 * * * /home/sentinel/backups/backup-database.sh
```

#### Restore İşlemi
```bash
# Compressed backup'tan restore
gunzip -c ~/backups/sentinel_20241123_030000.sql.gz | sudo -u postgres psql sentinel

# Normal backup'tan restore
sudo -u postgres psql sentinel < ~/backups/sentinel_20241123_030000.sql
```

### 2. Redis Backup

Redis RDB snapshots otomatik olarak `/var/lib/redis/dump.rdb` dosyasına kaydedilir.

```bash
# Manuel snapshot
redis-cli BGSAVE

# RDB dosyasını backup'la
sudo cp /var/lib/redis/dump.rdb ~/backups/redis_$(date +%Y%m%d_%H%M%S).rdb
```

### 3. Application Code Backup

```bash
# Git ile versiyon kontrol (önerilen)
cd ~/flutter-sentinel
git status
git pull origin main

# Manuel backup
tar -czf ~/backups/flutter-sentinel_$(date +%Y%m%d_%H%M%S).tar.gz ~/flutter-sentinel
```

### 4. Environment Files Backup

```bash
# .env dosyasını güvenli bir yere backup'la
cp ~/flutter-sentinel/backend/.env ~/backups/.env.backup

# Şifrele (opsiyonel)
gpg -c ~/backups/.env.backup
```

### 5. Otomatik Full System Backup Script

```bash
nano ~/backups/full-backup.sh
```

```bash
#!/bin/bash

BACKUP_ROOT="/home/sentinel/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Database
pg_dump -h localhost -U sentineluser sentinel | gzip > $BACKUP_ROOT/database/sentinel_$DATE.sql.gz

# Redis
cp /var/lib/redis/dump.rdb $BACKUP_ROOT/redis/dump_$DATE.rdb

# Environment files
cp ~/flutter-sentinel/backend/.env $BACKUP_ROOT/config/env_$DATE.backup

# Application code (sadece önemli dosyalar)
tar -czf $BACKUP_ROOT/code/app_$DATE.tar.gz \
    --exclude=node_modules \
    --exclude=dist \
    --exclude=logs \
    ~/flutter-sentinel

echo "$(date): Full backup completed" >> /var/log/full-backup.log
```

Cron ile günlük çalıştır:
```bash
crontab -e
```
```cron
0 2 * * * /home/sentinel/backups/full-backup.sh
```

---

## Performance Optimization

### 1. PostgreSQL Optimizasyonu

```bash
sudo nano /etc/postgresql/15/main/postgresql.conf
```

Önerilen ayarlar (8GB RAM için):
```conf
# Memory
shared_buffers = 2GB
effective_cache_size = 6GB
maintenance_work_mem = 512MB
work_mem = 32MB

# Query Planning
random_page_cost = 1.1
effective_io_concurrency = 200

# Connections
max_connections = 100

# WAL
wal_buffers = 16MB
checkpoint_completion_target = 0.9

# Logging (production)
log_min_duration_statement = 1000  # Log slow queries (>1s)
```

Restart:
```bash
sudo systemctl restart postgresql
```

### 2. Redis Optimizasyonu

```bash
sudo nano /etc/redis/redis.conf
```

```conf
# Memory
maxmemory 2gb
maxmemory-policy allkeys-lru

# Performance
tcp-backlog 511
timeout 300
tcp-keepalive 300

# Persistence (balanced)
save 900 1
save 300 10
save 60 10000
```

Restart:
```bash
sudo systemctl restart redis-server
```

### 3. Node.js/PM2 Optimizasyonu

```bash
nano ~/flutter-sentinel/backend/ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'flutter-sentinel-backend',
    script: './dist/main.js',
    instances: 'max',  // Tüm CPU core'ları kullan
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',  // Max heap size
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      UV_THREADPOOL_SIZE: 8  // libuv thread pool size
    }
  }]
};
```

### 4. Nginx Optimizasyonu

```bash
sudo nano /etc/nginx/nginx.conf
```

```nginx
user www-data;
worker_processes auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

http {
    # Basic
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;

    # Buffers
    client_body_buffer_size 128k;
    client_max_body_size 100m;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 16k;

    # Timeouts
    client_body_timeout 12;
    client_header_timeout 12;
    send_timeout 10;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss;

    # Caching
    open_file_cache max=10000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;

    include /etc/nginx/sites-enabled/*;
}
```

Test ve restart:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## Troubleshooting

### 1. Backend Çalışmıyor

#### Adım 1: PM2 Status Kontrol
```bash
pm2 status
pm2 logs flutter-sentinel-backend --err --lines 50
```

#### Adım 2: Port Kontrolü
```bash
# 3000 portunu dinleyen process var mı?
sudo lsof -i :3000
sudo netstat -tuln | grep 3000
```

#### Adım 3: Environment Variables
```bash
# .env dosyası mevcut mu ve doğru mu?
cat ~/flutter-sentinel/backend/.env
```

#### Adım 4: Database Bağlantısı
```bash
# PostgreSQL çalışıyor mu?
sudo systemctl status postgresql

# Bağlantı test
psql -h localhost -U sentineluser -d sentinel -W
```

#### Adım 5: Redis Bağlantısı
```bash
# Redis çalışıyor mu?
sudo systemctl status redis-server

# Bağlantı test
redis-cli ping
```

#### Adım 6: Manual Start (Debug)
```bash
cd ~/flutter-sentinel/backend
NODE_ENV=production node dist/main.js
```

### 2. Database Connection Errors

**Problem**: `ECONNREFUSED 127.0.0.1:5432`

```bash
# PostgreSQL çalışıyor mu?
sudo systemctl status postgresql

# Çalışmıyorsa başlat
sudo systemctl start postgresql

# Log kontrol
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

**Problem**: `password authentication failed for user "sentineluser"`

```bash
# PostgreSQL kullanıcı şifresini resetle
sudo -u postgres psql
```
```sql
ALTER USER sentineluser WITH PASSWORD 'new_password';
```

.env dosyasındaki DATABASE_URL'i güncelle ve PM2'yi restart et.

### 3. Redis Connection Errors

**Problem**: `ECONNREFUSED 127.0.0.1:6379`

```bash
# Redis çalışıyor mu?
sudo systemctl status redis-server

# Başlat
sudo systemctl start redis-server

# Config kontrol
sudo nano /etc/redis/redis.conf
# bind 127.0.0.1 satırının açık olduğundan emin ol
```

### 4. OAuth Errors

**Problem**: "The redirect_uri MUST match the registered callback URL"

- GitHub OAuth App ayarlarını kontrol et
- `GITHUB_CALLBACK_URL` ile GitHub'daki URL birebir aynı olmalı
- HTTPS/HTTP farkına dikkat et

**Problem**: "Bad credentials"

- `GITHUB_CLIENT_SECRET` doğru mu kontrol et
- .env dosyasında extra space yok mu kontrol et

### 5. Nginx 502 Bad Gateway

```bash
# Backend çalışıyor mu?
pm2 status

# Nginx error log kontrol
sudo tail -f /var/log/nginx/flutter-sentinel-error.log

# Nginx config test
sudo nginx -t

# Upstream bağlantısı test
curl http://127.0.0.1:3000/api/v1
```

### 6. High Memory Usage

```bash
# PM2 processes
pm2 list
pm2 describe flutter-sentinel-backend

# Memory usage
free -h
htop

# Memory leak varsa restart
pm2 restart flutter-sentinel-backend

# Max memory limit ayarla
pm2 set flutter-sentinel-backend max_memory_restart 1G
```

### 7. Slow Query Performance

```bash
# PostgreSQL slow query log
sudo tail -f /var/log/postgresql/postgresql-15-main.log | grep "duration:"

# Active queries
sudo -u postgres psql sentinel
```
```sql
SELECT pid, now() - query_start as duration, query 
FROM pg_stat_activity 
WHERE state = 'active' 
ORDER BY duration DESC;
```

### 8. Disk Space Issues

```bash
# Disk kullanımı
df -h

# En büyük klasörleri bul
sudo du -sh /* | sort -h

# Log dosyalarını temizle
pm2 flush
sudo truncate -s 0 /var/log/nginx/*.log

# Eski backup'ları sil
find ~/backups -mtime +30 -delete
```

---

## Güvenlik Sertleştirme

### 1. Fail2Ban Kurulumu

```bash
sudo apt install -y fail2ban

# Yapılandırma
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
destemail = your@email.com
sendername = Fail2Ban

[sshd]
enabled = true
port = 22

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/error.log
```

Başlat:
```bash
sudo systemctl restart fail2ban
sudo fail2ban-client status
```

### 2. SSH Sertleştirme

```bash
sudo nano /etc/ssh/sshd_config
```

```
# Güvenlik ayarları
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
Port 22  # Farklı port kullanmak isterseniz değiştirin
MaxAuthTries 3
LoginGraceTime 20
```

Restart:
```bash
sudo systemctl restart sshd
```

### 3. Automatic Security Updates

```bash
sudo apt install -y unattended-upgrades

# Yapılandır
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 4. PostgreSQL SSL

PostgreSQL üzerinden SSL bağlantısı için:

```bash
sudo nano /etc/postgresql/15/main/postgresql.conf
```
```
ssl = on
ssl_cert_file = '/etc/ssl/certs/ssl-cert-snakeoil.pem'
ssl_key_file = '/etc/ssl/private/ssl-cert-snakeoil.key'
```

---

## Scaling Strategies

### 1. Horizontal Scaling (Multiple Servers)

- Load balancer ekle (HAProxy, AWS ELB)
- Database replication (Master-Slave)
- Redis cluster
- Shared file system (NFS, S3)

### 2. Vertical Scaling (Bigger Server)

```bash
# PM2 instances artır
pm2 scale flutter-sentinel-backend +2

# Veya ecosystem.config.js'de instances sayısını artır
```

### 3. Database Connection Pooling

Prisma zaten connection pooling kullanıyor. Ayar için:

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/sentinel?schema=public&connection_limit=20&pool_timeout=10"
```

---

## Update ve Maintenance

### 1. Application Update

```bash
cd ~/flutter-sentinel

# Mevcut durumu kaydet
pm2 save

# Git pull
git pull origin main

# Backend update
cd backend
npm ci --production=false
npx prisma generate
npx prisma migrate deploy
npm run build

# Zero-downtime restart
pm2 reload flutter-sentinel-backend

# Frontend update
cd ../frontend
npm ci
npm run build
```

### 2. System Update

```bash
# Packages
sudo apt update && sudo apt upgrade -y

# Node.js (major version upgrade için)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PM2 update
pm2 update
```

### 3. Database Migration

```bash
cd ~/flutter-sentinel/backend

# Migration oluştur (development'ta)
npx prisma migrate dev --name add_new_feature

# Production'a deploy
npx prisma migrate deploy
```

### 4. Health Checks

Monitoring için endpoint:

```bash
# API health check
curl https://yourdomain.com/api/v1

# Database check
sudo -u postgres psql -c "SELECT 1"

# Redis check
redis-cli ping
```

---

## Useful Scripts

### Server Info Script
```bash
nano ~/server-info.sh
```

```bash
#!/bin/bash

echo "========== Server Status =========="
echo "Date: $(date)"
echo ""
echo "--- CPU & Memory ---"
echo "Load Average: $(uptime | awk -F'load average:' '{print $2}')"
echo "Memory: $(free -h | grep Mem | awk '{print $3"/"$2}')"
echo ""
echo "--- Services ---"
echo "PostgreSQL: $(sudo systemctl is-active postgresql)"
echo "Redis: $(sudo systemctl is-active redis-server)"
echo "Nginx: $(sudo systemctl is-active nginx)"
echo "PM2 App: $(pm2 list | grep flutter-sentinel-backend | awk '{print $10}')"
echo ""
echo "--- Disk Usage ---"
df -h | grep -E '^/dev/'
echo ""
echo "--- Network ---"
netstat -tuln | grep -E ':(3000|5432|6379|80|443)'
```

```bash
chmod +x ~/server-info.sh
~/server-info.sh
```

---

**📚 Bu döküman sürekli güncellenecektir. Production ortamında karşılaşılan yeni durumlar eklenecektir.**
