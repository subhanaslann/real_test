import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Code2, 
  FileCode, 
  CheckCircle, 
  AlertTriangle, 
  FolderTree,
  ArrowLeft,
  Info,
  Terminal,
  FileCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Guidelines() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900">Kullanım Kılavuzu</span>
          </div>
          <Link to="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard'a Dön
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl p-6 space-y-6">
        {/* Hero Section */}
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Info className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                  Test Kapsama Analizi Hoşgeldiniz
                </h1>
                <p className="text-slate-700 leading-relaxed">
                  Bu platform, <strong>TypeScript</strong> ve <strong>Dart</strong> projelerinizin test kapsamını otomatik olarak analiz eder. 
                  Hangi fonksiyonların test edildiğini görün ve kod kalitenizi artırın.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Desteklenen Diller */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-blue-600" />
              <CardTitle>Desteklenen Programlama Dilleri</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* TypeScript */}
            <div className="border rounded-lg p-4 bg-blue-50/50 border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <FileCode className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">TypeScript</h3>
                    <p className="text-sm text-slate-600">JavaScript'in tip güvenli versiyonu</p>
                  </div>
                </div>
                <Badge variant="success" className="text-xs">Aktif</Badge>
              </div>
              
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-slate-700 mb-2">📄 Desteklenen Dosya Uzantıları:</p>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="font-mono">.ts</Badge>
                    <Badge variant="outline" className="font-mono">.tsx</Badge>
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-slate-700 mb-2">🧪 Test Dosyası İsimlendirme:</p>
                  <div className="bg-white rounded-md p-3 border border-slate-200 font-mono text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="text-slate-700">user.service<strong className="text-blue-600">.spec.ts</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="text-slate-700">user.service<strong className="text-blue-600">.test.ts</strong></span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-slate-700 mb-2">✅ Analiz Edilen Yapılar:</p>
                  <ul className="space-y-1 text-slate-600">
                    <li>• Function declarations</li>
                    <li>• Class methods (getter/setter dahil)</li>
                    <li>• Arrow functions</li>
                    <li>• Test blocks (describe, it, test)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Dart */}
            <div className="border rounded-lg p-4 bg-cyan-50/50 border-cyan-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-cyan-600 p-2 rounded-lg">
                    <Terminal className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">Dart</h3>
                    <p className="text-sm text-slate-600">Flutter ve Dart uygulamaları için</p>
                  </div>
                </div>
                <Badge variant="success" className="text-xs">Aktif</Badge>
              </div>
              
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-slate-700 mb-2">📄 Desteklenen Dosya Uzantısı:</p>
                  <Badge variant="outline" className="font-mono">.dart</Badge>
                </div>

                <div>
                  <p className="font-semibold text-slate-700 mb-2">🧪 Test Dosyası İsimlendirme:</p>
                  <div className="bg-white rounded-md p-3 border border-slate-200 font-mono text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="text-slate-700">user_service<strong className="text-cyan-600">_test.dart</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <AlertTriangle className="h-3 w-3 text-amber-600" />
                      <span>Not: Alt çizgi (_test) kullanımı zorunludur</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-slate-700 mb-2">✅ Analiz Edilen Yapılar:</p>
                  <ul className="space-y-1 text-slate-600">
                    <li>• Function declarations</li>
                    <li>• Class methods</li>
                    <li>• Extension ve Mixin metodları</li>
                    <li>• Test widget'ları (test, testWidgets, group)</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dosya Yapısı */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FolderTree className="h-5 w-5 text-green-600" />
              <CardTitle>Önerilen Proje Yapısı</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-blue-600" />
                TypeScript Projesi Örneği
              </h3>
              <div className="bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre>{`my-project/
├── src/
│   ├── services/
│   │   ├── user.service.ts          ← Kaynak dosya
│   │   └── user.service.spec.ts     ← Test dosyası ✓
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   └── auth.controller.test.ts  ← Test dosyası ✓
│   └── utils/
│       ├── helper.ts
│       └── helper.spec.ts
└── test/                             ← Alternatif klasör
    └── user.service.test.ts          ✓ Bu da çalışır`}</pre>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-cyan-600" />
                Dart/Flutter Projesi Örneği
              </h3>
              <div className="bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre>{`my_flutter_app/
