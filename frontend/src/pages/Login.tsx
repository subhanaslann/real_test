import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/services/auth.service';
import { Github, Shield, Zap, BarChart2 } from 'lucide-react';

export default function Login() {
  const handleLogin = () => {
    authService.login();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-lg shadow-2xl border-slate-100 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-600" />
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mb-2">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-slate-900">Sentinel</CardTitle>
            <CardDescription className="text-lg mt-2 text-slate-600">
              Flutter Test Coverage Analyzer
            </CardDescription>
          </div>
          <p className="text-sm text-slate-500 px-4">
            GitHub repolarınızı saniyeler içinde analiz edin, test kapsamınızı görselleştirin.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-8 px-8 pb-8">
          <div className="grid gap-6">
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900">Güvenli</h3>
                <p className="text-sm text-slate-500">Kodlarınız sunucularımızda saklanmaz, analiz sonrası silinir.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900">Hızlı</h3>
                <p className="text-sm text-slate-500">BullMQ tabanlı kuyruk sistemi ile anında sonuç.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <BarChart2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900">Detaylı</h3>
                <p className="text-sm text-slate-500">Satır satır coverage raporu ve görselleştirmeler.</p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button 
              onClick={handleLogin} 
              className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Github className="mr-2 h-5 w-5" />
              GitHub ile Giriş Yap
            </Button>
            <p className="text-xs text-center text-slate-400 mt-4">
              By clicking continue, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
