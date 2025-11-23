# GitHub OAuth Kurulum Rehberi - Flutter Test Coverage Sentinel

Bu doküman, Flutter Test Coverage Sentinel uygulaması için GitHub OAuth authentication kurulumunu adım adım anlatır.

## 📋 İçindekiler
1. [OAuth Nedir?](#oauth-nedir)
2. [GitHub OAuth App Oluşturma](#github-oauth-app-oluşturma)
3. [Credentials Alma](#credentials-alma)
4. [Backend Yapılandırması](#backend-yapılandırması)
5. [Frontend Yapılandırması](#frontend-yapılandırması)
6. [Development vs Production](#development-vs-production)
7. [OAuth Flow Testi](#oauth-flow-testi)
8. [Troubleshooting](#troubleshooting)
9. [Güvenlik Best Practices](#güvenlik-best-practices)

---

## OAuth Nedir?

OAuth (Open Authorization), kullanıcıların şifrelerini paylaşmadan üçüncü taraf uygulamalara sınırlı erişim vermelerini sağlayan bir yetkilendirme protokolüdür.

### Bu Projede OAuth Kullanımı

1. Kullanıcı "Login with GitHub" butonuna tıklar
2. GitHub'a yönlendirilir ve giriş yapar
3. Uygulama izinlerini onaylar
4. GitHub kullanıcıyı uygulamamıza geri yönlendirir
5. Backend bir JWT token oluşturur
6. Frontend bu token ile API istekleri yapar

---

## GitHub OAuth App Oluşturma

### Adım 1: GitHub Developer Settings'e Giriş

1. **GitHub'da oturum açın**
   - https://github.com adresine gidin
   - Hesabınızla giriş yapın

2. **Settings sayfasına gidin**
   - Sağ üst köşedeki profil fotoğrafınıza tıklayın
   - Dropdown menüden **"Settings"** seçin
   - Ya da direkt: https://github.com/settings/profile

3. **Developer settings'e erişin**
   - Sol menüden en alta scroll edin
   - **"Developer settings"** linkine tıklayın
   - Ya da direkt: https://github.com/settings/developers

### Adım 2: OAuth Apps Sayfasına Giriş

1. Sol menüden **"OAuth Apps"** sekmesine tıklayın
   - URL: https://github.com/settings/developers

2. **"New OAuth App"** butonuna tıklayın
   - Sağ üst köşede yeşil bir buton

### Adım 3: OAuth App Bilgilerini Doldurma

Form alanlarını aşağıdaki gibi doldurun:

#### Application name
```
Flutter Test Coverage Sentinel
```
**Not**: İstediğiniz bir isim verebilirsiniz, bu isim kullanıcılara authorization ekranında gösterilir.

#### Homepage URL

**Development için:**
```
http://localhost:5173
```

**Production için:**
```
https://yourdomain.com
```
**Örnek**: `https://sentinel.mycompany.com`

**Not**: Domain adınızı buraya yazın. Alt domain kullanıyorsanız tam adresi yazın.

#### Application description (Opsiyonel)
```
Automated test coverage analysis tool for Flutter/Dart projects. 
Analyzes repository structure, extracts functions, and calculates 
test coverage percentage.
```

#### Authorization callback URL

**ÇOK ÖNEMLİ**: Bu URL tam olarak doğru olmalıdır!

**Development için:**
```
http://localhost:3000/api/v1/auth/github/callback
```

**Production için:**
```
https://yourdomain.com/api/v1/auth/github/callback
```

**Dikkat Edilmesi Gerekenler:**
- ✅ Protocol: `https://` (production) veya `http://` (development)
- ✅ Domain: Tam domain adınız (örn: `sentinel.mycompany.com`)
- ✅ Path: `/api/v1/auth/github/callback` (backend API prefix ile başlamalı)
- ❌ Trailing slash yok: `/callback/` değil `/callback`
- ❌ Port numarası production'da yok (Nginx handle eder)

**Örnek Doğru URL'ler:**
```
✅ https://sentinel.example.com/api/v1/auth/github/callback
✅ https://api.example.com/api/v1/auth/github/callback
✅ http://localhost:3000/api/v1/auth/github/callback
```

**Örnek Yanlış URL'ler:**
```
❌ https://yourdomain.com/auth/github/callback  (api/v1 eksik)
❌ https://yourdomain.com/api/v1/auth/github/callback/  (trailing slash)
❌ http://yourdomain.com/api/v1/auth/github/callback  (production'da http)
❌ https://yourdomain.com:3000/api/v1/auth/github/callback  (port numarası)
```

### Adım 4: Uygulamayı Kaydetme

1. **"Register application"** butonuna tıklayın (yeşil buton, sayfanın altında)

2. Başarılı olursa uygulama detay sayfasına yönlendirilirsiniz

---

## Credentials Alma

### Client ID

Uygulama oluşturulduktan hemen sonra **Client ID** görünür olacaktır.

**Görünüm:**
```
Client ID: Iv1.a1b2c3d4e5f6g7h8
```

**İşlem:**
1. Client ID'yi **kopyalayın**
2. Güvenli bir yere (örn: not defteri) yapıştırın
3. Backend `.env` dosyasında kullanacaksınız

### Client Secret

**ÇOK ÖNEMLİ**: Client Secret sadece bir kez gösterilir!

1. **"Generate a new client secret"** butonuna tıklayın

2. Secret oluşturulacak ve **sadece bu sefer gösterilecek**
   ```
   Client Secret: 1234567890abcdef1234567890abcdef12345678
   ```

3. **Hemen kopyalayın!** Secret'ı kopyalamazsanız tekrar göremezsiniz ve yeni bir tane oluşturmanız gerekir.

4. Güvenli bir yere yapıştırın (password manager önerilir)

5. Backend `.env` dosyasında kullanacaksınız

### Client Secret Kaybettiyseniz

Eğer secret'ı kopyalamayı unuttuysanız:

1. GitHub OAuth App sayfasına geri dönün
2. Eski secret'ı **"Revoke"** edin
3. **"Generate a new client secret"** ile yeni bir tane oluşturun
4. Yeni secret'ı kopyalayın ve kaydedin

**Not**: Eski secret revoke edildiğinde artık çalışmaz!

---

## Backend Yapılandırması

### 1. Environment Variables (.env)

Backend'in `.env` dosyasını düzenleyin:

```bash
cd ~/flutter-sentinel/backend
nano .env
```

**Development için:**
```env
# GitHub OAuth
GITHUB_CLIENT_ID=Iv1.a1b2c3d4e5f6g7h8
GITHUB_CLIENT_SECRET=1234567890abcdef1234567890abcdef12345678
GITHUB_CALLBACK_URL=http://localhost:3000/api/v1/auth/github/callback
```

**Production için:**
```env
# GitHub OAuth
GITHUB_CLIENT_ID=Iv1.a1b2c3d4e5f6g7h8
GITHUB_CLIENT_SECRET=1234567890abcdef1234567890abcdef12345678
GITHUB_CALLBACK_URL=https://yourdomain.com/api/v1/auth/github/callback
```

### 2. Auth Controller Güncelleme

Backend'in `auth.controller.ts` dosyasında frontend redirect URL'ini güncelleyin:

```bash
nano ~/flutter-sentinel/backend/src/auth/auth.controller.ts
```

**Mevcut kod (23. satır civarı):**
```typescript
res.redirect(`http://localhost:5173/auth/callback?token=${data.access_token}`);
```

**Development için (değişiklik gerekmez):**
```typescript
res.redirect(`http://localhost:5173/auth/callback?token=${data.access_token}`);
```

**Production için:**
```typescript
res.redirect(`https://yourdomain.com/auth/callback?token=${data.access_token}`);
```

**Alternatif: Environment Variable Kullanımı (Önerilen)**

Daha esnek bir yaklaşım için `.env` dosyasına frontend URL ekleyin:

```env
FRONTEND_URL=https://yourdomain.com
```

`app.module.ts` validation'a ekleyin:
```typescript
FRONTEND_URL: Joi.string().uri().required(),
```

`auth.controller.ts` güncelleyin:
```typescript
import { ConfigService } from '@nestjs/config';

export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Get('github/callback')
  @UseGuards(GitHubAuthGuard)
  async githubLoginCallback(@Req() req: any, @Res() res: any) {
    const data = await this.authService.login(req.user);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    res.redirect(`${frontendUrl}/auth/callback?token=${data.access_token}`);
  }
}
```

### 3. Build ve Restart

```bash
cd ~/flutter-sentinel/backend

# Build
npm run build

# Restart (Development)
npm run start:dev

# Restart (Production with PM2)
pm2 restart flutter-sentinel-backend
```

---

## Frontend Yapılandırması

### 1. Environment Variables (.env)

Frontend'in `.env` dosyasını oluşturun/düzenleyin:

```bash
cd ~/flutter-sentinel/frontend
nano .env
```

**Development için:**
```env
VITE_API_URL=http://localhost:3000/api/v1
```

**Production için:**
```env
VITE_API_URL=https://yourdomain.com/api/v1
```

### 2. Auth Service

`frontend/src/services/auth.service.ts` dosyası zaten hazır:

```typescript
import apiClient from './api.client';

export const authService = {
  login: () => {
    // Backend OAuth endpoint'ine redirect
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/github`;
  },

  getProfile: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }
};
```

### 3. Auth Callback Page

`frontend/src/pages/AuthCallback.tsx` dosyası token'ı alır ve kaydeder:

```typescript
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Token'ı localStorage'a kaydet
      localStorage.setItem('accessToken', token);
      // Dashboard'a yönlendir
      navigate('/dashboard', { replace: true });
    } else {
      // Token yoksa login'e geri gönder
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate]);

  return <div>Authenticating...</div>;
}
```

### 4. Build

```bash
cd ~/flutter-sentinel/frontend

# Build
npm run build
```

---

## Development vs Production

### Development Setup

**GitHub OAuth App:**
- Homepage URL: `http://localhost:5173`
- Callback URL: `http://localhost:3000/api/v1/auth/github/callback`

**Backend `.env`:**
```env
GITHUB_CALLBACK_URL=http://localhost:3000/api/v1/auth/github/callback
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:3000/api/v1
```

**Auth Controller:**
```typescript
res.redirect(`http://localhost:5173/auth/callback?token=${data.access_token}`);
```

### Production Setup

**GitHub OAuth App:**
- Homepage URL: `https://yourdomain.com`
- Callback URL: `https://yourdomain.com/api/v1/auth/github/callback`

**Backend `.env`:**
```env
GITHUB_CALLBACK_URL=https://yourdomain.com/api/v1/auth/github/callback
```

**Frontend `.env`:**
```env
VITE_API_URL=https://yourdomain.com/api/v1
```

**Auth Controller:**
```typescript
res.redirect(`https://yourdomain.com/auth/callback?token=${data.access_token}`);
```

### İki Ortam İçin Farklı OAuth Apps

**Öneri**: Development ve production için ayrı OAuth Apps oluşturun:

1. **Development OAuth App**
   - Name: Flutter Sentinel (Development)
   - Callback: `http://localhost:3000/api/v1/auth/github/callback`
   - Client ID/Secret: Development `.env` dosyasında

2. **Production OAuth App**
   - Name: Flutter Sentinel
   - Callback: `https://yourdomain.com/api/v1/auth/github/callback`
   - Client ID/Secret: Production `.env` dosyasında

**Avantajları:**
- Development ve production credentials ayrı
- Development'ta test yaparken production'ı etkilemez
- Güvenlik: Production secrets development'ta expose olmaz

---

## OAuth Flow Testi

### 1. Backend Test

```bash
# Backend çalışıyor mu?
curl http://localhost:3000/api/v1

# OAuth endpoint test (redirect döner)
curl -I http://localhost:3000/api/v1/auth/github
```

**Beklenen çıktı:**
```
HTTP/1.1 302 Found
Location: https://github.com/login/oauth/authorize?client_id=...
```

### 2. Tarayıcıda Test

#### Development:
1. Frontend'i başlat: `npm run dev` (http://localhost:5173)
2. Backend'i başlat: `npm run start:dev`
3. http://localhost:5173/login adresine git
4. "Login with GitHub" butonuna tıkla

#### Production:
1. https://yourdomain.com/login adresine git
2. "Login with GitHub" butonuna tıkla

### 3. OAuth Flow Adımları

**Adım 1**: GitHub'a yönlendirme
- URL: `https://github.com/login/oauth/authorize?client_id=...`
- GitHub login sayfası açılır

**Adım 2**: GitHub'da oturum açma
- Kullanıcı GitHub credentials'ını girer
- İki faktörlü doğrulama varsa kodu girer

**Adım 3**: Uygulama yetkilendirme
- İlk kez giriş yapılıyorsa authorization ekranı gösterilir
- "Authorize YourApp" butonuna tıkla

**Adım 4**: Callback
- GitHub kullanıcıyı callback URL'e yönlendirir
- Backend token oluşturur

**Adım 5**: Frontend redirect
- Backend kullanıcıyı frontend'e token ile yönlendirir
- Frontend token'ı kaydeder ve dashboard'a gider

### 4. Token Kontrolü

Browser DevTools Console'da:
```javascript
// Token var mı?
localStorage.getItem('accessToken')

// Token decode (jwt.io'da veya)
JSON.parse(atob(localStorage.getItem('accessToken').split('.')[1]))
```

### 5. API Test

```bash
# Token ile API çağrısı
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/auth/me
```

**Beklenen çıktı:**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "username": "yourusername"
  },
  "error": null
}
```

---

## Troubleshooting

### Problem 1: "The redirect_uri MUST match the registered callback URL"

**Sebep**: GitHub'daki callback URL ile backend'deki `GITHUB_CALLBACK_URL` eşleşmiyor.

**Çözüm:**
1. GitHub OAuth App settings'i aç
2. "Authorization callback URL" alanını kontrol et
3. Backend `.env` dosyasındaki `GITHUB_CALLBACK_URL` ile karşılaştır
4. Birebir aynı olmalı (protocol, domain, path, trailing slash)

**Örnek Eşleşme:**
```
GitHub: https://example.com/api/v1/auth/github/callback
.env:   GITHUB_CALLBACK_URL=https://example.com/api/v1/auth/github/callback
✅ Eşleşiyor
```

**Örnek Eşleşmeme:**
```
GitHub: https://example.com/api/v1/auth/github/callback
.env:   GITHUB_CALLBACK_URL=https://example.com/api/v1/auth/github/callback/
❌ Eşleşmiyor (trailing slash)
```

### Problem 2: "Bad credentials" veya 401 Unauthorized

**Sebep**: Client Secret yanlış veya geçersiz.

**Çözüm:**
1. `.env` dosyasını aç
2. `GITHUB_CLIENT_SECRET` değerini kontrol et
3. Copy-paste sırasında extra space veya character eklenmiş olabilir
4. GitHub'dan yeni bir secret oluştur
5. `.env` dosyasını güncelle
6. Backend'i restart et

```bash
# .env dosyasını kontrol et
cat ~/flutter-sentinel/backend/.env | grep GITHUB_CLIENT_SECRET

# Backend restart
pm2 restart flutter-sentinel-backend
```

### Problem 3: Frontend'e Redirect Olmuyor

**Sebep**: `auth.controller.ts` dosyasında redirect URL yanlış.

**Kontrol:**
```bash
cat ~/flutter-sentinel/backend/src/auth/auth.controller.ts | grep redirect
```

**Olması gereken:**
```typescript
res.redirect(`https://yourdomain.com/auth/callback?token=${data.access_token}`);
```

**Düzelt ve rebuild:**
```bash
cd ~/flutter-sentinel/backend
nano src/auth/auth.controller.ts
npm run build
pm2 restart flutter-sentinel-backend
```

### Problem 4: "Application is not owned by you" Hatası

**Sebep**: Başka birinin OAuth App'ini kullanmaya çalışıyorsunuz.

**Çözüm**: Kendi GitHub hesabınızda yeni bir OAuth App oluşturun.

### Problem 5: CORS Hatası

**Sebep**: Backend CORS yapılandırması eksik.

**Çözüm**: `main.ts` dosyasına CORS ekleyin:

```typescript
// main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
});
```

### Problem 6: Token localStorage'da Ama API 401 Döndürüyor

**Sebep**: Token expired veya geçersiz.

**Kontrol:**
```javascript
// Browser console
const token = localStorage.getItem('accessToken');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Expires:', new Date(payload.exp * 1000));
```

**Çözüm:**
- Token expired ise tekrar login ol
- JWT_SECRET backend'de değişti ise tüm kullanıcılar tekrar login olmalı

### Problem 7: SSL Certificate Hatası (Production)

**Sebep**: HTTPS kullanırken SSL sertifikası geçersiz.

**Çözüm:**
1. Let's Encrypt sertifikası kurulu mu kontrol et
2. Sertifika yenilenmesi gerekiyor olabilir

```bash
sudo certbot certificates
sudo certbot renew --dry-run
```

---

## Güvenlik Best Practices

### 1. Client Secret Güvenliği

- ❌ **Asla** client secret'ı git repository'e commit etme
- ✅ `.env` dosyasını `.gitignore`'a ekle
- ✅ Secret'ı environment variable olarak sakla
- ✅ Production secret'ını password manager'da sakla

```bash
# .gitignore dosyasına ekle
echo ".env" >> .gitignore
```

### 2. Environment Dosyası İzinleri

```bash
# Sadece owner okuyabilsin
chmod 600 ~/flutter-sentinel/backend/.env

# Kontrol et
ls -la ~/flutter-sentinel/backend/.env
# -rw------- 1 sentinel sentinel ...
```

### 3. Secret Rotation

Client secret'ı düzenli olarak değiştirin (3-6 ayda bir):

1. GitHub'da yeni bir secret oluştur
2. Hem eski hem yeni secret'ı backend'de tut (geçiş dönemi için)
3. Deploy et
4. Eski secret'ı revoke et

### 4. Rate Limiting

OAuth endpoint'lerine rate limiting ekleyin (Nginx):

```nginx
limit_req_zone $binary_remote_addr zone=oauth_limit:10m rate=5r/m;

location /api/v1/auth/ {
    limit_req zone=oauth_limit burst=2 nodelay;
    # ...
}
```

### 5. JWT Token Security

- ✅ Token expire time'ı kısa tutun (1 saat)
- ✅ Refresh token mekanizması ekleyin
- ✅ JWT_SECRET güçlü olsun (32+ karakter)

```bash
# Güçlü JWT secret oluştur
openssl rand -base64 32
```

### 6. HTTPS Zorunluluğu

Production'da mutlaka HTTPS kullanın:

- ❌ `http://` callback URL
- ✅ `https://` callback URL

### 7. Logging

OAuth hatalarını loglayın ama sensitive data loglama:

```typescript
// ❌ Yanlış
logger.log(`Token: ${token}`);

// ✅ Doğru
logger.log(`User authenticated: ${user.id}`);
```

### 8. Scope Limitleme

GitHub OAuth'da sadece gerekli scope'ları isteyin:

```typescript
// github.strategy.ts
scope: ['user:email', 'read:user']  // Minimal scope
```

---

## Ek Kaynaklar

### GitHub Dokümanları
- [GitHub OAuth Apps](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Authorizing OAuth Apps](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps)
- [Scopes for OAuth Apps](https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps)

### Test Araçları
- [JWT Decoder](https://jwt.io/)
- [OAuth Playground](https://www.oauth.com/playground/)
- [Postman OAuth 2.0](https://learning.postman.com/docs/sending-requests/authorization/#oauth-20)

### Güvenlik
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

## Hızlı Referans

### Environment Variables
```env
# Backend .env
GITHUB_CLIENT_ID=Iv1.xxxxxxxxxxxxxxxx
GITHUB_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_CALLBACK_URL=https://yourdomain.com/api/v1/auth/github/callback
FRONTEND_URL=https://yourdomain.com

# Frontend .env
VITE_API_URL=https://yourdomain.com/api/v1
```

### OAuth URL'leri
```
Login initiation:    /api/v1/auth/github
Callback:           /api/v1/auth/github/callback
Profile endpoint:    /api/v1/auth/me
Frontend callback:   /auth/callback
```

### Test Komutları
```bash
# Backend OAuth endpoint test
curl -I http://localhost:3000/api/v1/auth/github

# Profile endpoint test (token ile)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/auth/me

# Token kontrolü (browser console)
localStorage.getItem('accessToken')
```

---

**✅ GitHub OAuth kurulumu tamamlandı! Artık kullanıcılar GitHub hesapları ile giriş yapabilir.**