├── lib/
│   ├── services/
│   │   └── user_service.dart        ← Kaynak dosya
│   ├── models/
│   │   └── user_model.dart
│   └── widgets/
│       └── custom_button.dart
└── test/                             ← Test klasörü
    ├── services/
    │   └── user_service_test.dart   ← Test dosyası ✓
    ├── models/
    │   └── user_model_test.dart     ✓
    └── widgets/
        └── custom_button_test.dart  ✓`}</pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Önemli Notlar */}
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-amber-900">Önemli Uyarılar ve İpuçları</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-3">
                <div className="bg-amber-200 rounded-full p-1 mt-0.5">
                  <CheckCircle className="h-3 w-3 text-amber-700" />
                </div>
                <div>
                  <strong className="text-amber-900">Test dosyaları otomatik eşleştiriliyor:</strong>
                  <p className="text-slate-600 mt-1">
                    Sistem, kaynak dosyalarınızı isimlendirme konvansiyonuna göre test dosyalarıyla eşleştirir. 
                    Doğru isimlendirme kritik önem taşır!
                  </p>
                </div>
              </li>
              
              <li className="flex items-start gap-3">
                <div className="bg-amber-200 rounded-full p-1 mt-0.5">
                  <CheckCircle className="h-3 w-3 text-amber-700" />
                </div>
                <div>
                  <strong className="text-amber-900">Göz ardı edilen dosyalar:</strong>
                  <p className="text-slate-600 mt-1">
                    <code className="bg-white px-2 py-0.5 rounded text-xs">node_modules/</code>, 
                    <code className="bg-white px-2 py-0.5 rounded text-xs mx-1">dist/</code>, 
                    <code className="bg-white px-2 py-0.5 rounded text-xs">build/</code>, 
                    <code className="bg-white px-2 py-0.5 rounded text-xs mx-1">*.d.ts</code> gibi dosyalar otomatik olarak atlanır.
                  </p>
                </div>
              </li>
              
              <li className="flex items-start gap-3">
                <div className="bg-amber-200 rounded-full p-1 mt-0.5">
                  <CheckCircle className="h-3 w-3 text-amber-700" />
                </div>
                <div>
                  <strong className="text-amber-900">Private GitHub repoları:</strong>
                  <p className="text-slate-600 mt-1">
                    GitHub OAuth ile giriş yaptıktan sonra, private repolarınız da analiz edilebilir.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div className="bg-amber-200 rounded-full p-1 mt-0.5">
                  <CheckCircle className="h-3 w-3 text-amber-700" />
                </div>
                <div>
                  <strong className="text-amber-900">Analiz süresi:</strong>
                  <p className="text-slate-600 mt-1">
                    Büyük projeler için analiz birkaç dakika sürebilir. Sayfa otomatik olarak güncellenir.
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Kapsama Skorlama */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-purple-600" />
              Test Kapsama Skorlama Sistemi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-700 text-sm">
              Sistem, fonksiyonlarınızın test dosyalarında nasıl referans edildiğine göre puan verir:
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Badge className="bg-green-600 text-white font-mono">+50</Badge>
                <div className="text-sm">
                  <strong className="text-green-900">Doğrudan Çağrı:</strong>
                  <p className="text-green-700">Fonksiyon test içinde çağrılıyor (en güçlü kanıt)</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Badge className="bg-blue-600 text-white font-mono">+30</Badge>
                <div className="text-sm">
                  <strong className="text-blue-900">Test Açıklamasında Geçiyor:</strong>
                  <p className="text-blue-700">Fonksiyon adı describe/it bloklarında belirtilmiş</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <Badge className="bg-slate-600 text-white font-mono">+10</Badge>
                <div className="text-sm">
                  <strong className="text-slate-900">Metin Eşleşmesi:</strong>
                  <p className="text-slate-700">Fonksiyon adı test dosyasında rastgele geçiyor</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-purple-900">
                <strong>💡 İpucu:</strong> Bir fonksiyon birden fazla şekilde referans ediliyorsa, 
                puanlar toplanır (maksimum 100 puan).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer CTA */}
        <Card className="border-blue-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Hemen Başlayın!</h2>
              <p className="text-blue-100">
                GitHub repolarınızı seçin veya manuel URL girerek ilk analizinizi başlatın.
              </p>
              <Link to="/dashboard">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  Dashboard'a Git
                  <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Bottom Spacing */}
      <div className="h-8"></div>
    </div>
  );
}
