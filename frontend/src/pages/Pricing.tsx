import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft, Crown, Zap, Sparkles, Infinity } from 'lucide-react';
// import { apiClient } from '@/services/api.client'; // Beta döneminde kullanılmıyor

const plans = [
  {
    tier: 'FREE',
    name: 'Free',
    price: 0,
    credits: 5,
    icon: Sparkles,
    color: 'from-slate-500 to-slate-600',
    features: [
      '5 analizler/ay',
      'Public repo desteği',
      'Temel özellikler',
      'Community support',
    ],
  },
  {
    tier: 'STARTER',
    name: 'Starter',
    price: 99,
    credits: 25,
    icon: Zap,
    color: 'from-blue-500 to-indigo-600',
    popular: true,
    features: [
      '25 analiz/ay',
      'Private repo desteği',
      'Gelişmiş özellikler',
      'Email support',
    ],
  },
  {
    tier: 'PRO',
    name: 'Pro',
    price: 299,
    credits: 100,
    icon: Crown,
    color: 'from-purple-500 to-pink-600',
    features: [
      '100 analiz/ay',
      'Private repo desteği',
      'Öncelikli işlem',
      'Priority email support',
      'Gelişmiş analitikler',
    ],
  },
  {
    tier: 'UNLIMITED',
    name: 'Unlimited',
    price: 999,
    credits: 'Sınırsız',
    icon: Infinity,
    color: 'from-amber-500 to-orange-600',
    features: [
      'Sınırsız analiz',
      'Private repo desteği',
      'En yüksek öncelik',
      '24/7 support',
      'Özel entegrasyonlar',
      'Dedicated support',
    ],
  },
];

export default function Pricing() {
  // Beta döneminde tüm özellikler ücretsiz olduğu için upgrade fonksiyonu devre dışı
  // const navigate = useNavigate();
  // const [loading, setLoading] = useState<string | null>(null);
  // const handleUpgrade = async (tier: string) => { ... };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link to="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Tüm Kullanıcılar İçin Sınırsız!
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-4">
            Şu anda tüm özellikler <strong>ücretsiz ve sınırsız</strong> olarak sunulmaktadır.
          </p>
          <div className="bg-green-100 border border-green-300 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-green-800 font-medium">
              🎉 Beta döneminde tüm kullanıcılar sınırsız analiz yapabilir!
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.tier}
                className={`relative overflow-hidden transition-all hover:shadow-2xl ${
                  plan.popular ? 'border-blue-500 border-2 scale-105' : 'hover:scale-105'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <Badge className="rounded-tl-none rounded-br-none bg-blue-500">
                      Popüler
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-slate-900">
                        ₺{plan.price}
                      </span>
                      <span className="text-slate-600">/ay</span>
                    </div>
                    <div className="mt-2 text-sm font-medium text-blue-600">
                      {typeof plan.credits === 'number' ? `${plan.credits} analiz` : plan.credits}
                    </div>
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant="outline"
                    disabled
                  >
                    Beta - Ücretsiz
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Feature Comparison */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Özellik Karşılaştırması</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">Özellik</th>
                    <th className="text-center p-4 font-semibold">Free</th>
                    <th className="text-center p-4 font-semibold bg-blue-50">Starter</th>
                    <th className="text-center p-4 font-semibold">Pro</th>
                    <th className="text-center p-4 font-semibold">Unlimited</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-4">Aylık Analiz</td>
                    <td className="text-center p-4">5</td>
                    <td className="text-center p-4 bg-blue-50">25</td>
                    <td className="text-center p-4">100</td>
                    <td className="text-center p-4">∞</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Private Repo</td>
                    <td className="text-center p-4">❌</td>
                    <td className="text-center p-4 bg-blue-50">✅</td>
                    <td className="text-center p-4">✅</td>
                    <td className="text-center p-4">✅</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Öncelikli İşlem</td>
                    <td className="text-center p-4">❌</td>
                    <td className="text-center p-4 bg-blue-50">❌</td>
                    <td className="text-center p-4">✅</td>
                    <td className="text-center p-4">✅</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Support</td>
                    <td className="text-center p-4">Community</td>
                    <td className="text-center p-4 bg-blue-50">Email</td>
                    <td className="text-center p-4">Priority</td>
                    <td className="text-center p-4">24/7</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Sorularınız mı var?</h2>
          <p className="text-slate-600 mb-6">
            Planlar aylık olarak otomatik yenilenir. İstediğiniz zaman iptal edebilir veya değiştirebilirsiniz.
          </p>
          <Link to="/guidelines">
            <Button variant="outline">
              Kullanım Kılavuzunu İnceleyin
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
